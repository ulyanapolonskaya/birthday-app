import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal confirm-dialog">
        <div className="modal-header">
          <div className="flex items-center gap-sm">
            <AlertTriangle 
              size={20} 
              style={{ color: type === 'danger' ? 'var(--error)' : 'var(--warning)' }} 
            />
            <h3 style={{ margin: 0 }}>{title}</h3>
          </div>
        </div>

        <div className="modal-body">
          <p style={{ margin: 0 }}>{message}</p>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-warning'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}; 