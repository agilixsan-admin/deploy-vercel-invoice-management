import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { getStatusBadgeClass } from '../../lib/formatters';
import SuccessModal from '../../components/Modal/SuccessModal';
import '../style.css';

// Add User Modal
function AddUserModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    status: 'Active',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add New User</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ahmad Fauzi"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="user@example.com"
              autoComplete="new-password"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={8}
            />
          </div>
          <div className="select-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control form-select"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Tenant Admin">Tenant Admin</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control form-select"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                disabled
                style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal
function EditUserModal({ user, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: user.fullName || user.name || '',
    email: user.email || '',
    role: user.role === 'SUPER_ADMIN' ? 'Super Admin' : 
          user.role === 'TENANT_ADMIN' ? 'Tenant Admin' : 
          user.role === 'CASHIER' ? 'Cashier' : user.role || '',
    status: user.isActive ? 'Active' : 'Inactive',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(user.id, form);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit User</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address (Read Only)</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              disabled
              title="Email address cannot be changed"
            />
          </div>
          <div className="select-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control form-select"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Tenant Admin">Tenant Admin</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status (Read Only)</label>
              <select
                className="form-control form-select"
                value={form.status}
                disabled
                title="Status must be changed via Lock/Unlock actions"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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

function UserManagement() {
  const {
    users,
    totalCount,
    loading,
    searchTerm,
    filterRole,
    filterStatus,
    currentPage,
    totalPages,
    itemsPerPage,
    showAddModal,
    successModalData,
    setSuccessModalData,
    editingUser,
    deletingUserId,
    setSearchTerm,
    setFilterRole,
    setFilterStatus,
    setCurrentPage,
    setShowAddModal,
    setEditingUser,
    setDeletingUserId,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
  } = useUsers();

  const [isDeleting, setIsDeleting] = useState(false);

  const onDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteUser(deletingUserId);
    } catch (err) {
      // error handled
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage accounts, system roles, and access rights.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} />
            Add User
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>FULL NAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LAST LOGIN</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="user-name">{user.fullName}</span>
                    </td>
                    <td>
                      <span className="user-email">{user.email}</span>
                    </td>
                    <td>
                      <span className="role-badge">{user.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(user.isActive ? 'Active' : 'Inactive')}`}>
                        <span className="badge-dot" />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className="last-login-text">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span>
                    </td>
                    <td>
                      <div className="action-buttons text-right">
                        <button
                          className="action-btn"
                          title="Edit User"
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="action-btn action-btn-danger"
                          title="Delete User"
                          onClick={() => setDeletingUserId(user.id)}
                        >
                          <Trash2 size={14} />
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
            Showing {users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} users
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

      {/* Add Modal */}
      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="modal-overlay" onClick={() => setDeletingUserId(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeletingUserId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px 0', textAlign: 'center' }}>
              <p>Are you sure you want to delete this user?</p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setDeletingUserId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successModalData}
        onClose={() => setSuccessModalData(null)}
        title="User Created Successfully"
        message={
          <>
            User <strong>{successModalData?.fullName || successModalData?.name}</strong> has been created and added to the system.
          </>
        }
        primaryButtonText="Close"
        onPrimaryClick={() => setSuccessModalData(null)}
      />
    </div>
  );
}

export default UserManagement;
