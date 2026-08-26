import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';
import { toast } from 'sonner';
import api from '../../api/axios';
import { Store, FileText, Phone, ImageIcon } from 'lucide-react';

export default function SellerSettings() {
  const [settings, setSettings] = useState({
    storeName: '',
    storeDescription: '',
    storeLogo: '',
    storeContact: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await sellersApi.getStoreSettings();
      setSettings({
        storeName: data.storeName || '',
        storeDescription: data.storeDescription || '',
        storeLogo: data.storeLogo || '',
        storeContact: data.storeContact || ''
      });
    } catch (err) {
      toast.error('Erreur chargement paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);

      const { data } = await api.post('/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.images && data.images[0] && data.images[0].success) {
        setSettings(prev => ({ ...prev, storeLogo: data.images[0].url }));
        toast.success('Image uploadée ✓');
      } else {
        throw new Error('Erreur upload');
      }
    } catch (err) {
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sellersApi.updateStoreSettings(settings);
      toast.success('Paramètres sauvegardés ✓');
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
    <div className="space-y-6 pb-4 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Paramètres boutique</h1>
        <p className="text-sm sm:text-base text-stone-500 mt-1">Personnalisez l'apparence de votre boutique</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identité de la boutique */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-rose-600" />
            <h2 className="text-base sm:text-lg font-semibold text-stone-800">Identité</h2>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Logo de la boutique
            </label>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-24 h-24 shrink-0 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden">
                {settings.storeLogo ? (
                  <img
                    src={settings.storeLogo}
                    alt="Logo boutique"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={24} className="text-stone-300" />
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="flex items-center justify-center gap-2 border border-dashed border-stone-300 rounded-lg py-2.5 px-4 cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors text-sm font-medium text-stone-600">
                  {uploading ? 'Upload en cours...' : 'Choisir une image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Nom de la boutique */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Nom de la boutique
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
              placeholder="ex : Mode Dakar"
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-rose-600" />
            <h2 className="text-base sm:text-lg font-semibold text-stone-800">Description</h2>
          </div>
          <textarea
            value={settings.storeDescription}
            onChange={(e) => setSettings(prev => ({ ...prev, storeDescription: e.target.value }))}
            placeholder="Décrivez votre boutique en quelques mots..."
            rows={4}
            className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
        </div>

        {/* Contact */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-rose-600" />
            <h2 className="text-base sm:text-lg font-semibold text-stone-800">Contact</h2>
          </div>
          <input
            type="text"
            value={settings.storeContact}
            onChange={(e) => setSettings(prev => ({ ...prev, storeContact: e.target.value }))}
            placeholder="ex : 77 123 45 67 ou contact@boutique.com"
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Bouton sauvegarder */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}
