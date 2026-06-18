import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accounting_token")
      : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("accounting_token");
      localStorage.removeItem("accounting_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: ({ email, password }) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),

  register: ({ name, email, password, role }) =>
    api
      .post("/auth/register", { name, email, password, role: "accountant", })
      .then((r) => r.data),

  forgotPassword: ({ email }) =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: ({ token, password, passwordConfirm }) =>
    api
      .patch(`/auth/reset-password/${token}`, { password, passwordConfirm })
      .then((r) => r.data),

  getMe: () => api.get("/auth/me").then((r) => r.data.data),

  updateProfile: (id, payload) =>
    api.put(`/users/${id}`, payload).then((r) => r.data.data),

  googleLogin: (credential) =>
  api.post("/auth/google", { credential }).then((r) => r.data),
};
