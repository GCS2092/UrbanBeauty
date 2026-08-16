import api from "./axios";
import { API_URL, AUTH_TOKEN_KEY } from "../utils/constants";

async function downloadBlob(url, filename, errorMessage) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || errorMessage);
  }
  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(objectUrl);
}

export const productsApi = {
  getAll: (params) => api.get("/api/products", { params }),
  getFilters: (params) => api.get("/api/products/filters", { params }),
  getBySlug: (slug, params) => api.get(`/api/products/${slug}`, { params }),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),

  importExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadTemplate: () =>
    downloadBlob(
      `${API_URL}/api/products/import/template`,
      "template-produits.xlsx",
      "Impossible de télécharger le template.",
    ),

  exportExcel: () => {
    const datePart = new Date().toISOString().slice(0, 10);
    return downloadBlob(
      `${API_URL}/api/products/export`,
      `catalogue-produits-${datePart}.xlsx`,
      "Impossible d'exporter le catalogue.",
    );
  },
};