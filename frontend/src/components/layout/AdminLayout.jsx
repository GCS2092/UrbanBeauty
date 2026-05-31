import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-stone-950">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto bg-stone-50 lg:rounded-tl-2xl lg:rounded-bl-2xl">
        <Outlet />
      </main>
    </div>
  );
}