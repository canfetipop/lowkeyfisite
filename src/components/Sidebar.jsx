import { assetUrl, navigation } from "../lib/content";

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar__navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-item${isActive ? " sidebar-item--active" : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="sidebar-item__icon" aria-hidden="true">
                <img className="pixel-icon" src={assetUrl(item.icon)} alt="" draggable="false" />
              </span>
              <span className="sidebar-item__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
