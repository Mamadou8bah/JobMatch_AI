export default function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase().replace(/ /g, "_");
  return <span className={`dash-badge ${normalized}`}>{status}</span>;
}
