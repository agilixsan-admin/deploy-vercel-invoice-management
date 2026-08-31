import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { useTenants } from '../../hooks/useTenants';
import { getStatusBadgeClass } from '../../lib/formatters';
import SuccessModal from '../../components/Modal/SuccessModal';
import DatePicker from '../../components/DatePicker/DatePicker';
import '../style.css';

// Create Invoice Modal Component
function CreateInvoiceModal({ onClose, onSubmit }) {
  const { tenants } = useTenants();
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  
  const [form, setForm] = useState({
    tenantId: '',
    billingPeriod: currentMonthStr, // YYYY-MM
    dueDate: `${currentMonthStr}-15`, // YYYY-MM-DD
    amount: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenantId) {
      setError('Please select a tenant.');
      return;
    }
    if (!form.billingPeriod) {
      setError('Please select a billing period.');
      return;
    }
    if (!form.dueDate) {
      setError('Please select a due date.');
      return;
    }
    if (!form.amount) {
      setError('Please enter amount.');
      return;
    }

    setIsSubmitting(true);
    const selectedTenant = tenants.find((t) => t.id === form.tenantId);
    try {
      await onSubmit(form, selectedTenant?.businessName);
    } catch (err) {
      setError('An error occurred while generating the invoice.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create New Invoice</h2>
          {!isSubmitting && (
            <button className="modal-close" onClick={onClose} type="button">
              <X size={18} />
            </button>
          )}
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
          <div className="form-group">
            <label className="form-label">
              Billing Period <span className="required">*</span>
            </label>
            <DatePicker
              mode="month"
              value={form.billingPeriod}
              onChange={(val) => {
                setForm((prev) => ({
                  ...prev,
                  billingPeriod: val,
                  dueDate: val ? `${val}-15` : prev.dueDate,
                }));
              }}
              placeholder="Select billing period"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Due Date <span className="required">*</span>
            </label>
            <DatePicker
              mode="date"
              value={form.dueDate}
              onChange={(val) => setForm((prev) => ({ ...prev, dueDate: val }))}
              placeholder="Select payment due date"
            />
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
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                const formatted = val ? new Intl.NumberFormat('id-ID').format(val) : '';
                setForm({ ...form, amount: formatted });
              }}
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
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Generate Invoice'}
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
    successModalData,
    setSuccessModalData,
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successModalData}
        onClose={() => setSuccessModalData(null)}
        title="Invoice Created Successfully"
        message={
          <>
            Invoice <span className="highlight">{successModalData?.invoiceNumber}</span> for{' '}
            <strong>{successModalData?.tenantName}</strong> has been generated and added to the list.
          </>
        }
        primaryButtonText="View Detail"
        onPrimaryClick={() => {
          navigate(`/invoice/${successModalData?.id}`);
          setSuccessModalData(null);
        }}
        secondaryButtonText="Close"
      />
    </div>
  );
}

export default InvoiceBilling;
