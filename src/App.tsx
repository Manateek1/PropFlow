import { startTransition, useEffect, useState } from 'react';
import { calendarEvents, maintenanceRequests, monthlyPerformance, notifications, payments, tenants } from './data/mockData';
import { exportPaymentsCsv } from './utils/export';
import { PageId, MaintenanceRequest, Tenant } from './types';
import { NotificationDrawer, Sidebar, TopBar } from './components/layout';
import {
  MaintenanceDetailModal,
  MaintenanceFormModal,
  TenantFormModal,
  TenantProfileModal,
} from './components/modals';
import { DashboardPage } from './pages/DashboardPage';
import { TenantsPage } from './pages/TenantsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { CalendarPage } from './pages/CalendarPage';

const pageMeta: Record<PageId, { title: string; subtitle: string; searchPlaceholder: string }> = {
  dashboard: {
    title: 'Portfolio Overview',
    subtitle: 'Track residents, rent, and maintenance performance across the property.',
    searchPlaceholder: 'Search residents, units, requests...',
  },
  tenants: {
    title: 'Tenant Management',
    subtitle: 'Resident records, lease details, notes, and maintenance history.',
    searchPlaceholder: 'Search by name, unit, phone, or email...',
  },
  payments: {
    title: 'Payments Tracking',
    subtitle: 'Monitor rent collection, late balances, and revenue trends.',
    searchPlaceholder: 'Search payment records by tenant or unit...',
  },
  maintenance: {
    title: 'Maintenance Requests',
    subtitle: 'Keep work orders moving with urgency and clear ownership.',
    searchPlaceholder: 'Search requests, residents, or units...',
  },
  calendar: {
    title: 'Calendar & Due Dates',
    subtitle: 'See lease deadlines, move-outs, inspections, and rent due dates.',
    searchPlaceholder: 'Search events, tenants, or deadlines...',
  },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tenantRecords, setTenantRecords] = useState<Tenant[]>(tenants);
  const [requestRecords, setRequestRecords] = useState<MaintenanceRequest[]>(maintenanceRequests);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantFormOpen, setTenantFormOpen] = useState(false);
  const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const handleNavigate = (page: PageId) => {
    startTransition(() => {
      setCurrentPage(page);
      setNotificationsOpen(false);
    });
  };

  const handleSaveTenant = (tenant: Tenant) => {
    setTenantRecords((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === tenant.id);

      if (existingIndex === -1) {
        return [tenant, ...current];
      }

      return current.map((entry) => (entry.id === tenant.id ? tenant : entry));
    });
    setSelectedTenant(tenant);
    setEditingTenant(null);
    setTenantFormOpen(false);
    startTransition(() => setCurrentPage('tenants'));
  };

  const handleSaveRequest = (request: MaintenanceRequest) => {
    setRequestRecords((current) => [request, ...current]);
    setMaintenanceFormOpen(false);
    setSelectedRequest(request);
    startTransition(() => setCurrentPage('maintenance'));
  };

  const selectedTenantPayments = selectedTenant
    ? payments.filter((payment) => payment.tenantId === selectedTenant.id)
    : [];
  const selectedTenantRequests = selectedTenant
    ? requestRecords.filter((request) => request.tenantId === selectedTenant.id)
    : [];

  const page = (() => {
    if (currentPage === 'tenants') {
      return (
        <TenantsPage
          tenants={tenantRecords}
          payments={payments}
          requests={requestRecords}
          globalQuery={searchQuery}
          onSelectTenant={(tenant) => setSelectedTenant(tenant)}
          onAddTenant={() => {
            setEditingTenant(null);
            setTenantFormOpen(true);
          }}
        />
      );
    }

    if (currentPage === 'payments') {
      return (
        <PaymentsPage
          payments={payments}
          tenants={tenantRecords}
          monthlyPerformance={monthlyPerformance}
          globalQuery={searchQuery}
          onExport={exportPaymentsCsv}
        />
      );
    }

    if (currentPage === 'maintenance') {
      return (
        <MaintenancePage
          requests={requestRecords}
          globalQuery={searchQuery}
          onSelectRequest={(request) => setSelectedRequest(request)}
          onAddRequest={() => setMaintenanceFormOpen(true)}
        />
      );
    }

    if (currentPage === 'calendar') {
      return <CalendarPage events={calendarEvents} tenants={tenantRecords} globalQuery={searchQuery} />;
    }

    return (
      <DashboardPage
        tenants={tenantRecords}
        payments={payments}
        requests={requestRecords}
        monthlyPerformance={monthlyPerformance}
        onSelectTenant={(tenant) => setSelectedTenant(tenant)}
        onSelectRequest={(request) => setSelectedRequest(request)}
        onNavigate={handleNavigate}
      />
    );
  })();

  const openMaintenanceCount = requestRecords.filter((request) => request.status !== 'Completed').length;
  const meta = pageMeta[currentPage];

  return (
    <>
      <div className="app-shell">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          openMaintenanceCount={openMaintenanceCount}
        />

        <main className="app-shell__main">
          <TopBar
            pageTitle={meta.title}
            pageSubtitle={meta.subtitle}
            searchPlaceholder={meta.searchPlaceholder}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((current) => !current)}
            onToggleNotifications={() => setNotificationsOpen((current) => !current)}
            notificationCount={notifications.length}
          />
          <div className="app-shell__content">{page}</div>
        </main>
      </div>

      <NotificationDrawer
        open={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
      />

      <TenantProfileModal
        tenant={selectedTenant}
        payments={selectedTenantPayments}
        requests={selectedTenantRequests}
        onClose={() => setSelectedTenant(null)}
        onEdit={(tenant) => {
          setSelectedTenant(null);
          setEditingTenant(tenant);
          setTenantFormOpen(true);
        }}
      />

      <TenantFormModal
        open={tenantFormOpen}
        tenant={editingTenant}
        onClose={() => {
          setTenantFormOpen(false);
          setEditingTenant(null);
        }}
        onSave={handleSaveTenant}
      />

      <MaintenanceDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />

      <MaintenanceFormModal
        open={maintenanceFormOpen}
        tenants={tenantRecords}
        onClose={() => setMaintenanceFormOpen(false)}
        onSave={handleSaveRequest}
      />
    </>
  );
}
