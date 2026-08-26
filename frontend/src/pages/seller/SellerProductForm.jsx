import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sellersApi } from '../../api/sellers.api';
import { categoriesApi } from '../../api/categories.api';
import { toast } from 'sonner';
import api from '../../api/axios';
import { Info, Banknote, ImageIcon, ToggleLeft, X, Star } from 'lucide-react';

export default function SellerProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    purchasePrice: '',
    lowStockAlert: '5',
    isActive: true,
    status: 'DRAFT'
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data } = await categoriesApi.getAll();
      setCategories(data.data || data);
    } catch (err) {
      toast.error('Erreur chargement catégories');
    }
  };

  const loadProduct = async () => {
    try {
      const { data } = await sellersApi.getProducts();
      const product = data.data.find(p => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          purchasePrice: product.purchasePrice || '',
          lowStockAlert: product.lowStockAlert || '5',
          isActive: product.isActive,
          status: product.status
        });
        setImages(product.images || []);
      }
    } catch (err) {
      toast.error('Erreur chargement produit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const { data } = await api.post('/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.images) {
        const newImages = data.images
          .filter(img => img.success)
          .map((img, idx) => ({
            url: img.url,
            publicId: img.publicId,
            isMain: images.length === 0 && idx === 0,
            position: images.length + idx
          }));

        setImages(prev => [...prev, ...newImages]);
        toast.success(`${newImages.length} image(s) uploadée(s)`);
      }
    } catch (err) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSetMainImage = (index) => {
    setImages(prev => prev.map((img, idx) => ({
      ...img,
      isMain: idx === index
    })));
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        purchasePrice: formData.purchasePrice ? parseInt(formData.purchasePrice) : null,
        lowStockAlert: parseInt(formData.lowStockAlert)
      };

      if (isEdit) {
        await sellersApi.updateProduct(id, productData);
        toast.success('Produit modifié ✓');
      } else {
        await sellersApi.createProduct(productData);
        toast.success('Produit créé ✓');
      }

      navigate('/seller/products');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="text-sm sm:text-base text-stone-500 mt-1">
            {isEdit ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue'}
          </p>
        </div>
        <Link
          to="/seller/products"
          className="hidden sm:inline-flex px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium"
        >
          Annuler
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-rose-600" />
            <h2 className="text-base sm:text-lg font-semibold text-stone-800">Informations de base</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Nom du produit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={generateSlug}
              required
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="ex: Robe Wax Élégante"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="flex-1 min-w-0 border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="ex: robe-wax-elegante"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-4 py-2.5 sm:py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Générer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              placeholder="Décrivez votre produit..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prix et stock */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-rose-600" />
            <h2 className="text-base sm:text-lg font-semibold text-stone-800">Prix et stock</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Prix de vente (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="ex: 25000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Prix d'achat (FCFA)
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                min="0"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="ex: 15000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="ex: 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Alerte stock bas
              </label>
              <input
                type="number"
                name="lowStockAlert"
                value={formData.lowStockAlert}
                onChange={handleChange}
                min="0"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="ex: 5"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-rose-600" />
            <h2 className="text-base sm:text-lg font-semibold text-stone-800">Images</h2>
          </div>

          <div>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 rounded-xl py-6 px-4 cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors">
              <ImageIcon size={22} className="text-stone-400" />
              <span className="text-sm font-medium text-stone-600">
                {uploading ? 'Upload en cours...' : 'Ajouter des images'}
              </span>
              <span className="text-xs text-stone-400">PNG, JPG jusqu'à quelques Mo</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.url}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-28 sm:h-32 object-cover rounded-lg border border-stone-200"
                  />
                  {img.isMain && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white text-[11px] font-medium rounded">
                      <Star size={10} fill="white" />
                      Principale
                    </span>
                  )}

                  {/* Actions toujours visibles sur mobile (pas de hover), overlay au survol sur desktop */}
                  <div className="mt-1.5 flex gap-1.5 sm:hidden">
                    {!img.isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(idx)}
                        className="flex-1 px-2 py-1 bg-stone-100 text-stone-700 text-[11px] font-medium rounded"
                      >
                        Principale
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="flex-1 px-2 py-1 bg-red-50 text-red-600 text-[11px] font-medium rounded"
                    >
                      Retirer
                    </button>
                  </div>

                  <div className="hidden sm:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg items-center justify-center gap-2">
                    {!img.isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(idx)}
                        className="px-3 py-1 bg-white text-stone-800 text-xs rounded hover:bg-stone-100"
                      >
                        Définir principale
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      aria-label="Supprimer l'image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statut */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ToggleLeft size={18} className="text-rose-600" />
            <h2 className="text-base sm:text-lg font-semibold text-stone-800">Statut</h2>
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
            />
            <span className="text-sm text-stone-700">Produit actif</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Statut de publication
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="OUT_OF_STOCK">Rupture de stock</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-2">
          <Link
            to="/seller/products"
            className="text-center px-6 py-2.5 sm:py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors font-medium text-sm"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 sm:py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {saving ? 'Sauvegarde...' : isEdit ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
