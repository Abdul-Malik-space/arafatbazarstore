// ========================================
// ADMIN CUSTOMERS API SERVICE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const request = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Customer request failed."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export const getAdminCustomers = async (
  params = {}
) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value) !== ""
      ) {
        query.set(key, String(value));
      }
    }
  );

  const suffix = query.toString()
    ? `?${query.toString()}`
    : "";

  return request(
    `/admin/customers${suffix}`,
    {
      method: "GET",
    }
  );
};

export const getAdminCustomer = async (
  phoneKey
) => {
  return request(
    `/admin/customers/${encodeURIComponent(
      phoneKey
    )}`,
    {
      method: "GET",
    }
  );
};

export const updateAdminCustomer = async (
  phoneKey,
  payload
) => {
  return request(
    `/admin/customers/${encodeURIComponent(
      phoneKey
    )}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};
