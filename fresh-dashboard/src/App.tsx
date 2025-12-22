import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import PasswordResetHandler from '@/components/PasswordResetHandler';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Invoices from './pages/Invoices';
import Departments from './pages/Departments';
import Projects from './pages/Projects';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import TaxReturn from './pages/TaxReturn';
import BankStatements from './pages/BankStatements';
import PurchaseOrders from './pages/PurchaseOrders';
import ExportReports from './pages/ExportReports';
import BulkImport from './pages/BulkImport';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import AuditTrail from './pages/AuditTrail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <PasswordResetHandler />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes with Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="income" element={<Income />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="departments" element={<Departments />} />
              <Route path="projects" element={<Projects />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="tax-return" element={<TaxReturn />} />
              <Route path="bank-statements" element={<BankStatements />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="export-reports" element={<ExportReports />} />
              <Route path="bulk-import" element={<BulkImport />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="audit-trail" element={<AuditTrail />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;