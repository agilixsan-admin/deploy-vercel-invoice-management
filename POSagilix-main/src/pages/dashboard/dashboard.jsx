import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Download, Plus, TrendingUp, Users, CheckCircle, AlertTriangle,
  MoreHorizontal, Send
} from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { invoiceService } from '../../services/invoiceService';
import '../style.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">{payload[0].value} tenants</p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const {
    totalTenants,
    activeSubscriptions,
    pastDueCount,
    growthData,
    pastDueClients,
    loading,
  } = useDashboard();
  
  const [remindingId, setRemindingId] = useState(null);

  const handleSendReminder = async (id) => {
    setRemindingId(id);
    try {
      await invoiceService.sendReminder(id);
      alert('Reminder sent successfully!');
    } catch (err) {
      alert('Failed to send reminder.');
    } finally {
      setRemindingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text" style={{ width: '100px' }}></div>
          </div>
          <div className="page-actions">
            <div className="skeleton skeleton-button"></div>
            <div className="skeleton skeleton-button"></div>
          </div>
        </div>
        <div className="dashboard-stats">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
        <div className="dashboard-charts">
          <div className="skeleton skeleton-chart"></div>
          <div className="skeleton skeleton-chart"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, Admin</h1>
          <p className="page-subtitle dashboard-date">Oct 24, 2024</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Download size={14} />
            Export Report
          </button>
          <button className="btn btn-primary">
            <Plus size={14} />
            New Tenant
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">TOTAL TENANTS</span>
            <Users size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{totalTenants}</div>
          <div className="stat-card-trend trend-up">
            <TrendingUp size={14} />
            <span>+12% vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">ACTIVE SUBSCRIPTIONS</span>
            <CheckCircle size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value-row">
            <span className="stat-card-value">{activeSubscriptions}</span>
            <span className="badge badge-green">ACTIVE</span>
          </div>
          <div className="stat-card-trend trend-up">
            <TrendingUp size={14} />
            <span>+5% vs last month</span>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-card-header">
            <span className="stat-card-label">PAST DUE / UNPAID</span>
            <AlertTriangle size={18} className="stat-card-icon-danger" />
          </div>
          <div className="stat-card-value-row">
            <span className="stat-card-value">{pastDueCount}</span>
            <span className="badge badge-red">
              <span className="badge-dot" />
              ACTION NEEDED
            </span>
          </div>
          <div className="stat-card-trend trend-down">
            <TrendingUp size={14} />
            <span>+2 since last week</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Line Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Tenant Growth (Last 6 Months)</h3>
            <button className="icon-btn">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a0aec0', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a0aec0', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tenants"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clients Needing Attention */}
        <div className="card attention-card">
          <div className="attention-header">
            <h3 className="attention-title">Clients Needing Attention</h3>
            <p className="attention-subtitle">
              <span className="attention-alert">!</span>
              <span>{pastDueClients.length} accounts past due</span>
            </p>
          </div>
          <div className="attention-table-header">
            <span>BUSINESS</span>
            <span>ACTION</span>
          </div>
          <div className="attention-list">
            {pastDueClients.map((client) => (
              <div key={client.id} className="attention-item">
                <div className="attention-item-info">
                  <span className="attention-item-name">{client.name}</span>
                  <div className="attention-item-status">
                    <span className="badge badge-red">PAST DUE</span>
                    <span className="attention-item-date">{client.dueDate}</span>
                  </div>
                </div>
                <button 
                  className="btn btn-danger btn-sm reminder-btn"
                  onClick={() => handleSendReminder(client.id)}
                  disabled={remindingId === client.id}
                >
                  <Send size={11} />
                  {remindingId === client.id ? '...' : 'Reminder'}
                </button>
              </div>
            ))}
          </div>
          <button className="view-all-btn">View All {pastDueClients.length} Accounts</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
