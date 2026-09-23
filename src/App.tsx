import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';

// Layout & Global Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/common/SearchModal';
import { QuickviewModal } from './components/common/QuickviewModal';
import { WishlistDrawer } from './components/common/WishlistDrawer';
import { LightboxModal } from './components/lookbook/LightboxModal';
import { LanguageGatewayModal } from './components/common/LanguageGatewayModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LensServicesPage } from './pages/LensServicesPage';
import { LookbookPage } from './pages/LookbookPage';
import { ContactPage } from './pages/ContactPage';

// Admin CMS
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductEditorPage } from './pages/admin/AdminProductEditorPage';
import { AdminCampaignsPage } from './pages/admin/AdminCampaignsPage';
import { AdminCampaignEditorPage } from './pages/admin/AdminCampaignEditorPage';
import { AdminLensesPage } from './pages/admin/AdminLensesPage';
import { AdminLensEditorPage } from './pages/admin/AdminLensEditorPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminPromotionEditorPage } from './pages/admin/AdminPromotionEditorPage';
import { AdminLookbookPage } from './pages/admin/AdminLookbookPage';
import { AdminLookbookEditorPage } from './pages/admin/AdminLookbookEditorPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminHomepageLayoutPage } from './pages/admin/AdminHomepageLayoutPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';
import { AdminDeveloperPage } from './pages/admin/AdminDeveloperPage';

// Stores
import { useProductStore } from './store/useProductStore';
import { useSettingsStore } from './store/useSettingsStore';

// Scroll to top helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Public Layout Shell
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SearchModal />
      <QuickviewModal />
      <WishlistDrawer />
      <LightboxModal />
    </div>
  );
};

export function App() {
  const loadInitialData = useProductStore((state) => state.loadInitialData);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    loadInitialData();
    loadSettings();
  }, [loadInitialData, loadSettings]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageGatewayModal />
      <Routes>
        {/* Public Storefront Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/lenses" element={<LensServicesPage />} />
          <Route path="/lookbook" element={<LookbookPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin CMS Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="homepage" element={<AdminHomepageLayoutPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductEditorPage />} />
          <Route path="products/:id" element={<AdminProductEditorPage />} />
          <Route path="campaigns" element={<AdminCampaignsPage />} />
          <Route path="campaigns/new" element={<AdminCampaignEditorPage />} />
          <Route path="campaigns/:id" element={<AdminCampaignEditorPage />} />
          <Route path="lenses" element={<AdminLensesPage />} />
          <Route path="lenses/new" element={<AdminLensEditorPage />} />
          <Route path="lenses/:id" element={<AdminLensEditorPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
          <Route path="promotions/new" element={<AdminPromotionEditorPage />} />
          <Route path="promotions/:id" element={<AdminPromotionEditorPage />} />
          <Route path="lookbook" element={<AdminLookbookPage />} />
          <Route path="lookbook/new" element={<AdminLookbookEditorPage />} />
          <Route path="lookbook/:id" element={<AdminLookbookEditorPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="activity" element={<AdminActivityPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="developer" element={<AdminDeveloperPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
