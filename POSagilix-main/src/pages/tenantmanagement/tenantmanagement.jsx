import { useState } from 'react';
import { Plus, Pencil, Lock, ChevronLeft, ChevronRight, X, Unlock } from 'lucide-react';
import { useTenants } from '../../hooks/useTenants';
import { getStatusBadgeClass } from '../../lib/formatters';
import SuccessModal from '../../components/Modal/SuccessModal';
import '../style.css';

// Add Tenant Modal Component
function AddTenantModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    ownerEmail: '',
    planType: '',
    outlets: '',
    expiryDate: '',
    webhookUrl: '',
    apiKey: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.ownerEmail) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      let errorMsg = err.response?.data?.message || err.message || 'An error occurred while creating the tenant.';
      if (errorMsg.toLowerCase().includes('expirydate must be a future date')) {
        errorMsg = 'Expiry Date Must Be a Future Date';
      }
      setError(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add New Tenant</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error-alert">{error}</div>}
          <div className="form-group">
            <label className="form-label">Business Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Warung Kopi Nusantara"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Owner Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Budi Santoso"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Owner Email <span className="required">*</span></label>
            <input
              type="email"
              className="form-control"
              placeholder="owner@example.com"
              value={form.ownerEmail}
              onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
              required
            />
          </div>
          <div className="select-row">
            <div className="form-group">
              <label className="form-label">Plan Type</label>
              <select
                className="form-control form-select"
                value={form.planType}
                onChange={(e) => setForm({ ...form, planType: e.target.value })}
              >
                <option value="" disabled>Select Plan Type</option>
                <option value="yearly">Yearly Plan</option>
                <option value="monthly">Monthly Plan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Outlets</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={form.outlets}
                onChange={(e) => setForm({ ...form, outlets: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split('T')[0]}
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Webhook URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://example.com/webhook"
              value={form.webhookUrl}
              onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your API Key"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Tenant Modal Component
function EditTenantModal({ tenant, onClose, onSubmit }) {
  const [form, setForm] = useState({
    businessName: tenant.businessName,
    ownerName: tenant.ownerName || '',
    ownerEmail: tenant.ownerEmail,
    planType: tenant.planType?.toLowerCase() || 'yearly',
    outlets: tenant.outletCount || tenant.outlets,
    expiryDate: tenant.expiryDate,
    webhookUrl: tenant.webhookUrl || '',
    apiKey: tenant.apiKey || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(tenant.id, form);
    } catch (err) {
      let errorMsg = err.response?.data?.message || err.message || 'An error occurred while updating the tenant.';
      if (errorMsg.toLowerCase().includes('expirydate must be a future date')) {
        errorMsg = 'Expiry Date Must Be a Future Date';
      }
      setError(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Tenant</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error-alert">{error}</div>}
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input
              type="text"
              className="form-control"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Owner Name</label>
            <input
              type="text"
              className="form-control"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Owner Email</label>
            <input
              type="email"
              className="form-control"
              value={form.ownerEmail}
              onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
              required
            />
          </div>
          <div className="select-row">
            <div className="form-group">
              <label className="form-label">Plan Type</label>
              <select
                className="form-control form-select"
                value={form.planType}
                onChange={(e) => setForm({ ...form, planType: e.target.value })}
              >
                <option value="yearly">Yearly Plan</option>
                <option value="monthly">Monthly Plan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Outlets</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={form.outlets}
                onChange={(e) => setForm({ ...form, outlets: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split('T')[0]}
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Webhook URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://example.com/webhook"
              value={form.webhookUrl}
              onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your API Key"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Tenant Management Page Component
function TenantManagement() {
  const {
    tenants,
    totalCount,
    loading,
    searchTerm,
    filterPlan,
    filterStatus,
    currentPage,
    totalPages,
    itemsPerPage,
    showAddModal,
    successModalData,
    setSuccessModalData,
    editingTenant,
    deletingTenantId,
    setSearchTerm,
    setFilterPlan,
    setFilterStatus,
    setCurrentPage,
    setShowAddModal,
    setEditingTenant,
    setDeletingTenantId,
    handleAddTenant,
    handleEditTenant,
    handleToggleLock,
    handleDeleteTenant,
  } = useTenants();

  const [isDeleting, setIsDeleting] = useState(false);
  const [lockingTenant, setLockingTenant] = useState(null);
  const [isLocking, setIsLocking] = useState(false);

  const onDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteTenant(deletingTenantId);
    } catch (err) {
      // error handled
    } finally {
      setIsDeleting(false);
    }
  };

  const onLockConfirm = async () => {
    setIsLocking(true);
    try {
      await handleToggleLock(lockingTenant.id, lockingTenant.status === 'LOCKED');
      setSuccessModalData({
        action: lockingTenant.status === 'LOCKED' ? 'Unlock' : 'Lock',
        businessName: lockingTenant.businessName
      });
      setLockingTenant(null);
    } catch (err) {
      // error handled
    } finally {
      setIsLocking(false);
    }
  };

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  return (
    <div className="tenant-management">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenant Management</h1>
          <p className="page-subtitle">Manage all tenant accounts, subscription plans, and status.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card table-card">

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>BUSINESS NAME</th>
                <th>PLAN</th>
                <th>OUTLETS</th>
                <th>STATUS</th>
                <th>EXPIRY DATE</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td colSpan={6} style={{ padding: '8px 16px' }}>
                      <div className="skeleton skeleton-table-row"></div>
                    </td>
                  </tr>
                ))
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    No tenants found matching your criteria.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                <tr key={tenant.id} className={tenant.status === 'LOCKED' ? 'row-locked' : ''}>
                    <td>
                      <div className="tenant-cell-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="tenant-name">
                          {tenant.businessName}
                          {tenant.status === 'LOCKED' && <Lock size={12} className="inline-lock-icon" style={{ marginLeft: '6px' }} />}
                        </div>
                        <div className="tenant-email">{tenant.ownerEmail}</div>
                      </div>
                    </td>
                    <td>
                      <span className="plan-badge">{tenant.planType}</span>
                    </td>
                    <td>
                      <span className="outlets-count">{tenant.outletCount} Outlets</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(tenant.status || '')}`}>
                        <span className="badge-dot" />
                        {(tenant.status || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="expiry-date">{tenant.expiryDate}</span>
                    </td>
                    <td>
                      <div className="action-buttons text-right">
                        <button
                          className="action-btn"
                          title="Lock / Unlock Account"
                          onClick={() => setLockingTenant(tenant)}
                        >
                          {tenant.status === 'LOCKED' ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                        <button
                          className="action-btn"
                          title="Edit Tenant"
                          onClick={() => setEditingTenant(tenant)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="action-btn action-btn-danger"
                          title="Delete Tenant"
                          onClick={() => setDeletingTenantId(tenant.id)}
                        >
                          <X size={14} />
                        </button>
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
            Showing {tenants.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} tenants
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

      {/* Modals */}
      {showAddModal && (
        <AddTenantModal onClose={() => setShowAddModal(false)} onSubmit={handleAddTenant} />
      )}

      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onSubmit={handleEditTenant}
        />
      )}
      {/* Delete Confirmation Modal */}
      {deletingTenantId && (
        <div className="modal-overlay" onClick={() => setDeletingTenantId(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeletingTenantId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px 0', textAlign: 'center' }}>
              <p>Are you sure you want to delete this tenant?</p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setDeletingTenantId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock/Unlock Confirmation Modal */}
      {lockingTenant && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setLockingTenant(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">
                {lockingTenant.status === 'LOCKED' ? 'Unlock Account' : 'Lock Account'}
              </h2>
              <button className="modal-close" onClick={() => setLockingTenant(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px 0', textAlign: 'center' }}>
              <p>
                {lockingTenant.status === 'LOCKED' 
                  ? `Restore access for ${lockingTenant.businessName}?`
                  : `Revoke access for ${lockingTenant.businessName}?`}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                {lockingTenant.status === 'LOCKED'
                  ? 'They will regain full access to their dashboard and services.'
                  : 'Their access will be immediately blocked and active sessions will be terminated.'}
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setLockingTenant(null)}>
                Cancel
              </button>
              <button 
                className={`btn ${lockingTenant.status === 'LOCKED' ? 'btn-primary' : 'btn-danger'}`} 
                onClick={onLockConfirm} 
                disabled={isLocking}
              >
                {isLocking 
                  ? 'Processing...' 
                  : lockingTenant.status === 'LOCKED' ? 'Unlock Account' : 'Lock Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successModalData}
        onClose={() => setSuccessModalData(null)}
        title={
          successModalData?.action === 'Lock' ? "Tenant Locked Successfully" :
          successModalData?.action === 'Unlock' ? "Tenant Unlocked Successfully" :
          "Tenant Created Successfully"
        }
        message={
          successModalData?.action === 'Lock' ? (
            <>
              Access for <strong>{successModalData?.businessName}</strong> has been successfully revoked.
            </>
          ) : successModalData?.action === 'Unlock' ? (
            <>
              Access for <strong>{successModalData?.businessName}</strong> has been successfully restored.
            </>
          ) : (
            <>
              Tenant <strong>{successModalData?.businessName}</strong> has been created and added to the system.
            </>
          )
        }
        primaryButtonText="Close"
        onPrimaryClick={() => setSuccessModalData(null)}
        secondaryButtonText={null}
      />
    </div>
  );
}

export default TenantManagement;
