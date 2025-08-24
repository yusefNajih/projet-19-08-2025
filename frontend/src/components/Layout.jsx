import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Users, 
  Calendar, 
  FileText, 
  Receipt, 
  Wrench, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';

import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';

const Layout = ({ children, currentPage, onPageChange, user, onLogout }) => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: t('dashboard') },
    { id: 'vehicles', icon: Car, label: t('vehicles') },
    { id: 'clients', icon: Users, label: t('clients') },
    { id: 'reservations', icon: Calendar, label: t('reservations') },
    // Affiche le bouton Suivi administratif seulement pour l'admin
   ...(user && user.role === 'admin' ? [
      { id: 'vehicle-admin', icon: FileText, label: t('Suivi administratif') }
    ] : []),
    { id: 'contracts', icon: FileText, label: t('contracts') },
    // { id: 'maintenance', icon: Wrench, label: t('maintenance') },
    { id: 'reports', icon: BarChart3, label: t('reports') },
    { id: 'settings', icon: Settings, label: t('settings') }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-background text-foreground dark:bg-[var(--sidebar)] dark:text-[var(--sidebar-foreground)]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-xl font-bold text-primary dark:text-[var(--sidebar-foreground)]">
            {t('companyName')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-[var(--sidebar-foreground)]">
                {user.firstName} {user.lastName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-border transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-[57px] lg:mt-0
          bg-[var(--sidebar)] text-[var(--sidebar-foreground)] dark:bg-[var(--sidebar)] dark:text-[var(--sidebar-foreground)]
        `}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

