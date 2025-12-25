import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  DollarSign, 
  FileText, 
  Building2, 
  FolderKanban, 
  ShoppingCart,
  Landmark,
  PieChart,
  FileSpreadsheet,
  TrendingUp,
  Upload,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Income', href: '/income', icon: DollarSign },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
  { name: 'Bank Statements', href: '/bank-statements', icon: Landmark },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  { name: 'Statistics', href: '/statistics', icon: TrendingUp },
  { name: 'Bulk Import', href: '/bulk-import', icon: Upload },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-black">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-2xl font-bold text-primary">ë</div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-white">Financial Dashboard</span>
            <span className="text-[10px] text-muted-foreground">2025</span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <div className="section-header px-3">Navigation</div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-sm',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary border-l-2 border-transparent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="uppercase tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-white/10 p-3">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-sm',
            location.pathname === '/settings'
              ? 'bg-primary/10 text-primary border-l-2 border-primary'
              : 'text-muted-foreground hover:bg-primary/5 hover:text-primary border-l-2 border-transparent'
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="uppercase tracking-wide">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;