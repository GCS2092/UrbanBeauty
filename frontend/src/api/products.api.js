import api from "./axios";
import { API_URL, AUTH_TOKEN_KEY } from "../utils/constants";

// Même pattern que downloadBlob dans admin.api.js — téléchargement de fichier
// binaire (xlsx) avec le token lu directement dans localStorage, car axios
// n'est pas adapté pour déclencher un téléchargement navigateur.
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
  getBySlug: (slug, params) => api.get(`/api/products/${slug}`, { params }),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),

  // ── Import / Export Excel ──────────────────────────────────────

  // Upload d'un fichier Excel — retourne le rapport { total, created, updated, skipped, errors[] }
  importExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Télécharge le template vierge (avec feuilles Ref_Categories / Ref_Boutiques)
  downloadTemplate: () =>
    downloadBlob(
      `${API_URL}/api/products/import/template`,
      "template-produits.xlsx",
      "Impossible de télécharger le template.",
    ),

  // Exporte le catalogue actuel en Excel
  exportExcel: () => {
    const datePart = new Date().toISOString().slice(0, 10);
    return downloadBlob(
      `${API_URL}/api/products/export`,
      `catalogue-produits-${datePart}.xlsx`,
      "Impossible d'exporter le catalogue.",
    );
  },
};
