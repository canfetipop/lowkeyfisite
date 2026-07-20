export default function StatusBar({
  statusText = "Ready",
  lastUpdated = "May 27, 2025",
}) {
  return (
    <footer className="status-bar">
      <div className="status-bar__ready">
        <span
          className="status-bar__light"
          aria-hidden="true"
        />

        <span>{statusText}</span>
      </div>

      <div className="status-bar__updated">
        Last updated: {lastUpdated}
      </div>

      <div
        className="status-bar__resize-grip"
        aria-hidden="true"
      />
    </footer>
  );
}