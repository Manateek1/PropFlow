import { useDeferredValue, useState } from 'react';
import { MonthlyPerformance, Payment, Tenant } from '../types';
import { formatCurrency, formatDate, formatMonth } from '../utils/formatters';
import { CollectionTrendChart, PaymentMethodChart } from '../components/charts';
import { EmptyState, Panel, StatusBadge } from '../components/layout';
import { DownloadIcon } from '../components/icons';

type PaymentsPageProps = {
  payments: Payment[];
  tenants: Tenant[];
  monthlyPerformance: MonthlyPerformance[];
  globalQuery: string;
  onExport: (payments: Payment[]) => void;
};

export function PaymentsPage({
  payments,
  tenants,
  monthlyPerformance,
  globalQuery,
  onExport,
}: PaymentsPageProps) {
  const [monthFilter, setMonthFilter] = useState<'All' | string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | Payment['status']>('All');
  const [tenantFilter, setTenantFilter] = useState<'All' | string>('All');
  const deferredQuery = useDeferredValue(globalQuery.trim().toLowerCase());

  const months = Array.from(new Set(payments.map((payment) => payment.month))).sort((left, right) =>
    right.localeCompare(left),
  );

  const filteredPayments = payments.filter((payment) => {
    const matchesMonth = monthFilter === 'All' || payment.month === monthFilter;
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    const matchesTenant = tenantFilter === 'All' || payment.tenantId === tenantFilter;
    const matchesQuery =
      deferredQuery.length === 0 ||
      payment.tenantName.toLowerCase().includes(deferredQuery) ||
      payment.unitNumber.toLowerCase().includes(deferredQuery);

    return matchesMonth && matchesStatus && matchesTenant && matchesQuery;
  });

  const collected = filteredPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const due = filteredPayments.reduce((sum, payment) => sum + payment.amountDue, 0);
  const outstanding = filteredPayments.reduce((sum, payment) => sum + (payment.amountDue - payment.amountPaid), 0);
  const collectionRate = due === 0 ? 0 : Math.round((collected / due) * 100);
  const averageDaysLate = (() => {
    const datedPayments = filteredPayments.filter((payment) => payment.paymentDate);

    if (!datedPayments.length) {
      return 0;
    }

    const totalDays = datedPayments.reduce((sum, payment) => {
      const diff =
        (new Date(payment.paymentDate ?? payment.dueDate).getTime() - new Date(payment.dueDate).getTime()) /
        (1000 * 60 * 60 * 24);
      return sum + Math.max(0, Math.round(diff));
    }, 0);

    return Math.round(totalDays / datedPayments.length);
  })();

  const overdueResidents = tenants
    .filter((tenant) => tenant.balance > 0)
    .sort((left, right) => right.balance - left.balance)
    .slice(0, 5);

  return (
    <div className="page-stack">
      <div className="inline-stats">
        <div>
          <span>Collected</span>
          <strong>{formatCurrency(collected)}</strong>
        </div>
        <div>
          <span>Outstanding</span>
          <strong>{formatCurrency(outstanding)}</strong>
        </div>
        <div>
          <span>Collection rate</span>
          <strong>{collectionRate}%</strong>
        </div>
        <div>
          <span>Average days late</span>
          <strong>{averageDaysLate}</strong>
        </div>
      </div>

      <Panel
        title="Rent payments"
        subtitle="Monitor billing performance, filter by resident or month, and export the current dataset."
        action={
          <button
            type="button"
            className="button"
            onClick={() => onExport(filteredPayments)}
            disabled={!filteredPayments.length}
          >
            <DownloadIcon width={16} height={16} />
            Export CSV
          </button>
        }
      >
        <div className="filter-bar">
          <label>
            Month
            <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
              <option value="All">All</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Late">Late</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
          </label>
          <label>
            Tenant
            <select value={tenantFilter} onChange={(event) => setTenantFilter(event.target.value)}>
              <option value="All">All tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.fullName}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredPayments.length ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Month</th>
                  <th>Status</th>
                  <th>Payment date</th>
                  <th>Amount due</th>
                  <th>Amount paid</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{payment.tenantName}</strong>
                        <span>{payment.unitNumber}</span>
                      </div>
                    </td>
                    <td>{formatMonth(payment.month)}</td>
                    <td>
                      <StatusBadge label={payment.status} variant="payment" />
                    </td>
                    <td>{payment.paymentDate ? formatDate(payment.paymentDate) : 'Not received'}</td>
                    <td>{formatCurrency(payment.amountDue)}</td>
                    <td>{formatCurrency(payment.amountPaid)}</td>
                    <td>{payment.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No payment records"
            description="Rent transactions will appear here after billing or payment activity is entered."
          />
        )}
      </Panel>

      <div className="two-column-grid">
        <Panel title="Monthly collection trend" subtitle="Performance trend across the last six months.">
          <CollectionTrendChart data={monthlyPerformance} />
        </Panel>

        <Panel title="Payment methods" subtitle="Distribution of collected payments by method.">
          <PaymentMethodChart payments={filteredPayments} />
        </Panel>
      </div>

      <Panel title="Outstanding balances" subtitle="Residents with the highest balances due right now.">
        {overdueResidents.length ? (
          <div className="list-grid">
            {overdueResidents.map((tenant) => (
              <article key={tenant.id} className="list-card">
                <div>
                  <strong>{tenant.fullName}</strong>
                  <p>
                    {tenant.unitNumber} • {tenant.paymentStatus}
                  </p>
                </div>
                <div className="list-card__meta">
                  <strong>{formatCurrency(tenant.balance)}</strong>
                  <StatusBadge label={tenant.paymentStatus} variant="payment" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No outstanding balances"
            description="Balances will populate here when residents have partial, late, or overdue rent."
          />
        )}
      </Panel>
    </div>
  );
}
