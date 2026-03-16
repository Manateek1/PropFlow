import { useDeferredValue, useState } from 'react';
import { MaintenanceRequest, Payment, Tenant } from '../types';
import { daysUntil, formatCurrency, formatDate } from '../utils/formatters';
import { EmptyState, Panel, StatusBadge } from '../components/layout';
import { PlusIcon } from '../components/icons';

type TenantsPageProps = {
  tenants: Tenant[];
  payments: Payment[];
  requests: MaintenanceRequest[];
  globalQuery: string;
  onSelectTenant: (tenant: Tenant) => void;
  onAddTenant: () => void;
};

export function TenantsPage({
  tenants,
  payments,
  requests,
  globalQuery,
  onSelectTenant,
  onAddTenant,
}: TenantsPageProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | Tenant['paymentStatus']>('All');
  const [leaseFilter, setLeaseFilter] = useState<'All' | 'Expiring Soon' | 'Stable'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'unit' | 'rent' | 'lease'>('name');
  const deferredQuery = useDeferredValue(globalQuery.trim().toLowerCase());

  let filteredTenants = tenants.filter((tenant) => {
    const matchesQuery =
      deferredQuery.length === 0 ||
      tenant.fullName.toLowerCase().includes(deferredQuery) ||
      tenant.email.toLowerCase().includes(deferredQuery) ||
      tenant.unitNumber.toLowerCase().includes(deferredQuery);
    const matchesStatus = statusFilter === 'All' || tenant.paymentStatus === statusFilter;
    const daysRemaining = daysUntil(tenant.leaseEnd);
    const matchesLease =
      leaseFilter === 'All' ||
      (leaseFilter === 'Expiring Soon' ? daysRemaining <= 60 : daysRemaining > 60);

    return matchesQuery && matchesStatus && matchesLease;
  });

  filteredTenants = [...filteredTenants].sort((left, right) => {
    if (sortBy === 'unit') {
      return left.unitNumber.localeCompare(right.unitNumber);
    }

    if (sortBy === 'rent') {
      return right.monthlyRent - left.monthlyRent;
    }

    if (sortBy === 'lease') {
      return new Date(left.leaseEnd).getTime() - new Date(right.leaseEnd).getTime();
    }

    return left.fullName.localeCompare(right.fullName);
  });

  const expiringSoonCount = tenants.filter((tenant) => daysUntil(tenant.leaseEnd) <= 60).length;
  const attentionCount = tenants.filter((tenant) => tenant.paymentStatus !== 'Paid').length;
  const averageRent = tenants.length
    ? Math.round(tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0) / tenants.length)
    : 0;

  return (
    <div className="page-stack">
      <div className="inline-stats">
        <div>
          <span>Residents</span>
          <strong>{tenants.length}</strong>
        </div>
        <div>
          <span>Average rent</span>
          <strong>{formatCurrency(averageRent)}</strong>
        </div>
        <div>
          <span>Expiring in 60 days</span>
          <strong>{expiringSoonCount}</strong>
        </div>
        <div>
          <span>Need attention</span>
          <strong>{attentionCount}</strong>
        </div>
      </div>

      <Panel
        title="Tenant directory"
        subtitle="Search the workspace, filter payment health, and open resident profiles."
        action={
          <button type="button" className="button" onClick={onAddTenant}>
            <PlusIcon width={16} height={16} />
            Add tenant
          </button>
        }
      >
        <div className="filter-bar">
          <label>
            Payment status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Late">Late</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
          </label>
          <label>
            Lease timing
            <select value={leaseFilter} onChange={(event) => setLeaseFilter(event.target.value as typeof leaseFilter)}>
              <option value="All">All</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Stable">Stable</option>
            </select>
          </label>
          <label>
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
              <option value="name">Name</option>
              <option value="unit">Unit</option>
              <option value="rent">Monthly rent</option>
              <option value="lease">Lease end</option>
            </select>
          </label>
        </div>

        {filteredTenants.length ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Lease term</th>
                  <th>Monthly rent</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Open items</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => {
                  const tenantPayments = payments.filter((payment) => payment.tenantId === tenant.id);
                  const latestPayment = tenantPayments[0];
                  const openItems = requests.filter(
                    (request) => request.tenantId === tenant.id && request.status !== 'Completed',
                  ).length;

                  return (
                    <tr key={tenant.id} className="data-table__clickable" onClick={() => onSelectTenant(tenant)}>
                      <td>
                        <div className="cell-stack">
                          <strong>{tenant.fullName}</strong>
                          <span>{tenant.occupation}</span>
                        </div>
                      </td>
                      <td>{tenant.unitNumber}</td>
                      <td>
                        <div className="cell-stack">
                          <strong>{formatDate(tenant.leaseStart, { month: 'short', day: 'numeric' })}</strong>
                          <span>to {formatDate(tenant.leaseEnd, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td>{formatCurrency(tenant.monthlyRent)}</td>
                      <td>
                        <div className="cell-stack">
                          <StatusBadge label={tenant.paymentStatus} variant="payment" />
                          {latestPayment ? <span>{latestPayment.method}</span> : null}
                        </div>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <strong>{tenant.phone}</strong>
                          <span>{tenant.email}</span>
                        </div>
                      </td>
                      <td>{openItems ? `${openItems} active request${openItems > 1 ? 's' : ''}` : 'Clear'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No tenants yet"
            description="Add your first tenant to start tracking leases, balances, notes, and maintenance history."
          />
        )}
      </Panel>
    </div>
  );
}
