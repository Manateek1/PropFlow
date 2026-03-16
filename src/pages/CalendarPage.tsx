import { CalendarEvent, Tenant } from '../types';
import { daysUntil, formatDate } from '../utils/formatters';
import { EmptyState, Panel, StatusBadge } from '../components/layout';

type CalendarPageProps = {
  events: CalendarEvent[];
  tenants: Tenant[];
  globalQuery: string;
};

function getCalendarDays() {
  const year = 2026;
  const month = 2;
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyCells = firstDay.getDay();
  const cells: Array<{ date?: string; day?: number }> = [];

  for (let index = 0; index < leadingEmptyCells; index += 1) {
    cells.push({});
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day).toISOString().slice(0, 10);
    cells.push({ date, day });
  }

  return cells;
}

export function CalendarPage({ events, tenants, globalQuery }: CalendarPageProps) {
  const query = globalQuery.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    if (!query) {
      return true;
    }

    return (
      event.title.toLowerCase().includes(query) ||
      event.type.toLowerCase().includes(query) ||
      event.tenantName?.toLowerCase().includes(query) ||
      event.unitNumber?.toLowerCase().includes(query)
    );
  });

  const calendarDays = getCalendarDays();
  const upcomingExpirations = [...tenants]
    .filter((tenant) => daysUntil(tenant.leaseEnd) <= 60)
    .sort((left, right) => new Date(left.leaseEnd).getTime() - new Date(right.leaseEnd).getTime());

  return (
    <div className="page-stack">
      <div className="two-column-grid two-column-grid--calendar">
        <Panel title="March 2026 calendar" subtitle="Rent deadlines, inspections, renewals, and move-outs.">
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="calendar-grid__weekday">
                {day}
              </div>
            ))}

            {calendarDays.map((cell, index) => {
              const dayEvents = filteredEvents.filter((event) => event.date === cell.date);

              return (
                <div
                  key={`${cell.date ?? 'empty'}-${index}`}
                  className={`calendar-grid__cell${cell.date ? '' : ' calendar-grid__cell--empty'}`}
                >
                  {cell.day ? <strong>{cell.day}</strong> : null}
                  {dayEvents.map((event) => (
                    <div key={event.id} className="calendar-event-pill">
                      <span>{event.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Upcoming agenda" subtitle="Operational milestones and lease deadlines coming up next.">
          {filteredEvents.length ? (
            <div className="agenda-list">
              {filteredEvents
                .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
                .map((event) => (
                  <article key={event.id} className="agenda-item">
                    <div>
                      <strong>{event.title}</strong>
                      <p>
                        {event.tenantName ? `${event.tenantName} • ` : ''}
                        {event.unitNumber ? `${event.unitNumber} • ` : ''}
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <StatusBadge label={event.type} variant="event" />
                  </article>
                ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming calendar events"
              description="Lease deadlines, inspections, and rent reminders will appear here once they are scheduled."
            />
          )}
        </Panel>
      </div>

      <Panel title="Lease expirations" subtitle="Residents with the nearest renewal or move-out deadlines.">
        {upcomingExpirations.length ? (
          <div className="list-grid">
            {upcomingExpirations.map((tenant) => (
              <article key={tenant.id} className="list-card">
                <div>
                  <strong>{tenant.fullName}</strong>
                  <p>
                    {tenant.unitNumber} • Lease ends {formatDate(tenant.leaseEnd)}
                  </p>
                </div>
                <div className="list-card__meta">
                  <strong>{daysUntil(tenant.leaseEnd)} days</strong>
                  <StatusBadge
                    label={daysUntil(tenant.leaseEnd) <= 21 ? 'Move-Out' : 'Lease Renewal'}
                    variant="event"
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No lease deadlines"
            description="Lease expirations will appear here once tenants and lease dates are entered."
          />
        )}
      </Panel>
    </div>
  );
}
