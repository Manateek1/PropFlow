import { CSSProperties } from 'react';
import { MaintenanceRequest, MonthlyPerformance, Payment } from '../types';
import { clamp, formatCompactCurrency } from '../utils/formatters';
import { StatusBadge } from './layout';

export function CollectionTrendChart({ data }: { data: MonthlyPerformance[] }) {
  const chartHeight = 160;
  const chartWidth = 420;
  const maxValue = Math.max(
    1,
    ...data.map((entry) => entry.collected),
    ...data.map((entry) => entry.outstanding),
  );

  const points = data.map((entry, index) => {
    const x = (index / Math.max(1, data.length - 1)) * chartWidth;
    const y = chartHeight - (entry.outstanding / maxValue) * (chartHeight - 24) - 12;
    return `${x},${y}`;
  });

  return (
    <div className="trend-chart">
      <div className="trend-chart__legend">
        <span>
          <i className="legend legend--bar" />
          Rent collected
        </span>
        <span>
          <i className="legend legend--line" />
          Outstanding
        </span>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 26}`} className="trend-chart__svg" role="img" aria-label="Monthly rent collection trend">
        {[0, 0.33, 0.66, 1].map((tick) => {
          const y = 12 + (chartHeight - 24) * tick;
          return <line key={tick} x1="0" x2={chartWidth} y1={y} y2={y} className="chart-grid" />;
        })}

        {data.map((entry, index) => {
          const barWidth = chartWidth / data.length - 22;
          const x = index * (chartWidth / data.length) + 10;
          const barHeight = (entry.collected / maxValue) * (chartHeight - 24);
          const y = chartHeight - barHeight;

          return (
            <g key={entry.month}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="10" className="chart-bar" />
              <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" className="chart-label">
                {entry.month}
              </text>
            </g>
          );
        })}

        <polyline points={points.join(' ')} className="chart-line" />

        {data.map((entry, index) => {
          const x = (index / Math.max(1, data.length - 1)) * chartWidth;
          const y = chartHeight - (entry.outstanding / maxValue) * (chartHeight - 24) - 12;

          return <circle key={`${entry.month}-dot`} cx={x} cy={y} r="4.5" className="chart-point" />;
        })}
      </svg>

      <div className="trend-chart__footer">
        {data.map((entry) => (
          <div key={entry.month}>
            <span>{entry.month}</span>
            <strong>{formatCompactCurrency(entry.collected)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCircumference(radius: number) {
  return 2 * Math.PI * radius;
}

export function MaintenanceDonutChart({ requests }: { requests: MaintenanceRequest[] }) {
  const statuses = ['New', 'In Progress', 'Urgent', 'Completed'] as const;
  const radius = 48;
  const circumference = getCircumference(radius);
  const total = Math.max(1, requests.length);
  let offset = 0;

  const slices = statuses.map((status) => {
    const value = requests.filter((request) => request.status === status).length;
    const arc = (value / total) * circumference;
    const slice = {
      status,
      value,
      dasharray: `${arc} ${circumference - arc}`,
      dashoffset: -offset,
    };

    offset += arc;
    return slice;
  });

  return (
    <div className="donut-chart">
      <svg viewBox="0 0 140 140" className="donut-chart__svg" role="img" aria-label="Maintenance status breakdown">
        <circle cx="70" cy="70" r={radius} className="donut-chart__track" />
        {slices.map((slice) => (
          <circle
            key={slice.status}
            cx="70"
            cy="70"
            r={radius}
            className="donut-chart__segment"
            data-status={slice.status.toLowerCase().replace(/\s+/g, '-')}
            strokeDasharray={slice.dasharray}
            strokeDashoffset={slice.dashoffset}
          />
        ))}
        <text x="70" y="63" textAnchor="middle" className="donut-chart__center-label">
          {requests.length}
        </text>
        <text x="70" y="82" textAnchor="middle" className="donut-chart__center-subtitle">
          requests
        </text>
      </svg>

      <div className="donut-chart__legend">
        {slices.map((slice) => (
          <div key={slice.status} className="donut-chart__legend-row">
            <div className="donut-chart__legend-title">
              <i data-status={slice.status.toLowerCase().replace(/\s+/g, '-')} />
              <span>{slice.status}</span>
            </div>
            <strong>{slice.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaymentMethodChart({ payments }: { payments: Payment[] }) {
  if (!payments.length) {
    return <div className="empty-inline">No payment methods to compare yet.</div>;
  }

  const methods = ['ACH', 'Card', 'Check', 'Wire'] as const;
  const totalPaid = Math.max(
    1,
    methods.reduce(
      (sum, method) =>
        sum +
        payments.filter((payment) => payment.method === method).reduce((subtotal, payment) => subtotal + payment.amountPaid, 0),
      0,
    ),
  );

  return (
    <div className="method-chart">
      {methods.map((method) => {
        const amount = payments
          .filter((payment) => payment.method === method)
          .reduce((sum, payment) => sum + payment.amountPaid, 0);
        const width = `${clamp((amount / totalPaid) * 100, 6, 100)}%`;

        return (
          <div key={method} className="method-chart__row">
            <div className="method-chart__meta">
              <span>{method}</span>
              <strong>{formatCompactCurrency(amount)}</strong>
            </div>
            <div className="method-chart__track">
              <div className="method-chart__fill" style={{ '--fill-width': width } as CSSProperties} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PriorityBars({ requests }: { requests: MaintenanceRequest[] }) {
  if (!requests.length) {
    return <div className="empty-inline">No maintenance priorities to chart yet.</div>;
  }

  const priorities = ['Critical', 'High', 'Medium', 'Low'] as const;
  const maxCount = Math.max(1, ...priorities.map((priority) => requests.filter((request) => request.priority === priority).length));

  return (
    <div className="priority-bars">
      {priorities.map((priority) => {
        const count = requests.filter((request) => request.priority === priority).length;
        const width = `${(count / maxCount) * 100}%`;
        return (
          <div key={priority} className="priority-bars__row">
            <div className="priority-bars__meta">
              <StatusBadge label={priority} variant="priority" />
              <strong>{count}</strong>
            </div>
            <div className="priority-bars__track">
              <div className="priority-bars__fill" style={{ '--fill-width': width } as CSSProperties} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
