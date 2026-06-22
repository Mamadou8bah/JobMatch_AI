import StatusBadge from "../dashboard/StatusBadge.jsx";
import { companyInitials, formatDate } from "../dashboard/icons.jsx";

function DetailRow({ label, value }) {
  return (
    <div className="dash-detail-row">
      <span className="dash-detail-label">{label}</span>
      <span className="dash-detail-value">{value || "—"}</span>
    </div>
  );
}

export default function EmployerReviewModal({
  employer,
  onClose,
  onApprove,
  onUnapprove,
  actionLoading = false,
}) {
  if (!employer) return null;

  const isPending = !employer.approved && !employer.blocked;
  const companyName = employer.companyName || employer.fullName;

  return (
    <div className="dash-modal-backdrop" onClick={onClose}>
      <div className="dash-modal dash-modal-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal-header">
          <div className="dash-employer-review-head">
            <div className="dash-company-logo lg">
              {companyInitials(companyName)}
            </div>
            <div>
              <h3>{companyName}</h3>
              <p className="dash-modal-subtitle">Employer registration review</p>
            </div>
          </div>
        </div>

        <div className="dash-modal-body">
          <div className="dash-detail-grid">
            <DetailRow label="Contact person" value={employer.fullName} />
            <DetailRow label="Email" value={employer.email} />
            <DetailRow label="Phone" value={employer.phone} />
            <DetailRow label="Location" value={employer.location} />
            <DetailRow label="Registered" value={formatDate(employer.createdAt)} />
            <DetailRow
              label="Status"
              value={
                employer.blocked ? (
                  <StatusBadge status="blocked" />
                ) : employer.approved ? (
                  <StatusBadge status="approved" />
                ) : (
                  <StatusBadge status="pending" />
                )
              }
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="dash-form-label">Company description</div>
            <p className="dash-modal-description">
              {employer.companyDescription?.trim() || "No company description provided."}
            </p>
          </div>
        </div>

        <div className="dash-modal-footer">
          <button type="button" className="dash-btn" onClick={onClose} disabled={actionLoading}>
            Close
          </button>
          {isPending && onApprove && (
            <button
              type="button"
              className="dash-btn primary"
              onClick={() => onApprove(employer.id)}
              disabled={actionLoading}
            >
              {actionLoading ? "Approving…" : "Approve employer"}
            </button>
          )}
          {!isPending && !employer.blocked && employer.approved && onUnapprove && (
            <button
              type="button"
              className="dash-btn"
              onClick={() => onUnapprove(employer.id)}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating…" : "Revoke approval"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
