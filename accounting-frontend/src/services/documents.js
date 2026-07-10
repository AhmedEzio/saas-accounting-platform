import { api } from "./api";

export const documentsApi = {
  getStats: () => api.get("/invoice-documents/stats").then((r) => r.data.data),

  getDocuments: ({ page = 1, limit = 20, search = "", fileType = "" }) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (fileType) params.fileType = fileType;

    return api.get("/invoice-documents", { params }).then((r) => r.data.data);
  },

  getById: (id) => api.get(`/invoice-documents/${id}`).then((r) => r.data.data),

  upload: (formData) =>
    api
      .post("/invoice-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((r) => r.data),

  delete: (id) => api.delete(`/invoice-documents/${id}`).then((r) => r.data),
};
