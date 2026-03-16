import { useDeferredValue, useState } from 'react';
import { MaintenanceRequest } from '../types';
import { formatDate } from '../utils/formatters';
import { MaintenanceDonutChart, PriorityBars } from '../components/charts';
import { EmptyState, Panel, StatusBadge } from '../components/layout';
import { PlusIcon } from '../components/icons';

type MaintenancePageProps = {
  requests: MaintenanceRequest[];
  globalQuery: string;
  onSelectRequest: (request: MaintenanceRequest) => void;
  onAddRequest: () => void;
};

export function MaintenancePage({
  requests,
  globalQuery,
  onSelectRequest,
  onAddRequest,
}: MaintenancePageProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | MaintenanceRequest['status']>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | MaintenanceRequest['priority']>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | MaintenanceRequest['category']>('All');
  const [layoutMode, setLayoutMode] = useState<'board' | 'table'>('board');
  const deferredQuery = useDeferredValue(globalQuery.trim().toLowerCase());

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || request.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || request.category === categoryFilter;
    const matchesQuery =
      deferredQuery.length === 0 ||
      request.title.toLowerCase().includes(deferredQuery) ||
      request.tenantName.toLowerCase().includes(deferredQuery) ||
      request.unitNumber.toLowerCase().includes(deferredQuery);

    return matchesStatus && matchesPriority && matchesCategory && matchesQuery;
  });

  const statusGroups: MaintenanceRequest['status'][] = ['New', 'Urgent', 'In Progress', 'Completed'];
  const newCount = requests.filter((request) => request.status === 'New').length;
  const urgentCount = requests.filter((request) => request.status === 'Urgent').length;
  const inProgressCount = requests.filter((request) => request.status === 'In Progress').length;
  const completedCount = requests.filter((request) => request.status === 'Completed').length;

  return (
    <div className="page-stack">
      <div className="inline-stats">
        <div>
          <span>New</span>
          <strong>{newCount}</strong>
        </div>
        <div>
          <span>Urgent</span>
          <strong>{urgentCount}</strong>
        </div>
        <div>
          <span>In progress</span>
          <strong>{inProgressCount}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>
      </div>

      <Panel
        title="Maintenance requests"
        subtitle="Track issue flow by status, priority, and category."
        action={
          <div className="panel-actions">
            <div className="segmented-control">
              <button
                type="button"
                className={layoutMode === 'board' ? 'is-active' : ''}
                onClick={() => setLayoutMode('board')}
              >
                Board
              </button>
              <button
                type="button"
                className={layoutMode === 'table' ? 'is-active' : ''}
                onClick={() => setLayoutMode('table')}
              >
                Table
              </button>
            </div>
            <button type="button" className="button" onClick={onAddRequest}>
              <PlusIcon width={16} height={16} />
              Add request
            </button>
          </div>
        }
      >
        <div className="filter-bar">
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="All">All</option>
              <option value="New">New</option>
              <option value="Urgent">Urgent</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label>
            Priority
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)}
            >
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)}
            >
              <option value="All">All</option>
              <option value="General">General</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Appliance">Appliance</option>
              <option value="Safety">Safety</option>
            </select>
          </label>
        </div>

        {filteredRequests.length === 0 ? (
          <EmptyState
            title="No maintenance requests"
            description="Log the first work order to begin tracking request status, priority, and technician load."
          />
        ) : layoutMode === 'board' ? (
          <div className="kanban-grid">
            {statusGroups.map((status) => (
              <div key={status} className="kanban-column">
                <div className="kanban-column__header">
                  <strong>{status}</strong>
                  <span>{filteredRequests.filter((request) => request.status === status).length}</span>
                </div>
                <div className="kanban-column__body">
                  {filteredRequests
                    .filter((request) => request.status === status)
                    .map((request) => (
                      <button
                        key={request.id}
                        type="button"
                        className="kanban-card"
                        onClick={() => onSelectRequest(request)}
                      >
                        <div className="kanban-card__top">
                          <StatusBadge label={request.priority} variant="priority" />
                          <span>{request.unitNumber}</span>
                        </div>
                        <strong>{request.title}</strong>
                        <p>{request.tenantName}</p>
                        <div className="kanban-card__footer">
                          <span>{request.category}</span>
                          <span>{formatDate(request.submittedAt, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Tenant / unit</th>
                  <th>Date submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="data-table__clickable"
                    onClick={() => onSelectRequest(request)}
                  >
                    <td>
                      <div className="cell-stack">
                        <strong>{request.title}</strong>
                        <span>{request.assignee}</span>
                      </div>
                    </td>
                    <td>{request.category}</td>
                    <td>
                      <StatusBadge label={request.priority} variant="priority" />
                    </td>
                    <td>
                      <StatusBadge label={request.status} variant="maintenance" />
                    </td>
                    <td>
                      <div className="cell-stack">
                        <strong>{request.tenantName}</strong>
                        <span>{request.unitNumber}</span>
                      </div>
                    </td>
                    <td>{formatDate(request.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="two-column-grid">
        <Panel title="Status breakdown" subtitle="Current mix of new, urgent, active, and completed work.">
          <MaintenanceDonutChart requests={requests} />
        </Panel>
        <Panel title="Priority load" subtitle="Use this to gauge technician assignment pressure.">
          <PriorityBars requests={requests} />
        </Panel>
      </div>
    </div>
  );
}
