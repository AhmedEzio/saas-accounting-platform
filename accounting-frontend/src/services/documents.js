import api from "./api";

export const getDocumentsStats = async () => {
  const { data } = await api.get("/invoice-documents/stats");
  return data.data;
};

export const getDocuments = async ({ page = 1, limit = 20, search = "", fileType = "" }) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (fileType) params.fileType = fileType;

  const { data } = await api.get("/invoice-documents", { params });
  return data.data;
};

export const getDocumentById = async (id) => {
  const { data } = await api.get(`/invoice-documents/${id}`);
  return data.data;
};

export const uploadDocument = async (formData) => {
  const { data } = await api.post("/invoice-documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteDocument = async (id) => {
  const { data } = await api.delete(`/invoice-documents/${id}`);
  return data;
};
