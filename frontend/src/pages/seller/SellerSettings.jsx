import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';
import { toast } from 'sonner';
import api from '../../api/axios';

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
      toast.error('Erreur lors de l\'upload de l\'image');
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

  if (loading) return <div className="text-stone-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Paramètres boutique</h1>
        <p className="text-stone-500 mt-1">Personnalisez l'apparence de votre boutique</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Logo de la boutique
          </label>
          <div className="flex items-start gap-4">
            {settings.storeLogo && (
              <img
                src={settings.storeLogo}
                alt="Logo boutique"
                className="w-24 h-24 object-cover rounded-lg border border-stone-200"
              />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
              />
              {uploading && (
                <p className="text-xs text-stone-400 mt-1">Upload en cours...</p>
              )}
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
            className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Description de la boutique
          </label>
          <textarea
            value={settings.storeDescription}
            onChange={(e) => setSettings(prev => ({ ...prev, storeDescription: e.target.value }))}
            placeholder="Décrivez votre boutique en quelques mots..."
            rows={4}
            className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Coordonnées de contact
          </label>
          <input
            type="text"
            value={settings.storeContact}
            onChange={(e) => setSettings(prev => ({ ...prev, storeContact: e.target.value }))}
            placeholder="ex : 77 123 45 67 ou contact@boutique.com"
            className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Bouton sauvegarder */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}