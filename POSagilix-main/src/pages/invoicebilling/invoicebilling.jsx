import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { useTenants } from '../../hooks/useTenants';
import { getStatusBadgeClass } from '../../lib/formatters';
import '../style.css';

// Create Invoice Modal Component
function CreateInvoiceModal({ onClose, onSubmit }) {
  const { tenants } = useTenants();
  
  const [form, setForm] = useState({
    tenantId: '',
    billingMonth: 'October',
    billingYear: '2024',
    amount: '2.500.000',
    notes: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tenantId) {
      setError('Please select a tenant.');
      return;
    }
    if (!form.amount) {
      setError('Please enter amount.');
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create New Invoice</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">
              Select Tenant <span className="required">*</span>
            </label>
            <select
              className="form-control form-select"
              value={form.tenantId}
              onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
            >
              <option value="">-- Select a Tenant --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.businessName}
                </option>
              ))}
            </select>
          </div>
          <div className="select-row">
            <div className="form-group">
              <label className="form-label">Billing Month</label>
              <select
                className="form-control form-select"
                value={form.billingMonth}
                onChange={(e) => setForm({ ...form, billingMonth: e.target.value })}
              >
                {[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Billing Year</label>
              <select
                className="form-control form-select"
                value={form.billingYear}
                onChange={(e) => setForm({ ...form, billingYear: e.target.value })}
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              Amount (IDR) <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 2.500.000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-control form-textarea"
              rows={3}
              placeholder="Additional notes for this invoice..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InvoiceBilling() {
  const navigate = useNavigate();
  const {
    invoices,
    totalCount,
    loading,
    searchTerm,
    activeTab,
    currentPage,
    totalPages,
    itemsPerPage,
    showCreateModal,
    toastMessage,
    setSearchTerm,
    setActiveTab,
    setCurrentPage,
    setShowCreateModal,
    handleCreateInvoice,
    handleUpdateStatus,
    handleSendReminder,
  } = useInvoices();

  const tabs = ['All Invoices', 'Unpaid', 'Paid', 'Draft'];

  return (
    <div className="invoice-billing">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice &amp; Billing</h1>
          <p className="page-subtitle">Manage billing records, invoices, payment status, and reminders.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">
        {/* Data Table */}

        {/* Data Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE ID</th>
                <th>TENANT NAME</th>
                <th>PERIOD</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>DUE DATE</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td colSpan={7} style={{ padding: '8px 16px' }}>
                      <div className="skeleton skeleton-table-row"></div>
                    </td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">
                    No invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="invoice-id-text">{inv.invoiceNumber || inv.id}</span>
                    </td>
                    <td>
                      <span className="tenant-name-text">{inv.tenant?.businessName || inv.tenant}</span>
                    </td>
                    <td>
                      <span className="period-text">{inv.billingPeriod}</span>
                    </td>
                    <td>
                      <span className="amount-text">Rp {Number(inv.amount).toLocaleString('id-ID')}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(inv.status || '')}`}>
                        <span className="badge-dot" />
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <span className="due-date-text">{new Date(inv.dueDate).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <div className="action-buttons text-right">
                        <button
                          className="action-btn"
                          title="View Invoice Detail"
                          onClick={() => navigate(`/invoice/${inv.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                        {inv.status === 'Unpaid' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Mark as Paid"
                            onClick={() => handleUpdateStatus(inv.id, 'Paid')}
                          >
                            Mark Paid
                          </button>
                        )}
                        {inv.status === 'Unpaid' && (
                          <button
                            className="btn btn-danger btn-sm"
                            title="Send Reminder"
                            onClick={() => handleSendReminder(inv.id)}
                          >
                            Reminder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="table-footer">
          <div className="pagination-info">
            Showing {invoices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} invoices
          </div>
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateInvoice}
        />
      )}
    </div>
  );
}

export default InvoiceBilling;
