export default function WindowChrome({
  title = "eliz.exe",
  onMinimize,
  onMaximize,
  onClose,
}) {
  return (
    <header className="window-chrome">
      <div className="window-chrome__title">
        {title}
      </div>

      <div
        className="window-chrome__controls"
        aria-label="Window controls"
      >
        <button
          type="button"
          className="window-control-button"
          aria-label="Minimize window"
          onClick={onMinimize}
        >
          <span
            className="window-control-glyph window-control-glyph--minimize"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          className="window-control-button"
          aria-label="Maximize window"
          onClick={onMaximize}
        >
          <span
            className="window-control-glyph window-control-glyph--maximize"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          className="window-control-button"
          aria-label="Close window"
          onClick={onClose}
        >
          <span
            className="window-control-glyph window-control-glyph--close"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}