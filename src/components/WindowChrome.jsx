export default function WindowChrome({
  title = "eliz.exe",
  isMinimized,
  isFullscreen,
  onMinimize,
  onMaximize,
  onClose,
}) {
  return (
    <header className="window-chrome">
      <button
        type="button"
        className="window-chrome__title"
        onDoubleClick={onMaximize}
        onClick={isMinimized ? onMinimize : undefined}
        aria-label={isMinimized ? "Restore window" : title}
      >
        {title}
      </button>

      <div className="window-chrome__controls" aria-label="Window controls">
        <button
          type="button"
          className="window-control-button"
          aria-label={isMinimized ? "Restore window" : "Minimize window"}
          onClick={onMinimize}
        >
          <span className="window-control-glyph window-control-glyph--minimize" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="window-control-button"
          aria-label={isFullscreen ? "Restore window" : "Maximize window"}
          onClick={onMaximize}
        >
          <span
            className={`window-control-glyph ${isFullscreen ? "window-control-glyph--restore" : "window-control-glyph--maximize"}`}
            aria-hidden="true"
          />
        </button>

        <button type="button" className="window-control-button" aria-label="Close window" onClick={onClose}>
          <span className="window-control-glyph window-control-glyph--close" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
