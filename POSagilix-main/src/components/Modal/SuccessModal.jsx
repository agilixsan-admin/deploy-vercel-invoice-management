import { Check } from 'lucide-react';
import './SuccessModal.css';

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  primaryButtonText = 'View Detail',
  onPrimaryClick,
  secondaryButtonText = 'Close',
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="success-modal">
        <div className="success-icon-wrapper">
          <div className="success-icon-bg">
            <Check size={28} className="success-icon" strokeWidth={3} />
          </div>
        </div>
        
        <h2 className="success-title">{title}</h2>
        <p className="success-message">{message}</p>
        
        <div className="success-actions">
          {onPrimaryClick && (
            <button className="btn btn-primary success-btn-primary" onClick={onPrimaryClick}>
              {primaryButtonText}
            </button>
          )}
          <button className="btn btn-secondary success-btn-secondary" onClick={onClose}>
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
