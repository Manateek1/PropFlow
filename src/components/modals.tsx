import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { MaintenanceRequest, MaintenanceStatus, Payment, Tenant } from '../types';
import { formatCurrency, formatDate, formatMonth, initials } from '../utils/formatters';
import { CloseIcon, PlusIcon } from './icons';
import { Panel, StatusBadge } from './layout';

type ModalShellProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  width?: 'medium' | 'large';
};

export function ModalShell({ open, title, subtitle, onClose, children, width = 'large' }: ModalShellProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-shell__overlay" onClick={onClose} />
      <div className={`modal-shell__panel modal-shell__panel--${width}`}>
        <div className="modal-shell__header">
          <div>
            <p className="eyebrow">Details</p>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <CloseIcon width={18} height={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type TenantProfileModalProps = {
  tenant: Tenant | null;
  payments: Payment[];
  requests: MaintenanceRequest[];
  onClose: () => void;
  onEdit: (tenant: Tenant) => void;
};

export function TenantProfileModal({
  tenant,
  payments,
  requests,
  onClose,
  onEdit,
}: TenantProfileModalProps) {
  if (!tenant) {
    return null;
  }

  return (
    <ModalShell
      open={Boolean(tenant)}
      title={tenant.fullName}
      subtitle={`${tenant.unitNumber} • Lease ends ${formatDate(tenant.leaseEnd)}`}
      onClose={onClose}
    >
      <div className="tenant-modal">
        <div className="tenant-modal__hero">
          <div className="tenant-modal__identity">
            <div className="tenant-modal__avatar">{initials(tenant.fullName)}</div>
            <div>
              <h4>{tenant.fullName}</h4>
              <p>{tenant.occupation}</p>
            </div>
          </div>
          <div className="tenant-modal__actions">
            <button type="button" className="button button--secondary" onClick={() => onEdit(tenant)}>
              Edit tenant
            </button>
            <StatusBadge label={tenant.paymentStatus} variant="payment" />
          </div>
        </div>

        <div className="tenant-modal__grid">
          <Panel title="Personal info">
            <dl className="details-list">
              <div>
                <dt>Phone</dt>
                <dd>{tenant.phone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{tenant.email}</dd>
              </div>
              <div>
                <dt>Emergency contact</dt>
                <dd>{tenant.emergencyContact}</dd>
              </div>
              <div>
                <dt>Current balance</dt>
                <dd>{formatCurrency(tenant.balance)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Lease details">
            <dl className="details-list">
              <div>
                <dt>Lease start</dt>
                <dd>{formatDate(tenant.leaseStart)}</dd>
              </div>
              <div>
                <dt>Lease end</dt>
                <dd>{formatDate(tenant.leaseEnd)}</dd>
              </div>
              <div>
                <dt>Monthly rent</dt>
                <dd>{formatCurrency(tenant.monthlyRent)}</dd>
              </div>
              <div>
                <dt>Unit</dt>
                <dd>{tenant.unitNumber}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Payment history" className="tenant-modal__wide">
            {payments.length ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Due date</th>
                      <th>Paid</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatMonth(payment.month)}</td>
                        <td>{formatDate(payment.dueDate)}</td>
                        <td>{formatCurrency(payment.amountPaid)}</td>
                        <td>{payment.method}</td>
                        <td>
                          <StatusBadge label={payment.status} variant="payment" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-inline">No payment history recorded yet.</div>
            )}
          </Panel>

          <Panel title="Notes">
            <div className="timeline-list">
              {tenant.notes.map((note) => (
                <article key={note.id} className="timeline-item">
                  <span>{formatDate(note.date, { month: 'short', day: 'numeric' })}</span>
                  <div>
                    <strong>{note.author}</strong>
                    <p>{note.content}</p>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Maintenance history">
            <div className="timeline-list">
              {requests.length ? (
                requests.map((request) => (
                  <article key={request.id} className="timeline-item">
                    <span>{formatDate(request.submittedAt, { month: 'short', day: 'numeric' })}</span>
                    <div>
                      <div className="timeline-item__header">
                        <strong>{request.title}</strong>
                        <StatusBadge label={request.status} variant="maintenance" />
                      </div>
                      <p>{request.category} • {request.assignee}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-inline">No maintenance activity yet.</div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </ModalShell>
  );
}

type TenantFormModalProps = {
  open: boolean;
  tenant?: Tenant | null;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
};

type TenantFormState = {
  fullName: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: string;
  paymentStatus: Tenant['paymentStatus'];
  phone: string;
  email: string;
  balance: string;
  occupation: string;
  emergencyContact: string;
};

const defaultTenantForm: TenantFormState = {
  fullName: '',
  unitNumber: '',
  leaseStart: '2026-04-01',
  leaseEnd: '2027-03-31',
  monthlyRent: '2300',
  paymentStatus: 'Paid',
  phone: '',
  email: '',
  balance: '0',
  occupation: '',
  emergencyContact: '',
};

export function TenantFormModal({ open, tenant, onClose, onSave }: TenantFormModalProps) {
  const [formState, setFormState] = useState<TenantFormState>(defaultTenantForm);

  useEffect(() => {
    if (tenant) {
      setFormState({
        fullName: tenant.fullName,
        unitNumber: tenant.unitNumber,
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd,
        monthlyRent: String(tenant.monthlyRent),
        paymentStatus: tenant.paymentStatus,
        phone: tenant.phone,
        email: tenant.email,
        balance: String(tenant.balance),
        occupation: tenant.occupation,
        emergencyContact: tenant.emergencyContact,
      });
    } else {
      setFormState(defaultTenantForm);
    }
  }, [tenant, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedId =
      tenant?.id ??
      `tenant-${formState.fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`;

    onSave({
      id: normalizedId,
      fullName: formState.fullName,
      unitNumber: formState.unitNumber,
      leaseStart: formState.leaseStart,
      leaseEnd: formState.leaseEnd,
      monthlyRent: Number(formState.monthlyRent),
      paymentStatus: formState.paymentStatus,
      phone: formState.phone,
      email: formState.email,
      balance: Number(formState.balance),
      occupation: formState.occupation,
      emergencyContact: formState.emergencyContact,
      notes: tenant?.notes ?? [
        {
          id: `note-${Date.now()}`,
          date: '2026-03-16',
          author: 'Leasing Team',
          content: 'New tenant added to the portfolio workspace.',
        },
      ],
    });
  };

  return (
    <ModalShell
      open={open}
      title={tenant ? 'Edit tenant' : 'Add tenant'}
      subtitle="Update lease, contact, and billing details."
      onClose={onClose}
      width="medium"
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={formState.fullName}
              onChange={(event) => setFormState({ ...formState, fullName: event.target.value })}
              required
            />
          </label>
          <label>
            Unit number
            <input
              value={formState.unitNumber}
              onChange={(event) => setFormState({ ...formState, unitNumber: event.target.value })}
              required
            />
          </label>
          <label>
            Lease start
            <input
              type="date"
              value={formState.leaseStart}
              onChange={(event) => setFormState({ ...formState, leaseStart: event.target.value })}
              required
            />
          </label>
          <label>
            Lease end
            <input
              type="date"
              value={formState.leaseEnd}
              onChange={(event) => setFormState({ ...formState, leaseEnd: event.target.value })}
              required
            />
          </label>
          <label>
            Monthly rent
            <input
              type="number"
              value={formState.monthlyRent}
              onChange={(event) => setFormState({ ...formState, monthlyRent: event.target.value })}
              required
            />
          </label>
          <label>
            Payment status
            <select
              value={formState.paymentStatus}
              onChange={(event) =>
                setFormState({ ...formState, paymentStatus: event.target.value as Tenant['paymentStatus'] })
              }
            >
              <option value="Paid">Paid</option>
              <option value="Late">Late</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
          </label>
          <label>
            Phone
            <input value={formState.phone} onChange={(event) => setFormState({ ...formState, phone: event.target.value })} required />
          </label>
          <label>
            Email
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
              required
            />
          </label>
          <label>
            Outstanding balance
            <input
              type="number"
              value={formState.balance}
              onChange={(event) => setFormState({ ...formState, balance: event.target.value })}
              required
            />
          </label>
          <label>
            Occupation
            <input
              value={formState.occupation}
              onChange={(event) => setFormState({ ...formState, occupation: event.target.value })}
              required
            />
          </label>
          <label className="form-grid__full">
            Emergency contact
            <input
              value={formState.emergencyContact}
              onChange={(event) => setFormState({ ...formState, emergencyContact: event.target.value })}
              required
            />
          </label>
        </div>

        <div className="modal-form__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button">
            <PlusIcon width={16} height={16} />
            {tenant ? 'Save changes' : 'Add tenant'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

type MaintenanceDetailModalProps = {
  request: MaintenanceRequest | null;
  onClose: () => void;
};

export function MaintenanceDetailModal({ request, onClose }: MaintenanceDetailModalProps) {
  if (!request) {
    return null;
  }

  return (
    <ModalShell
      open={Boolean(request)}
      title={request.title}
      subtitle={`${request.unitNumber} • Submitted ${formatDate(request.submittedAt)}`}
      onClose={onClose}
      width="medium"
    >
      <div className="maintenance-detail">
        <div className="maintenance-detail__badges">
          <StatusBadge label={request.status} variant="maintenance" />
          <StatusBadge label={request.priority} variant="priority" />
        </div>

        <Panel title="Request summary">
          <p className="maintenance-detail__description">{request.description}</p>
          <dl className="details-list">
            <div>
              <dt>Category</dt>
              <dd>{request.category}</dd>
            </div>
            <div>
              <dt>Tenant</dt>
              <dd>{request.tenantName}</dd>
            </div>
            <div>
              <dt>Assigned to</dt>
              <dd>{request.assignee}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(request.updatedAt)}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </ModalShell>
  );
}

type MaintenanceFormModalProps = {
  open: boolean;
  tenants: Tenant[];
  onClose: () => void;
  onSave: (request: MaintenanceRequest) => void;
};

type MaintenanceFormState = {
  title: string;
  description: string;
  category: MaintenanceRequest['category'];
  priority: MaintenanceRequest['priority'];
  status: MaintenanceStatus;
  tenantId: string;
};

const defaultMaintenanceForm: MaintenanceFormState = {
  title: '',
  description: '',
  category: 'General',
  priority: 'Medium',
  status: 'New',
  tenantId: '',
};

export function MaintenanceFormModal({ open, tenants, onClose, onSave }: MaintenanceFormModalProps) {
  const [formState, setFormState] = useState<MaintenanceFormState>(defaultMaintenanceForm);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState({
      ...defaultMaintenanceForm,
      tenantId: tenants[0]?.id ?? '',
    });
  }, [tenants, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tenant = tenants.find((entry) => entry.id === formState.tenantId);

    if (!tenant) {
      return;
    }

    const now = new Date().toISOString();

    onSave({
      id: `request-${Date.now()}`,
      title: formState.title,
      description: formState.description,
      category: formState.category,
      priority: formState.priority,
      status: formState.status,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      unitNumber: tenant.unitNumber,
      submittedAt: now,
      updatedAt: now,
      assignee: formState.status === 'New' ? 'Awaiting assignment' : 'M. Ortega',
    });
  };

  return (
    <ModalShell
      open={open}
      title="Add maintenance request"
      subtitle="Capture the issue, assign priority, and link the correct resident."
      onClose={onClose}
      width="medium"
    >
      {!tenants.length ? (
        <div className="modal-form">
          <div className="empty-inline">
            Add a tenant first so maintenance requests can be linked to a resident and unit.
          </div>
          <div className="modal-form__actions">
            <button type="button" className="button button--ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      ) : (
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-grid__full">
            Request title
            <input
              value={formState.title}
              onChange={(event) => setFormState({ ...formState, title: event.target.value })}
              required
            />
          </label>
          <label className="form-grid__full">
            Description
            <textarea
              rows={4}
              value={formState.description}
              onChange={(event) => setFormState({ ...formState, description: event.target.value })}
              required
            />
          </label>
          <label>
            Category
            <select
              value={formState.category}
              onChange={(event) =>
                setFormState({ ...formState, category: event.target.value as MaintenanceRequest['category'] })
              }
            >
              <option value="General">General</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Appliance">Appliance</option>
              <option value="Safety">Safety</option>
            </select>
          </label>
          <label>
            Priority
            <select
              value={formState.priority}
              onChange={(event) =>
                setFormState({ ...formState, priority: event.target.value as MaintenanceRequest['priority'] })
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={formState.status}
              onChange={(event) => setFormState({ ...formState, status: event.target.value as MaintenanceStatus })}
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Urgent">Urgent</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label>
            Tenant
            <select
              value={formState.tenantId}
              onChange={(event) => setFormState({ ...formState, tenantId: event.target.value })}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.fullName} • {tenant.unitNumber}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal-form__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button">
            <PlusIcon width={16} height={16} />
            Log request
          </button>
        </div>
      </form>
      )}
    </ModalShell>
  );
}
