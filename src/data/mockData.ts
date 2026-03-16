import {
  CalendarEvent,
  MaintenanceRequest,
  MonthlyPerformance,
  NotificationItem,
  Payment,
  PortfolioSnapshot,
  Tenant,
} from '../types';

export const portfolio: PortfolioSnapshot = {
  totalUnits: 0,
  occupiedUnits: 0,
  averageOccupancyRate: 0,
  totalTenants: 0,
};

export const tenants: Tenant[] = [];

export const payments: Payment[] = [];

export const maintenanceRequests: MaintenanceRequest[] = [];

export const monthlyPerformance: MonthlyPerformance[] = [
  { month: 'Oct', collected: 0, outstanding: 0, requests: 0 },
  { month: 'Nov', collected: 0, outstanding: 0, requests: 0 },
  { month: 'Dec', collected: 0, outstanding: 0, requests: 0 },
  { month: 'Jan', collected: 0, outstanding: 0, requests: 0 },
  { month: 'Feb', collected: 0, outstanding: 0, requests: 0 },
  { month: 'Mar', collected: 0, outstanding: 0, requests: 0 },
];

export const notifications: NotificationItem[] = [];

export const calendarEvents: CalendarEvent[] = [];
