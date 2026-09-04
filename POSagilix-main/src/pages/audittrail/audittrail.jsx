import {
  Download,
  ChevronLeft,
  ChevronRight,
  Lock,
  FileText,
  KeyRound,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { getAuditActionBadgeClass } from '../../lib/formatters';
import '../style.css';

const actionIconMap = {
  locked: Lock,
  posted: FileText,
  password: KeyRound,
  plan: CheckCircle,
  created: RefreshCw,
};

function AuditTrail() {
  const {
    logs,
    totalCount,
    loading,
    searchTerm,
    selectedCategory,
    selectedDate,
    currentPage,
    totalPages,
    itemsPerPage,
    setSearchTerm,
    setSelectedCategory,
    setSelectedDate,
    setCurrentPage,
    handleExportCSV,
  } = useAuditLogs();

  return (
    <div className="audit-trail">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Trail</h1>
          <p className="page-subtitle">Track all administrative actions, system events, and security logs.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={14} />
            Export Log (CSV)
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
                <th>TIMESTAMP</th>
                <th>ADMIN USER</th>
                <th>ACTION PERFORMED</th>
                <th>TARGET</th>
                <th>IP ADDRESS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td colSpan={5} style={{ padding: '8px 16px' }}>
                      <div className="skeleton skeleton-table-row"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    No log entries found matching your search or filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const IconComp = actionIconMap[log.actionType] || RefreshCw;
                  return (
                    <tr key={log.id}>
                      <td>
                        <span className="timestamp-text">{log.timestamp}</span>
                      </td>
                      <td>
                        <span className="admin-user-text">{log.adminUser}</span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <span
                            className={`action-icon-wrapper ${getAuditActionBadgeClass(
                              log.actionType
                            )}`}
                          >
                            <IconComp size={13} />
                          </span>
                          <span className="action-text">{log.actionText}</span>
                        </div>
                      </td>
                      <td>
                        <span className="target-text">{log.target}</span>
                      </td>
                      <td>
                        <span className="ip-address-text">{log.ipAddress}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="table-footer">
          <div className="pagination-info">
            Showing {logs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} log entries
          </div>
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditTrail;
