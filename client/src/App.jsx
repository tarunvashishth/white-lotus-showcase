import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { EmptyState } from './components/ui.jsx';
import { getToken } from './api.js';
import Listings from './pages/Listings.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PropertyForm from './pages/PropertyForm.jsx';

// Client-side guard for UX only; the API enforces auth on every admin endpoint.
function RequireAdmin({ children }) {
  return getToken() ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Listings />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="admin/properties/new" element={<RequireAdmin><PropertyForm /></RequireAdmin>} />
        <Route path="admin/properties/:id/edit" element={<RequireAdmin><PropertyForm /></RequireAdmin>} />
        <Route path="*" element={<EmptyState title="Page not found">That page doesn't exist.</EmptyState>} />
      </Route>
    </Routes>
  );
}
