import { useEffect } from 'react';

export default function SuccessPopup({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="popup" role="status" aria-live="polite">
      <span className="popup__icon">✓</span>
      <span>{message}</span>
      <button onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}
