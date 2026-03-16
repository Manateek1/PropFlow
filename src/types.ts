export type PageId = 'dashboard' | 'tenants' | 'payments' | 'maintenance' | 'calendar';

export type PaymentStatus = 'Paid' | 'Late' | 'Partial' | 'Overdue';
export type PaymentMethod = 'ACH' | 'Card' | 'Check' | 'Wire';
export type MaintenanceStatus = 'New' | 'In Progress' | 'Completed' | 'Urgent';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC'
  | 'Appliance'
  | 'Safety'
  | 'General';

export interface TenantNote {
  id: string;
  date: string;
  author: string;
  content: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  paymentStatus: PaymentStatus;
  phone: string;
  email: string;
  balance: number;
  occupation: string;
  emergencyContact: string;
  notes: TenantNote[];
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  month: string;
  dueDate: string;
  paymentDate?: string;
  amountDue: number;
  amountPaid: number;
  method: PaymentMethod;
  status: PaymentStatus;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  submittedAt: string;
  updatedAt: string;
  assignee: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: 'neutral' | 'positive' | 'warning';
}

export interface MonthlyPerformance {
  month: string;
  collected: number;
  outstanding: number;
  requests: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Rent Due' | 'Lease Renewal' | 'Move-Out' | 'Inspection';
  unitNumber?: string;
  tenantName?: string;
}

export interface PortfolioSnapshot {
  totalUnits: number;
  occupiedUnits: number;
  averageOccupancyRate: number;
  totalTenants: number;
}
