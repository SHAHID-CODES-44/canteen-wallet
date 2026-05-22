import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import PrivateRoute from './PrivateRoute';

// Common
import RoleSelection from '../pages/common/RoleSelection';

// Parent
import ParentLogin from '../pages/parent/ParentLogin';
import OtpVerification from '../pages/parent/OtpVerification';
import ParentDashboard from '../pages/parent/ParentDashboard';
import TopUp from '../pages/parent/TopUp';
import TransactionHistory from '../pages/parent/TransactionHistory';

// Cashier
import CashierLogin from '../pages/cashier/CashierLogin';
import StationSelection from '../pages/cashier/StationSelection';
import StudentSearch from '../pages/cashier/StudentSearch';
import StudentProfile from '../pages/cashier/StudentProfile';
import MenuCart from '../pages/cashier/MenuCart';
import Checkout from '../pages/cashier/Checkout';
import CouponPrint from '../pages/cashier/CouponPrint';
import DaySummary from '../pages/cashier/DaySummary';

// Admin
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import DepositOverview from '../pages/admin/DepositOverview';
import ManualTopUp from '../pages/admin/ManualTopUp';
import SalesReport from '../pages/admin/SalesReport';
import DataImport from '../pages/admin/DataImport';
import MenuManagement from '../pages/admin/MenuManagement';
import UserManagement from '../pages/admin/UserManagement';
import BarcodeGenerator from '../pages/admin/BarcodeGenerator';
import AddParent from '../pages/admin/AddParent';

// Component to handle back button after logout
// Component to handle back button after logout
const RouteGuard = ({ children }) => {
    const { token, isTokenValid, loading } = useAuth();
    const location = useLocation();

    // Wait for auth to finish loading
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Loading...
            </div>
        );
    }

    // If user is on a protected route but token is invalid/expired
    const isProtectedRoute = !['/', '/parent/login', '/parent/otp', '/cashier/login', '/admin/login'].includes(location.pathname);

    if (isProtectedRoute && (!token || !isTokenValid(token))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRoutesContent = () => {
    return (
        <RouteGuard>
            <Routes>
                {/* Common */}
                <Route path="/" element={<RoleSelection />} />

                {/* Parent */}
                <Route path="/parent/login" element={<ParentLogin />} />
                <Route path="/parent/otp" element={<OtpVerification />} />
                <Route path="/parent/dashboard" element={
                    <PrivateRoute role="PARENT">
                        <ParentDashboard />
                    </PrivateRoute>
                } />
                <Route path="/parent/topup" element={
                    <PrivateRoute role="PARENT">
                        <TopUp />
                    </PrivateRoute>
                } />
                <Route path="/parent/transactions" element={
                    <PrivateRoute role="PARENT">
                        <TransactionHistory />
                    </PrivateRoute>
                } />

                {/* Cashier */}
                <Route path="/cashier/login" element={<CashierLogin />} />
                <Route path="/cashier/station" element={
                    <PrivateRoute role="CASHIER">
                        <StationSelection />
                    </PrivateRoute>
                } />
                <Route path="/cashier/search" element={
                    <PrivateRoute role="CASHIER">
                        <StudentSearch />
                    </PrivateRoute>
                } />
                <Route path="/cashier/student" element={
                    <PrivateRoute role="CASHIER">
                        <StudentProfile />
                    </PrivateRoute>
                } />
                <Route path="/cashier/cart" element={
                    <PrivateRoute role="CASHIER">
                        <MenuCart />
                    </PrivateRoute>
                } />
                <Route path="/cashier/checkout" element={
                    <PrivateRoute role="CASHIER">
                        <Checkout />
                    </PrivateRoute>
                } />
                <Route path="/cashier/coupon" element={
                    <PrivateRoute role="CASHIER">
                        <CouponPrint />
                    </PrivateRoute>
                } />
                <Route path="/cashier/summary" element={
                    <PrivateRoute role="CASHIER">
                        <DaySummary />
                    </PrivateRoute>
                } />

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                    <PrivateRoute role="ADMIN">
                        <AdminDashboard />
                    </PrivateRoute>
                } />
                <Route path="/admin/deposits" element={
                    <PrivateRoute role="ADMIN">
                        <DepositOverview />
                    </PrivateRoute>
                } />
                <Route path="/admin/topup" element={
                    <PrivateRoute role="ADMIN">
                        <ManualTopUp />
                    </PrivateRoute>
                } />
                <Route path="/admin/sales" element={
                    <PrivateRoute role="ADMIN">
                        <SalesReport />
                    </PrivateRoute>
                } />
                <Route path="/admin/import" element={
                    <PrivateRoute role="ADMIN">
                        <DataImport />
                    </PrivateRoute>
                } />
                <Route path="/admin/menu" element={
                    <PrivateRoute role="ADMIN">
                        <MenuManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/users" element={
                    <PrivateRoute role="ADMIN">
                        <UserManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/barcodes" element={
                    <PrivateRoute role="ADMIN">
                        <BarcodeGenerator />
                    </PrivateRoute>
                } />
                <Route path="/admin/add-parent" element={
                    <PrivateRoute role="ADMIN">
                        <AddParent />
                    </PrivateRoute>
                } />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </RouteGuard>
    );
};

const AppRoutes = () => {
    return (
        <AuthProvider>
            <AppRoutesContent />
        </AuthProvider>
    );
};

export default AppRoutes;