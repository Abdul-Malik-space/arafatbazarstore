import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

// ========================================
// ADMIN LOGIN PAGE
// ========================================

const AdminLoginPage = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,

    isAuthenticated,

    authLoading,

    actionLoading,

    authError,

    clearAuthError,
  } = useAdminAuth();

  // ======================================
  // STATE
  // ======================================

  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
  });

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    localError,
    setLocalError,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  // ======================================
  // RETURN PATH
  // ======================================

  const requestedPath =
    typeof location.state?.from ===
    "string"
      ? location.state.from
      : "/admin/dashboard";

  // ======================================
  // ALREADY LOGGED IN
  // ======================================

  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated
    ) {
      navigate(
        requestedPath,
        {
          replace: true,
        }
      );
    }
  }, [
    authLoading,
    isAuthenticated,
    navigate,
    requestedPath,
  ]);

  // ======================================
  // CLEAR OLD ERROR
  // ======================================

  useEffect(() => {
    clearAuthError();

    return () => {
      clearAuthError();
    };
  }, [
    clearAuthError,
  ]);

  // ======================================
  // HANDLE CHANGE
  // ======================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]: value,
      })
    );

    if (errors[name]) {
      setErrors(
        (previous) => ({
          ...previous,

          [name]: "",
        })
      );
    }

    if (localError) {
      setLocalError("");
    }

    if (authError) {
      clearAuthError();
    }
  };

  // ======================================
  // VALIDATE
  // ======================================

  const validateForm = () => {
    const nextErrors = {};

    const email =
      formData.email
        .trim()
        .toLowerCase();

    if (!email) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (
      !formData.password
    ) {
      nextErrors.password =
        "Password is required.";
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    clearAuthError();
    setLocalError("");

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,
      });

      navigate(
        requestedPath,
        {
          replace: true,
        }
      );
    } catch (error) {
      setLocalError(
        error?.message ||
          "Unable to sign in."
      );
    }
  };

  // ======================================
  // INITIAL AUTH CHECK
  // ======================================

  if (authLoading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#f7f7f7]
          px-5
        "
      >
        <div
          className="
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-[#f4f7ef]
              text-[var(--primary-color)]
            "
          >
            <LockKeyhole
              size={27}
            />
          </div>

          <div
            className="
              mx-auto
              mt-5
              h-7
              w-7
              animate-spin
              rounded-full
              border-[3px]
              border-[#dddddd]
              border-t-[var(--primary-color)]
            "
          />

          <p
            className="
              mt-4
              text-[12px]
              font-semibold
              text-[#777]
            "
          >
            Checking administrator
            session...
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // PAGE
  // ======================================

  return (
    <div
      className="
        min-h-screen
        bg-[#f7f7f7]
      "
    >
      <div
        className="
          grid
          min-h-screen
          grid-cols-1
          lg:grid-cols-[1.05fr_0.95fr]
        "
      >
        {/* =================================
            LEFT SIDE
        ================================= */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            bg-[#202020]
            px-10
            py-12
            text-white
            lg:flex
            lg:flex-col
            lg:justify-between
            xl:px-16
          "
        >
          {/* DECORATION */}

          <div
            className="
              absolute
              -right-24
              -top-24
              h-[360px]
              w-[360px]
              rounded-full
              bg-[var(--primary-color)]
              opacity-20
              blur-2xl
            "
          />

          <div
            className="
              absolute
              -bottom-32
              -left-32
              h-[420px]
              w-[420px]
              rounded-full
              bg-[var(--primary-color)]
              opacity-10
              blur-3xl
            "
          />

          {/* TOP */}

          <div
            className="
              relative
              z-10
            "
          >
            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-3
                text-[14px]
                font-black
                uppercase
                tracking-[0.08em]
                text-white
              "
            >
              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--primary-color)]
                "
              >
                <ShieldCheck
                  size={19}
                />
              </span>

              Store Admin
            </Link>
          </div>

          {/* CENTER */}

          <div
            className="
              relative
              z-10
              max-w-[520px]
            "
          >
            <div
              className="
                text-[12px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--primary-color)]
              "
            >
              Secure administration
            </div>

            <h1
              className="
                mt-5
                text-[46px]
                font-black
                leading-[1.08]
                xl:text-[56px]
              "
            >
              Manage your
              online store from
              one secure place.
            </h1>

            <p
              className="
                mt-6
                max-w-[450px]
                text-[14px]
                leading-7
                text-white/60
              "
            >
              Access products,
              categories, orders,
              website content and
              store settings from
              the protected
              administrator panel.
            </p>

            <div
              className="
                mt-9
                grid
                max-w-[430px]
                grid-cols-1
                gap-4
              "
            >
              {[
                "Secure administrator access",
                "Protected store management",
                "Role-based dashboard access",
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-3
                      text-[12px]
                      text-white/80
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-white/10
                        text-[var(--primary-color)]
                      "
                    >
                      <ShieldCheck
                        size={14}
                      />
                    </span>

                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          {/* BOTTOM */}

          <div
            className="
              relative
              z-10
              text-[11px]
              text-white/40
            "
          >
            Protected administrator
            area
          </div>
        </section>

        {/* =================================
            RIGHT LOGIN
        ================================= */}

        <section
          className="
            flex
            min-h-screen
            items-center
            justify-center
            px-4
            py-10
            sm:px-6
            lg:px-10
          "
        >
          <div
            className="
              w-full
              max-w-[480px]
            "
          >
            {/* MOBILE BRAND */}

            <div
              className="
                mb-9
                flex
                justify-center
                lg:hidden
              "
            >
              <Link
                to="/"
                className="
                  inline-flex
                  items-center
                  gap-3
                  text-[14px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  text-[#222]
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--primary-color)]
                    text-white
                  "
                >
                  <ShieldCheck
                    size={19}
                  />
                </span>

                Store Admin
              </Link>
            </div>

            {/* LOGIN CARD */}

            <div
              className="
                border
                border-[#eaeaea]
                bg-white
                px-5
                py-8
                sm:px-8
                sm:py-10
              "
            >
              {/* HEADING */}

              <div>
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#f4f7ef]
                    text-[var(--primary-color)]
                  "
                >
                  <LockKeyhole
                    size={21}
                  />
                </div>

                <h2
                  className="
                    mt-5
                    text-[30px]
                    font-black
                    text-[#222]
                    sm:text-[34px]
                  "
                >
                  Admin login
                </h2>

                <p
                  className="
                    mt-2
                    text-[12px]
                    leading-6
                    text-[#777]
                  "
                >
                  Enter your
                  administrator
                  credentials to
                  continue.
                </p>
              </div>

              {/* ERROR */}

              {(localError ||
                authError) && (
                <div
                  className="
                    mt-6
                    rounded-[10px]
                    border
                    border-red-100
                    bg-red-50
                    px-4
                    py-3
                    text-[11px]
                    leading-5
                    text-red-600
                  "
                >
                  {localError ||
                    authError}
                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  mt-7
                  space-y-5
                "
              >
                {/* =========================
                    EMAIL
                ========================= */}

                <div>
                  <label
                    htmlFor="admin-email"
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-semibold
                      text-[#444]
                    "
                  >
                    Email address
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
                    <Mail
                      size={17}
                      className={`
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        ${
                          errors.email
                            ? "text-red-400"
                            : "text-[#999]"
                        }
                      `}
                    />

                    <input
                      id="admin-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="admin@example.com"
                      className={`
                        h-[50px]
                        w-full
                        rounded-[27px]
                        border
                        bg-white
                        pl-11
                        pr-5
                        text-[13px]
                        text-[#444]
                        outline-none
                        transition
                        ${
                          errors.email
                            ? "border-red-400"
                            : "border-[#dddddd] focus:border-[var(--primary-color)]"
                        }
                      `}
                    />
                  </div>

                  {errors.email && (
                    <p
                      className="
                        mt-1.5
                        pl-2
                        text-[10px]
                        text-red-500
                      "
                    >
                      {
                        errors.email
                      }
                    </p>
                  )}
                </div>

                {/* =========================
                    PASSWORD
                ========================= */}

                <div>
                  <label
                    htmlFor="admin-password"
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-semibold
                      text-[#444]
                    "
                  >
                    Password
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
                    <LockKeyhole
                      size={17}
                      className={`
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        ${
                          errors.password
                            ? "text-red-400"
                            : "text-[#999]"
                        }
                      `}
                    />

                    <input
                      id="admin-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      autoComplete="current-password"
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter password"
                      className={`
                        h-[50px]
                        w-full
                        rounded-[27px]
                        border
                        bg-white
                        pl-11
                        pr-12
                        text-[13px]
                        text-[#444]
                        outline-none
                        transition
                        ${
                          errors.password
                            ? "border-red-400"
                            : "border-[#dddddd] focus:border-[var(--primary-color)]"
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        flex
                        -translate-y-1/2
                        items-center
                        justify-center
                        text-[#888]
                        transition
                        hover:text-[var(--primary-color)]
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      className="
                        mt-1.5
                        pl-2
                        text-[10px]
                        text-red-500
                      "
                    >
                      {
                        errors.password
                      }
                    </p>
                  )}
                </div>

                {/* SECURITY MESSAGE */}

                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-[12px]
                    bg-[#fafafa]
                    px-4
                    py-3
                  "
                >
                  <ShieldCheck
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />

                  <p
                    className="
                      text-[10px]
                      leading-5
                      text-[#777]
                    "
                  >
                    This is a
                    protected
                    administrator area.
                    Unauthorized access
                    is not permitted.
                  </p>
                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  className="
                    flex
                    h-[50px]
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-[27px]
                    bg-[#282828]
                    px-6
                    text-[12px]
                    font-bold
                    uppercase
                    text-white
                    transition
                    hover:bg-[var(--primary-color)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {actionLoading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <ArrowRight
                        size={15}
                      />
                    </>
                  )}
                </button>
              </form>

              {/* RETURN TO STORE */}

              <div
                className="
                  mt-7
                  border-t
                  border-[#eeeeee]
                  pt-6
                  text-center
                "
              >
                <Link
                  to="/"
                  className="
                    text-[11px]
                    font-semibold
                    text-[#777]
                    transition
                    hover:text-[var(--primary-color)]
                  "
                >
                  ← Return to store
                </Link>
              </div>
            </div>

            <p
              className="
                mt-5
                text-center
                text-[10px]
                leading-5
                text-[#999]
              "
            >
              Authentication uses a
              secure server-managed
              session cookie.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLoginPage;