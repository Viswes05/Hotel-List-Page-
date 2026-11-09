export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn--danger-solid" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
