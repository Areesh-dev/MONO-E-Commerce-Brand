import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import LoadingSpinner, { FullPageLoader } from '../components/ui/LoadingSpinner';

const Home = lazy(() => import('../pages/Home'));
const Products = lazy(() => import('../pages/Products'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Categories = lazy(() => import('../pages/Categories'));
const CategoryDetail = lazy(() => import('../pages/CategoryDetail'));
const Search = lazy(() => import('../pages/Search'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const Cart = lazy(() => import('../pages/Cart'));
const FAQ = lazy(() => import('../pages/FAQ'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Wishlist = lazy(() => import('../pages/Wishlist'));


const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/admin/Products'));
const AdminCategories = lazy(() => import('../pages/admin/Categories'));
const AdminSizes = lazy(() => import('../pages/admin/Sizes'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminOrders = lazy(() => import('../pages/admin/Orders'));
const AdminReviews = lazy(() => import('../pages/admin/Reviews'));
const AdminHero = lazy(() => import('../pages/admin/Hero'));
const AdminWhyChooseUs = lazy(() => import('../pages/admin/WhyChooseUs'));
const AdminBrands = lazy(() => import('../pages/admin/Brands'));
const AdminContentSections = lazy(() => import('../pages/admin/ContentSections'));
const AdminFaqs = lazy(() => import('../pages/admin/Faqs'));
const AdminCoupons = lazy(() => import('../pages/admin/Coupons'));
const AdminSocialLinks = lazy(() => import('../pages/admin/SocialLinks'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

function CustomerRoute({ children }) {
    return <Suspense fallback={<LoadingSpinner label="Loading" />}>{children}</Suspense>;
}

function AdminSuspense({ children }) {
    return <Suspense fallback={<FullPageLoader label="Loading" />}>{children}</Suspense>;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<CustomerRoute><Home /></CustomerRoute>} />
                <Route path="products" element={<CustomerRoute><Products /></CustomerRoute>} />
                <Route path="products/:slug" element={<CustomerRoute><ProductDetail /></CustomerRoute>} />
                <Route path="categories" element={<CustomerRoute><Categories /></CustomerRoute>} />
                <Route path="categories/:slug" element={<CustomerRoute><CategoryDetail /></CustomerRoute>} />
                <Route path="search" element={<CustomerRoute><Search /></CustomerRoute>} />
                <Route path="faq" element={<CustomerRoute><FAQ /></CustomerRoute>} />
                <Route path="privacy-policy" element={<CustomerRoute><Privacy /></CustomerRoute>} />
                <Route path="terms" element={<CustomerRoute><Terms /></CustomerRoute>} />
                <Route path="cart" element={<ProtectedRoute><CustomerRoute><Cart /></CustomerRoute></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><CustomerRoute><Profile /></CustomerRoute></ProtectedRoute>} />
                <Route path="wishlist" element={<ProtectedRoute><CustomerRoute><Wishlist /></CustomerRoute></ProtectedRoute>} />
                <Route path="profile/orders" element={<ProtectedRoute><CustomerRoute><Orders /></CustomerRoute></ProtectedRoute>} />
                <Route path="profile/orders/:id" element={<ProtectedRoute><CustomerRoute><OrderDetail /></CustomerRoute></ProtectedRoute>} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />

            <Route path="admin/login" element={<AdminSuspense><AdminLogin /></AdminSuspense>} />
            <Route path="admin" element={<AdminRoute><AdminSuspense><AdminLayout /></AdminSuspense></AdminRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminSuspense><Dashboard /></AdminSuspense>} />
                <Route path="products" element={<AdminSuspense><AdminProducts /></AdminSuspense>} />
                <Route path="categories" element={<AdminSuspense><AdminCategories /></AdminSuspense>} />
                <Route path="sizes" element={<AdminSuspense><AdminSizes /></AdminSuspense>} />
                <Route path="users" element={<AdminSuspense><AdminUsers /></AdminSuspense>} />
                <Route path="orders" element={<AdminSuspense><AdminOrders /></AdminSuspense>} />
                <Route path="reviews" element={<AdminSuspense><AdminReviews /></AdminSuspense>} />
                <Route path="hero" element={<AdminSuspense><AdminHero /></AdminSuspense>} />
                <Route path="why-choose-us" element={<AdminSuspense><AdminWhyChooseUs /></AdminSuspense>} />
                <Route path="brands" element={<AdminSuspense><AdminBrands /></AdminSuspense>} />
                <Route path="faqs" element={<AdminSuspense><AdminFaqs /></AdminSuspense>} />
                <Route path="content-sections" element={<AdminSuspense><AdminContentSections /></AdminSuspense>} />
                <Route path="coupons" element={<AdminSuspense><AdminCoupons /></AdminSuspense>} />
                <Route path="social-links" element={<AdminSuspense><AdminSocialLinks /></AdminSuspense>} />
                <Route path="settings" element={<AdminSuspense><AdminSettings /></AdminSuspense>} />
            </Route>

            <Route path="*" element={<CustomerRoute><NotFound /></CustomerRoute>} />
        </Routes>
    );
}