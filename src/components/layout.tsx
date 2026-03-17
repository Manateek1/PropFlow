import { ReactNode } from 'react';
import { NotificationItem, PageId } from '../types';
import { initials } from '../utils/formatters';
import {
  BellIcon,
  BrandIcon,
  CalendarIcon,
  ChevronRightIcon,
  CloseIcon,
  DashboardIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
} from './icons';

type SidebarProps = {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  openMaintenanceCount: number;
};

const navItems: Array<{
  id: PageId;
  label: string;
  icon: typeof DashboardIcon;
}> = [
  { id: 'dashboard', label: 'Overview', icon: DashboardIcon },
  { id: 'tenants', label: 'Tenants', icon: UsersIcon },
  { id: 'payments', label: 'Payments', icon: WalletIcon },
  { id: 'maintenance', label: 'Maintenance', icon: WrenchIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
];

export function Sidebar({ currentPage, onNavigate, openMaintenanceCount }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__icon">
          <BrandIcon width={22} height={22} />
        </div>
        <div>
          <h1>PropFlow</h1>
          <p>Property operations</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === currentPage;
          const badge = item.id === 'maintenance' ? openMaintenanceCount : undefined;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item${isActive ? ' nav-item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-item__icon">
                <Icon width={18} height={18} />
              </span>
              <span className="nav-item__label">{item.label}</span>
              {badge ? <span className="nav-item__badge">{badge}</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__pulse">
          <span className="sidebar__pulse-dot" />
          93% occupancy this quarter
        </div>
        <p>Vacancy pipeline is tracking ahead of last month.</p>
      </div>
    </aside>
  );
}

type TopBarProps = {
  pageTitle: string;
  pageSubtitle: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onToggleNotifications: () => void;
  notificationCount: number;
};

export function TopBar({
  pageTitle,
  pageSubtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  isDarkMode,
  onToggleTheme,
  onToggleNotifications,
  notificationCount,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Property management workspace</p>
        <h2>{pageTitle}</h2>
        <p className="topbar__subtitle">{pageSubtitle}</p>
      </div>

      <div className="topbar__actions">
        <label className="search-field" aria-label="Search">
          <SearchIcon width={16} height={16} />
          <input
            type="search"
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <button type="button" className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">
          {isDarkMode ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
        </button>

        <button
          type="button"
          className="icon-button icon-button--notified"
          onClick={onToggleNotifications}
          aria-label="Open notifications"
        >
          <BellIcon width={18} height={18} />
          {notificationCount > 0 ? <span>{notificationCount}</span> : null}
        </button>

        <div className="profile-pill">
          <div className="profile-pill__avatar">U</div>
          <div>
            <strong>User</strong>
            <span>Property manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}

type PanelProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Panel({ title, subtitle, action, className, children }: PanelProps) {
  return (
    <section className={`panel${className ? ` ${className}` : ''}`}>
      {(title || subtitle || action) && (
        <div className="panel__header">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action ? <div className="panel__action">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  icon: ReactNode;
  tone?: 'teal' | 'gold' | 'coral' | 'slate';
};

export function SummaryCard({ title, value, subtitle, trend, icon, tone = 'teal' }: SummaryCardProps) {
  return (
    <div className="summary-card" data-tone={tone}>
      <div className="summary-card__icon">{icon}</div>
      <div className="summary-card__content">
        <span>{title}</span>
        <strong>{value}</strong>
        <p>{subtitle}</p>
      </div>
      {trend ? <div className="summary-card__trend">{trend}</div> : null}
    </div>
  );
}

type StatusBadgeProps = {
  label: string;
  variant?: 'payment' | 'maintenance' | 'priority' | 'event';
};

export function StatusBadge({ label, variant = 'payment' }: StatusBadgeProps) {
  return (
    <span className="status-badge" data-variant={variant} data-label={label.toLowerCase().replace(/\s+/g, '-')}>
      {label}
    </span>
  );
}

type NotificationDrawerProps = {
  open: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
};

export function NotificationDrawer({ open, notifications, onClose }: NotificationDrawerProps) {
  return (
    <div className={`notification-drawer${open ? ' notification-drawer--open' : ''}`}>
      <div className="notification-drawer__overlay" onClick={onClose} />
      <aside className="notification-drawer__panel">
        <div className="notification-drawer__header">
          <div>
            <p className="eyebrow">Inbox</p>
            <h3>Team notifications</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close notifications">
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="notification-list">
          {notifications.length ? (
            notifications.map((notification) => (
              <article key={notification.id} className="notification-card" data-tone={notification.tone}>
                <div className="notification-card__avatar">{initials(notification.title)}</div>
                <div className="notification-card__body">
                  <div className="notification-card__title-row">
                    <strong>{notification.title}</strong>
                    <span>{notification.time}</span>
                  </div>
                  <p>{notification.body}</p>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="Nothing new yet"
              description="Notifications will appear here when rent, lease, or maintenance activity starts coming in."
            />
          )}
        </div>
      </aside>
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <ChevronRightIcon width={18} height={18} />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
