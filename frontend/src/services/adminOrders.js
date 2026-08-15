const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API_ROOT = RAW_API_URL
  .replace(/\/+$/, "")
  .endsWith("/api")
  ? RAW_API_URL.replace(/\/+$/, "")
  : `${RAW_API_URL.replace(/\/+$/, "")}/api`;

const request = async (
  path,
  options = {}
) => {
  const response = await fetch(
    `${API_ROOT}${path}`,
    {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
};

export const getAdminOrders = async (
  params = {}
) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all"
      ) {
        query.set(key, value);
      }
    }
  );

  const suffix = query.toString()
    ? `?${query.toString()}`
    : "";

  return request(`/orders${suffix}`);
};

export const getAdminOrder = async (
  id
) => {
  return request(`/orders/${id}`);
};

export const updateAdminOrderStatus =
  async (id, payload) => {
    return request(
      `/orders/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  };

export const updateAdminPaymentStatus =
  async (id, payload) => {
    return request(
      `/orders/${id}/payment`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  };

export const cancelAdminOrder = async (
  id,
  cancellationReason
) => {
  return request(
    `/orders/${id}/cancel`,
    {
      method: "PATCH",
      body: JSON.stringify({
        cancellationReason,
      }),
    }
  );
};
