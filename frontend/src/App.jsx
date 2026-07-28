import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Cashier from './pages/Cashier';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';
import CustomsImport from './pages/CustomsImport';
import Developer from './pages/Developer';
import FinanceSettings from './pages/FinanceSettings';
import Contracts from './pages/Contracts';
import ContractTemplates from './pages/ContractTemplates';
import ComplianceManager from './pages/ComplianceManager';
import Tariffs from './pages/Tariffs';
import MobileAdminLayout from './layouts/MobileAdminLayout';
import MobileDashboard from './pages/MobileDashboard';
import MobileFinance from './pages/MobileFinance';
import MobileEmployees from './pages/MobileEmployees';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SalesProvider } from './context/SalesContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'CASHIER') {
      return <Navigate to="/cashier" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to={user?.role === 'CASHIER' ? "/cashier" : "/dashboard"} replace />} />
          
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']} />}>
            <Route path="cashier" element={<Cashier />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="employees" element={<Employees />} />
            <Route path="finance" element={<Navigate to="reports" replace />} />
            <Route path="finance/transactions" element={<Transactions />} />
            <Route path="finance/reports" element={<Reports />} />
            <Route path="finance/actions" element={<ActivityLogs />} />
            <Route path="finance/settings" element={<FinanceSettings />} />
            <Route path="finance/tariffs" element={<Tariffs />} />
            <Route path="yuridik/shartnomalar" element={<Contracts />} />
            <Route path="yuridik/customs" element={<CustomsImport />} />
            <Route path="yuridik/shablonlar" element={<ContractTemplates />} />
            <Route path="yuridik/compliance" element={<ComplianceManager />} />
            <Route path="developer" element={<Developer />} />
          </Route>
        </Route>
        
        {/* Mobile Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/mobile" element={<MobileAdminLayout />}>
            <Route index element={<Navigate to="/mobile/dashboard" replace />} />
            <Route path="dashboard" element={<MobileDashboard />} />
            <Route path="finance" element={<MobileFinance />} />
            <Route path="employees" element={<MobileEmployees />} />
          </Route>
        </Route>
      </Route>
      
      {/* Wildcard redirect for invalid or old routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <SalesProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
              <AppRoutes />
            </div>
          </SalesProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
