import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  FileText,
  Globe2,
  ImagePlus,
  Layers3,
  Loader2,
  Menu,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";

import { getImageUrl } from "../../services/api";
import {
  buildAdminPagePayload,
  createAdminPage,
  createDefaultFaqItem,
  createDefaultPage,
  createDefaultPageSection,
  createPageSlug,
  deleteAdminPage,
  getAdminPages,
  getPageParentId,
  isAdminPagesAuthError,
  normalizeAdminPages,
  normalizePageForForm,
  updateAdminPage,
} from "../../services/adminPages";
import {
  deleteAdminImage,
  extractSingleUploadedImage,
  uploadAdminSingleImage,
} from "../../services/adminUploads";

const createClientId = (prefix = "item") => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const getFilenameFromPath = (value = "") =>
  String(value).split("?")[0].split("#")[0].split("/").filter(Boolean).pop() || "";

const validateImageFile = (file) => {
  if (!file) return "Please select an image.";
  if (!String(file.type || "").startsWith("image/")) return "Please select a valid image file.";
  if (file.size > 5 * 1024 * 1024) return "Image must be 5 MB or smaller.";
  return "";
};

const hasParentPage = (page) => Boolean(getPageParentId(page));

// ========================================
// AUTOMATIC PAGE ROUTE
//
// Client route manually نہیں لکھے گا.
//
// Custom:
// privacy-policy
// → /page/privacy-policy
//
// System:
// about
// → /about
// ========================================

const getAutomaticPageRoute = ({
  title = "",
  slug = "",
  isSystemPage = false,
  systemKey = "",
} = {}) => {
  const safeSlug =
    createPageSlug(
      slug || title
    );

  if (!safeSlug) {
    return "";
  }

  if (isSystemPage) {
    const safeSystemKey =
      createPageSlug(
        systemKey ||
          safeSlug
      );

    return safeSystemKey
      ? `/${safeSystemKey}`
      : "";
  }

  return `/page/${safeSlug}`;
};

const preparePageForEditor = (page = {}) => {
  const normalized = normalizePageForForm(page);
  return {
    ...normalized,
    _isNew: false,
    _slugManual: true,

    routePath:
      getAutomaticPageRoute({
        title:
          normalized.title,
        slug:
          normalized.slug,
        isSystemPage:
          normalized.isSystemPage,
        systemKey:
          normalized.systemKey,
      }),

    hero: { ...normalized.hero, _newUploadFilename: "" },
    sections: normalized.sections.map((section) => ({
      ...section,
      _clientId: section._id || createClientId("section"),
      _newUploadFilename: "",
    })),
    faqItems: normalized.faqItems.map((item) => ({
      ...item,
      _clientId: item._id || createClientId("faq"),
    })),
    _socialImageUploadFilename: "",
  };
};

const createNewEditorPage = () => {
  const page = createDefaultPage();
  return {
    ...page,
    _isNew: true,
    _slugManual: false,

    routePath:
      getAutomaticPageRoute({
        title:
          page.title,
        slug:
          page.slug,
        isSystemPage:
          page.isSystemPage,
        systemKey:
          page.systemKey,
      }),

    hero: { ...page.hero, _newUploadFilename: "" },
    sections: [],
    faqItems: [],
    _socialImageUploadFilename: "",
  };
};

const sortPagesForList = (pages) =>
  [...pages].sort((a, b) => {
    const aParent = hasParentPage(a);
    const bParent = hasParentPage(b);
    if (aParent !== bParent) return aParent ? 1 : -1;
    const order = Number(a.menuOrder || 0) - Number(b.menuOrder || 0);
    if (order !== 0) return order;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });

const FieldLabel = ({ children }) => (
  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.08em] text-gray-500">
    {children}
  </label>
);

const TextInput = ({ label, value, onChange, placeholder = "", type = "text", disabled = false, mono = false }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input
      type={type}
      value={value ?? ""}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#172033] outline-none transition placeholder:text-gray-300 focus:border-[#6f9a37] focus:ring-2 focus:ring-[#6f9a37]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${mono ? "font-mono" : ""}`}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder = "", rows = 5 }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <textarea
      rows={rows}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-[#172033] outline-none transition placeholder:text-gray-300 focus:border-[#6f9a37] focus:ring-2 focus:ring-[#6f9a37]/10"
    />
  </div>
);

const SelectInput = ({ label, value, onChange, children, disabled = false }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#6f9a37] focus:ring-2 focus:ring-[#6f9a37]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
    >
      {children}
    </select>
  </div>
);

const Toggle = ({ label, description, checked, onChange, disabled = false }) => (
  <label className={`flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
    <span>
      <span className="block text-sm font-bold text-[#172033]">{label}</span>
      {description && <span className="mt-0.5 block text-xs leading-5 text-gray-400">{description}</span>}
    </span>
    <span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#6f9a37]" : "bg-gray-200"}`}>
      <input type="checkbox" checked={Boolean(checked)} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"}`} />
    </span>
  </label>
);

const SectionHeader = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div className="flex items-start gap-3">
      {Icon && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5e6] text-[#6f9a37]"><Icon size={19} /></div>}
      <div>
        <h2 className="text-base font-black text-[#172033]">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-gray-400">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

const ImageField = ({ label, image, alt = "", uploading = false, onUpload, onRemove, previewClassName = "h-[190px]" }) => {
  const imageUrl = image ? getImageUrl(image) : "";
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={`relative flex ${previewClassName} w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50`}>
        {imageUrl ? (
          <img src={imageUrl} alt={alt || label} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-gray-300"><ImagePlus size={34} className="mx-auto" /><p className="mt-2 text-xs font-semibold">No image uploaded</p></div>
        )}
        {uploading && <div className="absolute inset-0 flex items-center justify-center bg-white/90"><Loader2 size={28} className="animate-spin text-[#6f9a37]" /></div>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-xs font-bold text-white ${uploading ? "pointer-events-none opacity-50" : ""}`}>
          <Upload size={14} />{image ? "Replace Image" : "Upload Image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); e.target.value = ""; }} />
        </label>
        {image && <button type="button" onClick={onRemove} disabled={uploading} className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50">Remove Image</button>}
      </div>
    </div>
  );
};

const AdminPagesPage = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [editor, setEditor] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [uploadingKey, setUploadingKey] = useState("");
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeEditorTab, setActiveEditorTab] = useState("details");

  const handleAuthError = (error) => {
    if (isAdminPagesAuthError(error) || error?.status === 401 || error?.status === 403) {
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };

  const loadPages = async ({ showLoader = true, selectId = "" } = {}) => {
    try {
      if (showLoader) setLoading(true);
      setErrorMessage("");
      const response = await getAdminPages();
      const loadedPages = normalizeAdminPages(response);
      setPages(loadedPages);

      const preferredId = selectId || selectedPageId;
      if (preferredId) {
        const selected = loadedPages.find((page) => page._id === preferredId);
        if (selected) {
          setSelectedPageId(selected._id);
          setEditor(preparePageForEditor(selected));
          setDirty(false);
          return loadedPages;
        }
      }

      if (loadedPages.length > 0) {
        const first = sortPagesForList(loadedPages)[0];
        setSelectedPageId(first._id);
        setEditor(preparePageForEditor(first));
      } else {
        setSelectedPageId("");
        setEditor(null);
      }
      setDirty(false);
      return loadedPages;
    } catch (error) {
      if (handleAuthError(error)) return [];
      setErrorMessage(error?.message || "Failed to load pages.");
      return [];
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => { loadPages(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => {
    const handler = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const sortedPages = useMemo(() => sortPagesForList(pages), [pages]);
  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedPages;
    return sortedPages.filter((page) => [page.title, page.menuLabel, page.slug, page.routePath, page.systemKey].some((value) => String(value || "").toLowerCase().includes(q)));
  }, [sortedPages, search]);

  const mainPageCandidates = useMemo(() => pages
    .filter((page) => !hasParentPage(page) && page._id !== editor?._id)
    .sort((a, b) => Number(a.menuOrder || 0) - Number(b.menuOrder || 0) || String(a.title || "").localeCompare(String(b.title || ""))), [pages, editor?._id]);

  const markDirty = () => { setDirty(true); setSuccessMessage(""); };

  const deleteTemporaryUpload = async (filename) => {
    if (!filename) return;
    try { await deleteAdminImage(filename); } catch { /* non-blocking */ }
  };

  const cleanupEditorUploads = async () => {
    if (!editor) return;
    const filenames = [
      editor.hero?._newUploadFilename,
      editor._socialImageUploadFilename,
      ...(editor.sections || []).map((section) => section._newUploadFilename),
    ].filter(Boolean);
    await Promise.allSettled(filenames.map((filename) => deleteAdminImage(filename)));
  };

  const canDiscardCurrent = async () => {
    if (!dirty) return true;
    if (!window.confirm("Discard unsaved page changes?")) return false;
    await cleanupEditorUploads();
    return true;
  };

  const selectPage = async (page) => {
    if (page._id === selectedPageId && !editor?._isNew) return;
    if (!(await canDiscardCurrent())) return;
    setSelectedPageId(page._id);
    setEditor(preparePageForEditor(page));
    setActiveEditorTab("details");
    setDirty(false); setErrorMessage(""); setSuccessMessage("");
  };

  const startNewPage = async () => {
    if (!(await canDiscardCurrent())) return;
    setSelectedPageId("");
    setEditor(createNewEditorPage());
    setActiveEditorTab("details");
    setDirty(false); setErrorMessage(""); setSuccessMessage("");
  };

  const reloadCurrent = async () => {
    if (!(await canDiscardCurrent())) return;
    if (editor?._isNew) { setEditor(createNewEditorPage()); setDirty(false); return; }
    await loadPages({ selectId: selectedPageId });
  };

  const updateField = (field, value) => { setEditor((current) => ({ ...current, [field]: value })); markDirty(); };
  const updateHero = (field, value) => { setEditor((current) => ({ ...current, hero: { ...current.hero, [field]: value } })); markDirty(); };

  const updateTitle = (value) => {
    setEditor((current) => {
      const nextSlug =
        current._slugManual
          ? current.slug
          : createPageSlug(
              value
            );

      const nextSystemKey =
        current.isSystemPage
          ? current.systemKey ||
            nextSlug
          : "";

      return {
        ...current,

        title:
          value,

        menuLabel:
          current.menuLabel ||
          value,

        slug:
          nextSlug,

        systemKey:
          nextSystemKey,

        routePath:
          getAutomaticPageRoute({
            title:
              value,

            slug:
              nextSlug,

            isSystemPage:
              current.isSystemPage,

            systemKey:
              nextSystemKey,
          }),
      };
    });

    markDirty();
  };

  const updateSlug = (value) => {
    setEditor((current) => {
      const nextSlug =
        createPageSlug(
          value
        );

      const nextSystemKey =
        current.isSystemPage
          ? current.systemKey ||
            nextSlug
          : "";

      return {
        ...current,

        slug:
          nextSlug,

        _slugManual:
          true,

        systemKey:
          nextSystemKey,

        routePath:
          getAutomaticPageRoute({
            title:
              current.title,

            slug:
              nextSlug,

            isSystemPage:
              current.isSystemPage,

            systemKey:
              nextSystemKey,
          }),
      };
    });

    markDirty();
  };

  const updateSystemPage = (
    checked
  ) => {
    setEditor((current) => {
      const slug =
        current.slug ||
        createPageSlug(
          current.title
        );

      const systemKey =
        checked
          ? current.systemKey ||
            slug
          : "";

      return {
        ...current,

        isSystemPage:
          checked,

        pageType:
          checked
            ? "system"
            : "custom",

        systemKey,

        routePath:
          getAutomaticPageRoute({
            title:
              current.title,

            slug,

            isSystemPage:
              checked,

            systemKey,
          }),
      };
    });

    markDirty();
  };

  const updateSystemKey = (
    value
  ) => {
    setEditor((current) => {
      const nextSystemKey =
        createPageSlug(
          value
        );

      return {
        ...current,

        systemKey:
          nextSystemKey,

        routePath:
          getAutomaticPageRoute({
            title:
              current.title,

            slug:
              current.slug,

            isSystemPage:
              current.isSystemPage,

            systemKey:
              nextSystemKey,
          }),
      };
    });

    markDirty();
  };

  const performImageUpload = async ({ file, key, oldTemporaryFilename, onUploaded }) => {
    const validationError = validateImageFile(file);
    if (validationError) { setErrorMessage(validationError); return; }
    try {
      setUploadingKey(key); setErrorMessage(""); setSuccessMessage("");
      const response = await uploadAdminSingleImage(file);
      const uploaded = extractSingleUploadedImage(response);
      const uploadedPath = uploaded?.path || uploaded?.url || "";
      if (!uploadedPath) throw new Error("Image uploaded but no image path was returned.");
      if (oldTemporaryFilename) await deleteTemporaryUpload(oldTemporaryFilename);
      onUploaded(uploadedPath, uploaded?.filename || getFilenameFromPath(uploadedPath));
      markDirty(); setSuccessMessage("Image uploaded. Save the page to publish the change.");
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(error?.message || "Failed to upload image.");
    } finally { setUploadingKey(""); }
  };

  const uploadHeroImage = (file) => performImageUpload({
    file, key: "hero-image", oldTemporaryFilename: editor.hero?._newUploadFilename,
    onUploaded: (path, filename) => setEditor((current) => ({ ...current, hero: { ...current.hero, image: path, _newUploadFilename: filename } })),
  });

  const removeHeroImage = async () => {
    await deleteTemporaryUpload(editor.hero?._newUploadFilename);
    setEditor((current) => ({ ...current, hero: { ...current.hero, image: "", _newUploadFilename: "" } })); markDirty();
  };

  const uploadSocialImage = (file) => performImageUpload({
    file, key: "social-image", oldTemporaryFilename: editor._socialImageUploadFilename,
    onUploaded: (path, filename) => setEditor((current) => ({ ...current, socialImage: path, _socialImageUploadFilename: filename })),
  });

  const removeSocialImage = async () => {
    await deleteTemporaryUpload(editor._socialImageUploadFilename);
    setEditor((current) => ({ ...current, socialImage: "", _socialImageUploadFilename: "" })); markDirty();
  };

  const addSection = (type = "text") => {
    const base = createDefaultPageSection(type);
    setEditor((current) => ({
      ...current,
      sections: [...(current.sections || []), { ...base, sortOrder: current.sections?.length || 0, _clientId: createClientId("section"), _newUploadFilename: "" }],
    }));
    markDirty();
  };

  const updateSection = (clientId, field, value) => {
    setEditor((current) => ({ ...current, sections: current.sections.map((section) => section._clientId === clientId ? { ...section, [field]: value } : section) }));
    markDirty();
  };

  const moveSection = (index, direction) => {
    setEditor((current) => {
      const sections = [...current.sections];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= sections.length) return current;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, sections: sections.map((section, i) => ({ ...section, sortOrder: i })) };
    });
    markDirty();
  };

  const deleteSection = async (section) => {
    if (!window.confirm("Remove this page section?")) return;
    await deleteTemporaryUpload(section._newUploadFilename);
    setEditor((current) => ({ ...current, sections: current.sections.filter((item) => item._clientId !== section._clientId).map((item, i) => ({ ...item, sortOrder: i })) }));
    markDirty();
  };

  const uploadSectionImage = (section, file) => performImageUpload({
    file, key: `section-${section._clientId}`, oldTemporaryFilename: section._newUploadFilename,
    onUploaded: (path, filename) => setEditor((current) => ({
      ...current,
      sections: current.sections.map((item) => item._clientId === section._clientId ? { ...item, image: path, _newUploadFilename: filename } : item),
    })),
  });

  const removeSectionImage = async (section) => {
    await deleteTemporaryUpload(section._newUploadFilename);
    setEditor((current) => ({ ...current, sections: current.sections.map((item) => item._clientId === section._clientId ? { ...item, image: "", _newUploadFilename: "" } : item) }));
    markDirty();
  };

  const addFaq = () => {
    setEditor((current) => ({ ...current, faqItems: [...(current.faqItems || []), { ...createDefaultFaqItem(), sortOrder: current.faqItems?.length || 0, _clientId: createClientId("faq") }] }));
    markDirty();
  };

  const updateFaq = (clientId, field, value) => {
    setEditor((current) => ({ ...current, faqItems: current.faqItems.map((item) => item._clientId === clientId ? { ...item, [field]: value } : item) })); markDirty();
  };

  const moveFaq = (index, direction) => {
    setEditor((current) => {
      const items = [...current.faqItems];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, faqItems: items.map((item, i) => ({ ...item, sortOrder: i })) };
    }); markDirty();
  };

  const deleteFaq = (clientId) => {
    setEditor((current) => ({ ...current, faqItems: current.faqItems.filter((item) => item._clientId !== clientId).map((item, i) => ({ ...item, sortOrder: i })) })); markDirty();
  };

  const validateEditor = () => {
    if (!editor?.title?.trim()) return "Page title is required.";
    if (!editor?.slug?.trim()) return "Page slug is required.";
    if (!editor?.routePath?.trim()) return "A valid page URL could not be generated. Please enter a valid title and slug.";
    if (editor.isSystemPage && !editor.systemKey?.trim()) return "System page key is required.";
    if (editor.showInHeader && !String(editor.menuLabel || editor.title).trim()) return "Header menu label is required.";
    const invalidFaq = (editor.faqItems || []).find((item) => Boolean(item.question?.trim()) !== Boolean(item.answer?.trim()));
    if (invalidFaq) return "Every FAQ item must have both a question and an answer.";
    return "";
  };

  const savePage = async () => {
    const validationError = validateEditor();
    if (validationError) { setErrorMessage(validationError); return; }
    try {
      setSaving(true); setErrorMessage(""); setSuccessMessage("");
      const payload = buildAdminPagePayload(editor);
      const response = editor._isNew ? await createAdminPage(payload) : await updateAdminPage(editor._id, payload);
      const savedPage = response?.page || response?.data?.page;
      const savedId = savedPage?._id || editor._id;
      const wasNew = editor._isNew;
      setDirty(false);
      await loadPages({ showLoader: false, selectId: savedId });
      setSuccessMessage(wasNew ? "Page created successfully." : "Page updated successfully.");
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(error?.message || "Failed to save page.");
    } finally { setSaving(false); }
  };

  const removePage = async () => {
    if (!editor || editor._isNew) {
      if (await canDiscardCurrent()) { setEditor(null); setDirty(false); }
      return;
    }
    if (editor.isSystemPage) { setErrorMessage("System pages cannot be deleted. Disable or unpublish the page instead."); return; }
    if (!window.confirm(`Delete "${editor.title}"? This action cannot be undone.`)) return;
    try {
      setDeletingId(editor._id); setErrorMessage(""); setSuccessMessage("");
      await deleteAdminPage(editor._id);
      setEditor(null); setSelectedPageId(""); setDirty(false);
      await loadPages({ showLoader: false });
      setSuccessMessage("Page deleted successfully.");
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(error?.message || "Failed to delete page.");
    } finally { setDeletingId(""); }
  };

  if (loading) return (
    <div className="flex min-h-[520px] items-center justify-center">
      <div className="text-center"><Loader2 size={34} className="mx-auto animate-spin text-[#6f9a37]" /><p className="mt-3 text-sm font-semibold text-gray-400">Loading pages...</p></div>
    </div>
  );

  const stats = [
    ["Total Pages", pages.length, FileText],
    ["Published", pages.filter((p) => p.isPublished !== false && p.isActive !== false).length, Globe2],
    ["In Header", pages.filter((p) => p.showInHeader === true).length, Menu],
    ["Dropdown Pages", pages.filter(hasParentPage).length, Layers3],
  ];

  return (
    <div className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 xl:p-7">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#6f9a37]"><Globe2 size={15} />Website Pages</div>
          <h1 className="mt-1 text-2xl font-black text-[#172033] sm:text-3xl">Pages Management</h1>
          <p className="mt-1 max-w-[760px] text-sm leading-6 text-gray-400">Create and manage website pages, page content, header navigation, dropdown pages, SEO, hero images, sections and FAQs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={reloadCurrent} disabled={saving || Boolean(uploadingKey)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm disabled:opacity-50"><RefreshCcw size={16} />Reload</button>
          <button type="button" onClick={startNewPage} disabled={saving || Boolean(uploadingKey)} className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50"><Plus size={17} />Add New Page</button>
        </div>
      </div>

      {successMessage && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><span>{successMessage}</span><button type="button" onClick={() => setSuccessMessage("")} className="ml-auto"><X size={17} /></button></div>}
      {errorMessage && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><XCircle size={18} className="mt-0.5 shrink-0" /><span>{errorMessage}</span><button type="button" onClick={() => setErrorMessage("")} className="ml-auto"><X size={17} /></button></div>}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-gray-400">{label}</div><div className="mt-1 text-2xl font-black text-[#172033]">{value}</div></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5e6] text-[#6f9a37]"><Icon size={18} /></div></div></div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="self-start overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm xl:sticky xl:top-6">
          <div className="border-b border-gray-100 p-4"><div className="relative"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#6f9a37] focus:bg-white focus:ring-2 focus:ring-[#6f9a37]/10" /></div></div>
          <div className="max-h-[calc(100vh-245px)] overflow-y-auto p-2">
            {filteredPages.length ? filteredPages.map((page) => {
              const selected = !editor?._isNew && selectedPageId === page._id;
              const parentName = typeof page.parentPage === "object" ? page.parentPage?.menuLabel || page.parentPage?.title : "";
              return <button key={page._id} type="button" onClick={() => selectPage(page)} className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${selected ? "bg-[#eef5e6]" : "hover:bg-gray-50"}`}>
                <div className="flex items-start gap-3"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-white text-[#6f9a37]" : "bg-gray-100 text-gray-400"}`}>{hasParentPage(page) ? <Layers3 size={15} /> : <FileText size={15} />}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black text-[#172033]">{page.title}</div><div className="mt-1 flex flex-wrap gap-1.5">{page.isSystemPage && <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase text-blue-600">System</span>}{page.showInHeader && <span className="rounded-md bg-[#eef5e6] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#6f9a37]">Header</span>}{page.isPublished === false && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-600">Draft</span>}</div>{parentName && <div className="mt-1.5 truncate text-[10px] text-gray-400">Under: {parentName}</div>}<div className="mt-1 truncate font-mono text-[10px] text-gray-400">{page.routePath}</div></div></div>
              </button>;
            }) : <div className="px-4 py-10 text-center text-sm text-gray-400">No pages found.</div>}
          </div>
        </aside>

        <main className="min-w-0">
          {!editor ? (
            <div className="flex min-h-[520px] items-center justify-center rounded-[22px] border border-dashed border-gray-300 bg-white p-8 text-center"><div className="max-w-[420px]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e6] text-[#6f9a37]"><FileText size={25} /></div><h2 className="mt-4 text-xl font-black text-[#172033]">No page selected</h2><p className="mt-2 text-sm leading-6 text-gray-400">Select an existing page or create a new website page.</p><button type="button" onClick={startNewPage} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-bold text-white"><Plus size={17} />Add New Page</button></div></div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-[#172033]">{editor._isNew ? "New Page" : editor.title || "Edit Page"}</h2>{dirty && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase text-amber-600">Unsaved</span>}{editor.isSystemPage && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-600">System Page</span>}</div><p className="mt-1 font-mono text-xs text-gray-400">{editor.routePath || "Route will appear here"}</p></div>
                <div className="flex flex-wrap gap-2">{!editor._isNew && editor.routePath && <a href={editor.routePath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600"><Eye size={15} />Preview</a>}<button type="button" onClick={removePage} disabled={saving || Boolean(uploadingKey) || Boolean(deletingId)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 disabled:opacity-50">{deletingId ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}{editor._isNew ? "Cancel" : editor.isSystemPage ? "Protected" : "Delete"}</button><button type="button" onClick={savePage} disabled={saving || Boolean(uploadingKey) || (!dirty && !editor._isNew)} className="inline-flex items-center gap-2 rounded-xl bg-[#6f9a37] px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{saving ? "Saving..." : editor._isNew ? "Create Page" : "Save Changes"}</button></div>
              </div>

              <div className="overflow-x-auto rounded-[22px] border border-gray-200 bg-white p-2 shadow-sm">
                <div className="flex min-w-max gap-1">
                  {[
                    ["details", "Page Details", FileText, null],
                    ["header", "Header Menu", Menu, null],
                    ["hero", "Hero", ImagePlus, null],
                    ["sections", "Sections", Layers3, editor.sections?.length || 0],
                    ["faq", "FAQ", AlertCircle, editor.faqItems?.length || 0],
                    ["seo", "SEO & Visibility", Search, null],
                  ].map(([id, label, Icon, count]) => {
                    const active = activeEditorTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveEditorTab(id)}
                        className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                          active
                            ? "bg-[#eef5e6] text-[#5f8730]"
                            : "text-gray-500 hover:bg-gray-50 hover:text-[#172033]"
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                        {typeof count === "number" && (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] ${active ? "bg-white text-[#5f8730]" : "bg-gray-100 text-gray-500"}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeEditorTab === "details" && (
              <section className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <SectionHeader icon={FileText} title="Page Details" description="Main identity, automatic URL and basic page content." />
                <div className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <TextInput
                      label="Page Title *"
                      value={editor.title}
                      onChange={updateTitle}
                      placeholder="About Us"
                    />

                    <TextInput
                      label="Slug *"
                      value={editor.slug}
                      onChange={updateSlug}
                      placeholder="about-us"
                      mono
                    />
                  </div>

                  <Toggle
                    label="System Page"
                    description="Use only for existing React pages such as About, Contact, Shop or Track Order. Normal client-created pages should remain Custom Pages."
                    checked={editor.isSystemPage}
                    disabled={editor.isSystemPage && !editor._isNew}
                    onChange={updateSystemPage}
                  />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <FieldLabel>
                        Website URL
                      </FieldLabel>

                      <div
                        className="
                          rounded-xl
                          border
                          border-[#dce9cf]
                          bg-[#f5f9f1]
                          px-4
                          py-3
                        "
                      >
                        <div
                          className="
                            break-all
                            font-mono
                            text-sm
                            font-bold
                            text-[#4f6d2d]
                          "
                        >
                          {editor.routePath ||
                            "URL will be generated automatically"}
                        </div>

                        <div
                          className="
                            mt-1
                            text-[11px]
                            leading-5
                            text-[#789255]
                          "
                        >
                          Automatically generated from the page slug.
                          Client does not need to enter or manage this URL.
                        </div>
                      </div>
                    </div>

                    <TextInput
                      label="System Key"
                      value={editor.systemKey}
                      disabled={!editor.isSystemPage}
                      onChange={updateSystemKey}
                      placeholder="about"
                      mono
                    />
                  </div>
                  <TextArea label="Short Description" value={editor.shortDescription} onChange={(v) => updateField("shortDescription", v)} placeholder="Short introduction for this page..." rows={3} />
                  <TextArea label="Main Page Content" value={editor.content} onChange={(v) => updateField("content", v)} placeholder="Write the main content for this page..." rows={8} />
                </div>
              </section>
              )}

              {activeEditorTab === "header" && (
              <section className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <SectionHeader icon={Menu} title="Header Navigation" description="Control whether this page appears in the header and whether it is a main item or dropdown item." />
                <div className="space-y-5 p-5 sm:p-6">
                  <Toggle label="Show in Header" description="Turn this on to add the page to the customer website header." checked={editor.showInHeader} onChange={(v) => updateField("showInHeader", v)} />
                  <div className="grid gap-4 lg:grid-cols-3"><TextInput label="Menu Label" value={editor.menuLabel} onChange={(v) => updateField("menuLabel", v)} placeholder="About Us" /><TextInput label="Menu Order" type="number" value={editor.menuOrder} onChange={(v) => updateField("menuOrder", Number(v) || 0)} /><SelectInput label="Parent Page" value={editor.parentPage || ""} onChange={(v) => updateField("parentPage", v)}><option value="">Main Header Page</option>{mainPageCandidates.map((page) => <option key={page._id} value={page._id}>{page.menuLabel || page.title}</option>)}</SelectInput></div>
                  <Toggle label="Open in New Tab" description="Usually keep this off for normal internal website pages." checked={editor.openInNewTab} onChange={(v) => updateField("openInNewTab", v)} />
                  <div className="rounded-xl border border-[#dce9cf] bg-[#f5f9f1] px-4 py-3 text-xs leading-5 text-[#5a733f]"><strong>Header structure:</strong> Leave Parent Page empty for a main menu item. Select a Parent Page to place this page inside its dropdown.</div>
                </div>
              </section>
              )}

              {activeEditorTab === "hero" && (
              <section className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <SectionHeader icon={ImagePlus} title="Page Hero" description="Optional page banner / hero shown at the top of the page." />
                <div className="space-y-5 p-5 sm:p-6">
                  <Toggle label="Enable Hero" description="Show or hide the hero section on this page." checked={editor.hero?.isEnabled !== false} onChange={(v) => updateHero("isEnabled", v)} />
                  <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]"><ImageField label="Hero Image" image={editor.hero?.image} alt={editor.hero?.imageAlt} uploading={uploadingKey === "hero-image"} onUpload={uploadHeroImage} onRemove={removeHeroImage} previewClassName="h-[220px]" /><div className="space-y-4"><TextInput label="Hero Heading" value={editor.hero?.heading} onChange={(v) => updateHero("heading", v)} /><TextArea label="Hero Subheading" value={editor.hero?.subheading} onChange={(v) => updateHero("subheading", v)} rows={3} /><TextInput label="Image Alt Text" value={editor.hero?.imageAlt} onChange={(v) => updateHero("imageAlt", v)} /><div className="grid gap-4 sm:grid-cols-2"><TextInput label="Button Text" value={editor.hero?.buttonText} onChange={(v) => updateHero("buttonText", v)} /><TextInput label="Button Link" value={editor.hero?.buttonUrl} onChange={(v) => updateHero("buttonUrl", v)} mono /></div></div></div>
                </div>
              </section>
              )}

              {activeEditorTab === "sections" && (
              <section className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <SectionHeader icon={Layers3} title="Content Sections" description="Add as many sections as needed. They will appear on the website in the same order shown here." action={<div className="flex flex-wrap gap-2"><button type="button" onClick={() => addSection("text")} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-[#b9d29c] hover:bg-[#f7fbf3]">+ Text</button><button type="button" onClick={() => addSection("imageText")} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-[#b9d29c] hover:bg-[#f7fbf3]">+ Image/Text</button><button type="button" onClick={() => addSection("banner")} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-[#b9d29c] hover:bg-[#f7fbf3]">+ Banner</button><button type="button" onClick={() => addSection("cta")} className="rounded-xl bg-[#172033] px-3 py-2 text-xs font-bold text-white hover:bg-[#26334b]">+ CTA</button></div>} />
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Text", "Heading and paragraph content."],
                      ["Image + Text", "About, story, values or information block."],
                      ["Banner", "Large visual banner with optional button."],
                      ["CTA", "Call-to-action block such as Shop Now or Contact Us."],
                    ].map(([title, description]) => (
                      <div key={title} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="text-xs font-black text-[#172033]">{title}</div>
                        <div className="mt-1 text-[11px] leading-5 text-gray-400">{description}</div>
                      </div>
                    ))}
                  </div>
                  {!editor.sections.length ? <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-10 text-center"><Layers3 size={30} className="mx-auto text-gray-300" /><p className="mt-2 text-sm font-semibold text-gray-400">No content sections added.</p></div> : editor.sections.map((section, index) => {
                    const needsImage = ["imageText", "banner"].includes(section.sectionType);
                    const hasButton = ["imageText", "banner", "cta"].includes(section.sectionType);
                    return <div key={section._clientId} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/60">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef5e6] text-[11px] font-black text-[#6f9a37]">{index + 1}</span><strong className="text-sm text-[#172033]">{section.heading || "Untitled Section"}</strong><span className="rounded-md bg-gray-100 px-2 py-1 text-[9px] font-black uppercase text-gray-500">{section.sectionType}</span></div><div className="flex items-center gap-1"><button type="button" disabled={index === 0} onClick={() => moveSection(index, "up")} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" disabled={index === editor.sections.length - 1} onClick={() => moveSection(index, "down")} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 disabled:opacity-30"><ArrowDown size={14} /></button><button type="button" onClick={() => deleteSection(section)} className="rounded-lg border border-red-200 bg-white p-2 text-red-500"><Trash2 size={14} /></button></div></div>
                      <div className="space-y-4 p-4"><div className="grid gap-4 lg:grid-cols-3"><SelectInput label="Section Type" value={section.sectionType} onChange={(v) => updateSection(section._clientId, "sectionType", v)}><option value="text">Text</option><option value="imageText">Image + Text</option><option value="banner">Banner</option><option value="cta">CTA</option><option value="faq">FAQ Heading</option></SelectInput><SelectInput label="Text Align" value={section.textAlign} onChange={(v) => updateSection(section._clientId, "textAlign", v)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></SelectInput><Toggle label="Active" checked={section.isActive !== false} onChange={(v) => updateSection(section._clientId, "isActive", v)} /></div><div className="grid gap-4 lg:grid-cols-2"><TextInput label="Heading" value={section.heading} onChange={(v) => updateSection(section._clientId, "heading", v)} /><TextInput label="Subheading" value={section.subheading} onChange={(v) => updateSection(section._clientId, "subheading", v)} /></div><TextArea label="Section Content" value={section.content} onChange={(v) => updateSection(section._clientId, "content", v)} rows={5} />
                      {needsImage && <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]"><ImageField label="Section Image" image={section.image} alt={section.imageAlt} uploading={uploadingKey === `section-${section._clientId}`} onUpload={(file) => uploadSectionImage(section, file)} onRemove={() => removeSectionImage(section)} previewClassName="h-[180px]" /><div className="space-y-4"><TextInput label="Image Alt Text" value={section.imageAlt} onChange={(v) => updateSection(section._clientId, "imageAlt", v)} /><SelectInput label="Image Position" value={section.imagePosition} onChange={(v) => updateSection(section._clientId, "imagePosition", v)}><option value="left">Left</option><option value="right">Right</option><option value="top">Top</option><option value="background">Background</option></SelectInput></div></div>}
                      {hasButton && <div className="grid gap-4 sm:grid-cols-2"><TextInput label="Button Text" value={section.buttonText} onChange={(v) => updateSection(section._clientId, "buttonText", v)} /><TextInput label="Button Link" value={section.buttonUrl} onChange={(v) => updateSection(section._clientId, "buttonUrl", v)} mono /></div>}
                      </div>
                    </div>;
                  })}
                </div>
              </section>
              )}

              {activeEditorTab === "faq" && (
              <section className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <SectionHeader icon={AlertCircle} title="FAQ Items" description="Optional frequently asked questions for this page." action={<button type="button" onClick={addFaq} className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-xs font-bold text-white"><Plus size={15} />Add FAQ</button>} />
                <div className="space-y-3 p-5 sm:p-6">
                  {!editor.faqItems.length ? <div className="rounded-2xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">No FAQ items added.</div> : editor.faqItems.map((item, index) => <div key={item._clientId} className="rounded-2xl border border-gray-200 bg-gray-50 p-4"><div className="mb-4 flex items-center justify-between gap-3"><strong className="text-sm text-[#172033]">FAQ {index + 1}</strong><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => moveFaq(index, "up")} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" disabled={index === editor.faqItems.length - 1} onClick={() => moveFaq(index, "down")} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 disabled:opacity-30"><ArrowDown size={14} /></button><button type="button" onClick={() => deleteFaq(item._clientId)} className="rounded-lg border border-red-200 bg-white p-2 text-red-500"><Trash2 size={14} /></button></div></div><div className="space-y-4"><TextInput label="Question" value={item.question} onChange={(v) => updateFaq(item._clientId, "question", v)} /><TextArea label="Answer" value={item.answer} onChange={(v) => updateFaq(item._clientId, "answer", v)} rows={4} /><Toggle label="Active" checked={item.isActive !== false} onChange={(v) => updateFaq(item._clientId, "isActive", v)} /></div></div>)}
                </div>
              </section>
              )}

              {activeEditorTab === "seo" && (
              <div className="space-y-5">
              <section className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <SectionHeader icon={Globe2} title="Visibility & Footer" description="Control public visibility, publishing and footer placement." />
                <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2"><Toggle label="Page Active" description="Disable the page without deleting its content." checked={editor.isActive !== false} onChange={(v) => updateField("isActive", v)} /><Toggle label="Published" description="Unpublish to hide this page from the public website." checked={editor.isPublished !== false} onChange={(v) => updateField("isPublished", v)} /><Toggle label="Show in Footer" description="Allow this page to appear in footer links later." checked={editor.showInFooter} onChange={(v) => updateField("showInFooter", v)} /><TextInput label="Footer Order" type="number" value={editor.footerOrder} onChange={(v) => updateField("footerOrder", Number(v) || 0)} /></div>
              </section>

              <section className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <SectionHeader icon={Search} title="SEO & Social Sharing" description="Search engine metadata and social sharing image." />
                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-4"><TextInput label="Meta Title" value={editor.metaTitle} onChange={(v) => updateField("metaTitle", v)} placeholder="SEO page title" /><TextArea label="Meta Description" value={editor.metaDescription} onChange={(v) => updateField("metaDescription", v)} placeholder="Search result description..." rows={4} /><TextInput label="Meta Keywords" value={Array.isArray(editor.metaKeywords) ? editor.metaKeywords.join(", ") : editor.metaKeywords} onChange={(v) => updateField("metaKeywords", v)} placeholder="keyword one, keyword two" /></div><ImageField label="Social Share Image" image={editor.socialImage} alt={editor.metaTitle || editor.title} uploading={uploadingKey === "social-image"} onUpload={uploadSocialImage} onRemove={removeSocialImage} previewClassName="h-[190px]" /></div>
              </section>
              </div>
              )}

              <div className="flex flex-col gap-3 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="text-xs leading-5 text-gray-400">{dirty ? "You have unsaved changes." : editor._isNew ? "Complete the required fields and create the page." : "All current page changes are saved."}</div><button type="button" onClick={savePage} disabled={saving || Boolean(uploadingKey) || (!dirty && !editor._isNew)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6f9a37] px-6 py-3 text-sm font-black text-white disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{editor._isNew ? "Create Page" : "Save Changes"}</button></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPagesPage;
