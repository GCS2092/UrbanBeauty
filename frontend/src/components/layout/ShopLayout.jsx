import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import useAuthStore from '../../store/authStore';

export default function ShopLayout() {
  const { user, isAuthenticated } = useAuthStore();

  // ✅ Si admin ou staff → redirige vers /admin
  if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}