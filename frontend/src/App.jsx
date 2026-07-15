import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Cashier from './pages/Cashier';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Finance from './pages/Finance';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';
import CustomsImport from './pages/CustomsImport';
import Developer from './pages/Developer';
import FinanceSettings from './pages/FinanceSettings';
import Contracts from './pages/Contracts';
import ContractTemplates from './pages/ContractTemplates';
import ComplianceManager from './pages/ComplianceManager';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role is CASHIER, they only have access to cashier
    if (user.role === 'CASHIER') {
      return <Navigate to="/cashier" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
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
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="employees" element={<Employees />} />
              <Route path="finance" element={<Navigate to="reports" replace />} />
              <Route path="finance/transactions" element={<Transactions />} />
              <Route path="finance/reports" element={<Reports />} />
              <Route path="finance/actions" element={<ActivityLogs />} />
              <Route path="finance/settings" element={<FinanceSettings />} />
              <Route path="yuridik/shartnomalar" element={<Contracts />} />
              <Route path="yuridik/customs" element={<CustomsImport />} />
              <Route path="yuridik/shablonlar" element={<ContractTemplates />} />
              <Route path="yuridik/compliance" element={<ComplianceManager />} />
              <Route path="developer" element={<Developer />} />
            </Route>
          </Route>
        </Route>
        
        {/* Wildcard redirect for invalid or old routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
