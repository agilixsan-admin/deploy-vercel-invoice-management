import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Send, ArrowLeft, ChevronRight } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { getStatusBadgeClass } from '../../lib/formatters';
import '../style.css';

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentInvoice, loading, handleSendReminder } = useInvoices(id);

  if (loading || !currentInvoice) {
    return <div className="invoice-detail-loading">Loading invoice details...</div>;
  }

  const invoice = currentInvoice;

  return (
    <div className="invoice-detail">
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
        <span className="breadcrumb-current">{invoice.id}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Invoice Details</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Download size={14} />
            Download PDF
          </button>
          <button className="btn btn-primary" onClick={() => handleSendReminder(invoice.id)}>
            <Send size={14} />
            Send to Client
          </button>
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
            <h2 className="invoice-number">{invoice.id}</h2>
          </div>
          <div className="invoice-amount-section">
            <p className="invoice-amount-label">AMOUNT DUE</p>
            <p className="invoice-amount-value">{invoice.amountDue}</p>
            <p className="invoice-due-date">Due Date: {invoice.dueDate}</p>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* Bill From / Bill To */}
        <div className="invoice-parties">
          <div className="invoice-party">
            <p className="invoice-party-label">BILL FROM</p>
            <p className="invoice-party-company">{invoice.billFrom?.company}</p>
            <p className="invoice-party-info">{invoice.billFrom?.title}</p>
            <p className="invoice-party-info">{invoice.billFrom?.email}</p>
            <p className="invoice-party-info">{invoice.billFrom?.address}</p>
          </div>
          <div className="invoice-party">
            <p className="invoice-party-label">BILL TO</p>
            <p className="invoice-party-company">{invoice.billTo?.company}</p>
            <p className="invoice-party-info">{invoice.billTo?.email}</p>
            <p className="invoice-party-info">{invoice.billTo?.address}</p>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* Line Items Table */}
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th className="text-center">QTY</th>
              <th className="text-right">UNIT PRICE</th>
              <th className="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{item.unitPrice}</td>
                <td className="text-right">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="invoice-totals-rows">
            <div className="invoice-total-row">
              <span className="invoice-total-label">Subtotal</span>
              <span className="invoice-total-value">{invoice.subtotal}</span>
            </div>
            <div className="invoice-total-row">
              <span className="invoice-total-label">Tax ({invoice.taxRate}%)</span>
              <span className="invoice-total-value">{invoice.tax}</span>
            </div>
            <div className="invoice-total-row invoice-grand-total">
              <span className="invoice-total-label">Total</span>
              <span className="invoice-grand-value">{invoice.total}</span>
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
