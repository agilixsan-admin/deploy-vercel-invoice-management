import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Send, ArrowLeft, ChevronRight, CheckCircle, Printer, AlertTriangle } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { getStatusBadgeClass } from '../../lib/formatters';
import '../style.css';

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentInvoice,
    loading,
    toastMessage,
    handleUpdateStatus,
    handleSendReminder,
  } = useInvoices(id);

  const [isUpdating, setIsUpdating] = useState(false);

  if (loading) {
    return (
      <div className="invoice-detail">
        <div className="page-header">
          <div>
            <h1 className="page-title">Invoice Details</h1>
            <p className="page-subtitle">Loading invoice information...</p>
          </div>
        </div>
        <div className="card invoice-card" style={{ padding: '32px' }}>
          <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '20px', width: '300px', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!currentInvoice) {
    return (
      <div className="invoice-detail">
        <div className="page-header">
          <div>
            <h1 className="page-title">Invoice Not Found</h1>
            <p className="page-subtitle">The requested invoice could not be loaded.</p>
          </div>
        </div>
        <div className="card invoice-card" style={{ padding: '48px', textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Invoice Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Invoice ID: <code>{id}</code> does not exist or has been removed.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/invoice-billing')}>
            <ArrowLeft size={14} /> Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const invoice = currentInvoice;
  const isPendingOrOverdue = ['PENDING', 'OVERDUE', 'UNPAID'].includes(
    String(invoice.status || '').toUpperCase()
  );

  const tenantName =
    invoice.tenant?.businessName ||
    invoice.tenant?.name ||
    (typeof invoice.tenant === 'string' ? invoice.tenant : 'Tenant Client');

  const tenantEmail = invoice.tenant?.ownerEmail || '-';
  const tenantPhone = invoice.tenant?.ownerPhone || '-';
  const tenantAddress =
    [invoice.tenant?.address, invoice.tenant?.city].filter(Boolean).join(', ') ||
    '-';

  const amountNumber = Number(invoice.amount || 0);
  const formattedAmount = `Rp ${amountNumber.toLocaleString('id-ID')}`;

  const formattedDueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  const formattedPaidDate = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleMarkPaid = async () => {
    if (window.confirm(`Mark invoice ${invoice.invoiceNumber || invoice.id} as PAID?`)) {
      setIsUpdating(true);
      try {
        await handleUpdateStatus(invoice.id, 'Paid');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-detail">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} />
          Back
        </button>
        <span className="breadcrumb-sep">
          <Link to="/invoice-billing" className="breadcrumb-link">
            Invoice &amp; Billing
          </Link>
        </span>
        <ChevronRight size={12} className="breadcrumb-arrow" />
        <span className="breadcrumb-current">{invoice.invoiceNumber || invoice.id}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice Details</h1>
          <p className="page-subtitle">Billing statement &amp; payment summary.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={14} />
            Print / PDF
          </button>
          {isPendingOrOverdue && (
            <button
              className="btn btn-primary"
              onClick={() => handleSendReminder(invoice.id)}
            >
              <Send size={14} />
              Send Reminder
            </button>
          )}
          {isPendingOrOverdue && (
            <button
              className="btn btn-secondary"
              style={{ backgroundColor: 'var(--green-light, #dcfce7)', color: 'var(--green-primary, #16a34a)', borderColor: '#86efac' }}
              onClick={handleMarkPaid}
              disabled={isUpdating}
            >
              <CheckCircle size={14} />
              {isUpdating ? 'Updating...' : 'Mark as Paid'}
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <div className="card invoice-card">
        {/* Invoice Header */}
        <div className="invoice-card-header">
          <div className="invoice-status-section">
            <span className={`badge ${getStatusBadgeClass(invoice.status)} invoice-status-badge`}>
              <span className="badge-dot" />
              {invoice.status}
            </span>
            <h2 className="invoice-number">{invoice.invoiceNumber || invoice.id}</h2>
            {formattedPaidDate && (
              <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: 500 }}>
                ✓ Paid on {formattedPaidDate}
              </p>
            )}
          </div>
          <div className="invoice-amount-section">
            <p className="invoice-amount-label">AMOUNT {invoice.status === 'PAID' ? 'PAID' : 'DUE'}</p>
            <p className="invoice-amount-value">{formattedAmount}</p>
            <p className="invoice-due-date">Due Date: {formattedDueDate}</p>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* Bill From / Bill To */}
        <div className="invoice-parties">
          <div className="invoice-party">
            <p className="invoice-party-label">BILL FROM</p>
            <p className="invoice-party-company">Agilix Console Platform</p>
            <p className="invoice-party-info">PT Agilix Teknologi Indonesia</p>
            <p className="invoice-party-info">billing@agilix.id</p>
            <p className="invoice-party-info">Cyber 2 Tower, Jakarta Selatan, Indonesia</p>
          </div>
          <div className="invoice-party">
            <p className="invoice-party-label">BILL TO</p>
            <p className="invoice-party-company">{tenantName}</p>
            <p className="invoice-party-info">Email: {tenantEmail}</p>
            <p className="invoice-party-info">Phone: {tenantPhone}</p>
            <p className="invoice-party-info">Address: {tenantAddress}</p>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* Line Items Table */}
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th className="text-center">PERIOD</th>
              <th className="text-right">UNIT PRICE</th>
              <th className="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ fontWeight: 500 }}>
                  Agilix POS Monitoring Subscription ({invoice.tenant?.planType || 'STANDARD'})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Tenant ID: {invoice.tenantId}
                </div>
              </td>
              <td className="text-center">{invoice.billingPeriod || '-'}</td>
              <td className="text-right">{formattedAmount}</td>
              <td className="text-right">{formattedAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="invoice-totals-rows">
            <div className="invoice-total-row">
              <span className="invoice-total-label">Subtotal</span>
              <span className="invoice-total-value">{formattedAmount}</span>
            </div>
            <div className="invoice-total-row">
              <span className="invoice-total-label">Tax (PPN 0% / Included)</span>
              <span className="invoice-total-value">Rp 0</span>
            </div>
            <div className="invoice-total-row invoice-grand-total">
              <span className="invoice-total-label">Total</span>
              <span className="invoice-grand-value">{formattedAmount}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="invoice-notes">
            <p className="invoice-notes-label">NOTES</p>
            <p className="invoice-notes-text">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceDetail;
