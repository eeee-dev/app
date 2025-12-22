import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  DollarSign,
  Building2,
  FolderKanban,
  ShoppingCart,
  Wallet,
  TrendingUp,
  FileBarChart,
  Settings,
  Users,
  BarChart3,
  Upload,
  Calculator,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Income', href: '/income', icon: DollarSign },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
  { name: 'Bank Statements', href: '/bank-statements', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
  { name: 'Statistics', href: '/statistics', icon: BarChart3 },
  { name: 'Bulk Import', href: '/bulk-import', icon: Upload },
  { name: 'Tax Return', href: '/tax-return', icon: Calculator },
  { name: 'Audit Trail', href: '/audit-trail', icon: History },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-black border-r border-white/10">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10">
        <span className="text-3xl font-bold text-primary tracking-wider">ë</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <div className="section-header">Navigation</div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'nav-minimal group flex items-center px-3 py-2.5 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="uppercase tracking-wider text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">
          Financial Dashboard
        </p>
        <p className="text-center text-xs text-muted-foreground mt-1">
          2025
        </p>
      </div>
    </div>
  );
}