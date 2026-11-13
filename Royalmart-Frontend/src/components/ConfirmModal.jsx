export default function ConfirmModal({ orderId, onConfirm, onClose }) {
  return (
    <div
      id="cancel-modal"
      className="modal-overlay show"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-icon">
          <span className="material-symbols-outlined">warning</span>
        </div>
        <h3 className="modal-title">Cancel Order</h3>
        <p className="modal-message">
          Are you sure you want to cancel order <strong>#{orderId}</strong>? This action cannot
          be undone.
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-danger" id="modal-confirm-btn" onClick={onConfirm}>
            <span className="material-symbols-outlined">cancel</span>
            Yes, Cancel Order
          </button>
          <button className="modal-btn modal-btn-secondary" id="modal-keep-btn" onClick={onClose}>
            <span className="material-symbols-outlined">shopping_bag</span>
            Keep Order
          </button>
        </div>
      </div>
    </div>
  );
}
