import { MaintenanceRequest, MonthlyPerformance, PageId, Payment, Tenant } from '../types';
import { daysUntil, formatCurrency, formatDate } from '../utils/formatters';
import { CollectionTrendChart, MaintenanceDonutChart } from '../components/charts';
import { EmptyState, Panel, StatusBadge, SummaryCard } from '../components/layout';
import { ClockIcon, TrendUpIcon, UsersIcon, WalletIcon, WrenchIcon } from '../components/icons';

type DashboardPageProps = {
  tenants: Tenant[];
  payments: Payment[];
  requests: MaintenanceRequest[];
  monthlyPerformance: MonthlyPerformance[];
  onSelectTenant: (tenant: Tenant) => void;
  onSelectRequest: (request: MaintenanceRequest) => void;
  onNavigate: (page: PageId) => void;
};

export function DashboardPage({
  tenants,
  payments,
  requests,
  monthlyPerformance,
  onSelectTenant,
  onSelectRequest,
  onNavigate,
}: DashboardPageProps) {
  const hasData = tenants.length > 0 || payments.length > 0 || requests.length > 0;
  const currentMonthPayments = payments.filter((payment) => payment.month === '2026-03');
  const totalCollected = currentMonthPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const outstandingBalances = tenants.reduce((sum, tenant) => sum + tenant.balance, 0);
  const occupiedUnits = new Set(tenants.map((tenant) => tenant.unitNumber)).size;
  const openMaintenance = requests.filter((request) => request.status !== 'Completed').length;
  const latestPayments = [...currentMonthPayments]
    .filter((payment) => payment.paymentDate)
    .sort((left, right) => new Date(right.paymentDate ?? '').getTime() - new Date(left.paymentDate ?? '').getTime())
    .slice(0, 5);
  const recentRequests = [...requests]
    .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())
    .slice(0, 5);
  const leaseTimeline = [...tenants]
    .filter((tenant) => daysUntil(tenant.leaseEnd) <= 60)
    .sort((left, right) => new Date(left.leaseEnd).getTime() - new Date(right.leaseEnd).getTime())
    .slice(0, 5);

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">{hasData ? 'March portfolio snapshot' : 'Workspace ready'}</p>
          <h3>
            {hasData
              ? 'Revenue, residents, and maintenance in one operating view.'
              : 'Your property operations workspace is clear and ready for new records.'}
          </h3>
          <p>
            {hasData
              ? 'Collections remain healthy, but a few late accounts and urgent work orders need attention before the owner update.'
              : 'Add tenants, payments, and maintenance requests to start building a live picture of the portfolio.'}
          </p>
        </div>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => onNavigate(hasData ? 'payments' : 'tenants')}
        >
          {hasData ? 'Review collections' : 'Add your first tenant'}
        </button>
      </section>

      <div className="summary-grid">
        <SummaryCard
          title="Total tenants"
          value={String(tenants.length)}
          subtitle={hasData ? 'Active leases across the portfolio' : 'No residents onboarded yet'}
          trend={hasData ? '+2 this quarter' : 'Ready for setup'}
          tone="teal"
          icon={<UsersIcon width={18} height={18} />}
        />
        <SummaryCard
          title="Occupied units"
          value={hasData ? `${occupiedUnits}/14` : '0/0'}
          subtitle={hasData ? 'Units currently assigned to residents' : 'No units currently assigned'}
          trend={hasData ? 'Live occupancy view' : '0% occupied'}
          tone="slate"
          icon={<TrendUpIcon width={18} height={18} />}
        />
        <SummaryCard
          title="Monthly rent collected"
          value={formatCurrency(totalCollected)}
          subtitle={hasData ? 'Current-month rent posted so far' : 'No rent activity yet'}
          trend={hasData ? 'Live collections' : 'Awaiting first payment'}
          tone="gold"
          icon={<WalletIcon width={18} height={18} />}
        />
        <SummaryCard
          title="Outstanding balances"
          value={formatCurrency(outstandingBalances)}
          subtitle={hasData ? 'Outstanding resident balances' : 'No balances due'}
          trend={hasData ? 'Needs action' : 'All clear'}
          tone="coral"
          icon={<ClockIcon width={18} height={18} />}
        />
        <SummaryCard
          title="Open maintenance"
          value={String(openMaintenance)}
          subtitle={hasData ? 'Urgent and in-progress work orders' : 'No active requests'}
          trend={hasData ? 'Live service queue' : 'Queue is empty'}
          tone="teal"
          icon={<WrenchIcon width={18} height={18} />}
        />
      </div>

      <div className="two-column-grid">
        <Panel title="Rent collection trend" subtitle="Collected versus outstanding over the last six months.">
          <CollectionTrendChart data={monthlyPerformance} />
        </Panel>

        <Panel
          title="Maintenance workload"
          subtitle="Status distribution for active and recently completed requests."
          action={
            <button type="button" className="button button--ghost" onClick={() => onNavigate('maintenance')}>
              Open board
            </button>
          }
        >
          <MaintenanceDonutChart requests={requests} />
        </Panel>
      </div>

      <div className="three-column-grid">
        <Panel
          title="Latest payments"
          subtitle="Most recent resident payment activity."
          action={
            <button type="button" className="button button--ghost" onClick={() => onNavigate('payments')}>
              View all
            </button>
          }
        >
          {latestPayments.length ? (
            <div className="activity-list">
              {latestPayments.map((payment) => {
                const tenant = tenants.find((entry) => entry.id === payment.tenantId);
                return (
                  <button
                    key={payment.id}
                    type="button"
                    className="activity-row"
                    onClick={() => tenant && onSelectTenant(tenant)}
                  >
                    <div>
                      <strong>{payment.tenantName}</strong>
                      <p>
                        {payment.unitNumber} • Paid{' '}
                        {formatDate(payment.paymentDate ?? payment.dueDate, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="activity-row__meta">
                      <strong>{formatCurrency(payment.amountPaid)}</strong>
                      <StatusBadge label={payment.status} variant="payment" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No payments yet"
              description="Rent activity will start showing here once payment records are added."
            />
          )}
        </Panel>

        <Panel title="Recent maintenance requests" subtitle="Newest resident issues in the queue.">
          {recentRequests.length ? (
            <div className="activity-list">
              {recentRequests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  className="activity-row"
                  onClick={() => onSelectRequest(request)}
                >
                  <div>
                    <strong>{request.title}</strong>
                    <p>
                      {request.tenantName} • {request.unitNumber}
                    </p>
                  </div>
                  <div className="activity-row__meta">
                    <StatusBadge label={request.status} variant="maintenance" />
                    <span>{formatDate(request.submittedAt, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No maintenance activity"
              description="New work orders will appear here after residents begin submitting requests."
            />
          )}
        </Panel>

        <Panel title="Lease renewals and move-outs" subtitle="Upcoming deadlines over the next 60 days.">
          {leaseTimeline.length ? (
            <div className="activity-list">
              {leaseTimeline.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  className="activity-row"
                  onClick={() => onSelectTenant(tenant)}
                >
                  <div>
                    <strong>{tenant.fullName}</strong>
                    <p>
                      {tenant.unitNumber} • {daysUntil(tenant.leaseEnd)} days remaining
                    </p>
                  </div>
                  <div className="activity-row__meta">
                    <StatusBadge label={daysUntil(tenant.leaseEnd) <= 21 ? 'Move-Out' : 'Renewal'} variant="event" />
                    <span>{formatDate(tenant.leaseEnd, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No lease deadlines yet"
              description="Upcoming renewals and move-outs will populate here once resident leases are added."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
