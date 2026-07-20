import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import WindowChrome from "./components/WindowChrome";

import AboutView from "./components/views/AboutView";
import ContactView from "./components/views/ContactView";
import HomeView from "./components/views/HomeView";
import LabView from "./components/views/LabView";
import PostsView from "./components/views/PostsView";
import ResourcesView from "./components/views/ResourcesView";
import { site } from "./lib/content";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const VIEW_COMPONENTS = {
  home: HomeView,
  about: AboutView,
  posts: PostsView,
  lab: LabView,
  resources: ResourcesView,
  contact: ContactView,
};

export default function LowkeyfiPage() {
  const [activeView, setActiveView] = useState("home");
  const [viewContext, setViewContext] = useState({});
  const [windowScale, setWindowScale] = useState(1);
  const [scaleIsReady, setScaleIsReady] = useState(false);

  useEffect(() => {
    function updateWindowScale() {
      const horizontalScale = window.innerWidth / DESIGN_WIDTH;
      const verticalScale = window.innerHeight / DESIGN_HEIGHT;
      const nextScale = Math.min(horizontalScale, verticalScale);

      setWindowScale(Math.max(nextScale, 0.1));
      setScaleIsReady(true);
    }

    updateWindowScale();

    window.addEventListener("resize", updateWindowScale);

    return () => {
      window.removeEventListener("resize", updateWindowScale);
    };
  }, []);

  const ActiveView = VIEW_COMPONENTS[activeView] ?? HomeView;

  function handleViewChange(viewId, nextContext = {}) {
    setActiveView(viewId);
    setViewContext(nextContext);
  }

  function handleMinimize() {
    // Intentionally empty for now.
  }

  function handleMaximize() {
    // Intentionally empty for now.
  }

  function handleClose() {
    // Intentionally empty for now.
  }

  return (
    <main
      className="site-stage"
      style={{
        "--windows-blue": site.theme.accentColor,
        "--windows-blue-light": site.theme.accentColorLight,
        "--windows-gray": site.theme.windowColor,
        "--stage-background": site.theme.pageBackground,
        "--panel-radius":
          site.theme.cornerStyle === "square" ? "2px" : "10px",
      }}
    >
      <div
        className="scaled-window-frame"
        style={{
          width: `${DESIGN_WIDTH * windowScale}px`,
          height: `${DESIGN_HEIGHT * windowScale}px`,
          visibility: scaleIsReady ? "visible" : "hidden",
        }}
      >
        <section
          className="desktop-window"
          aria-label="Lowkeyfi personal website"
          style={{
            transform: `scale(${windowScale})`,
          }}
        >
          <WindowChrome
            title={site.windowTitle}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />

          <div className="window-body">
            <Sidebar
              activeView={activeView}
              onNavigate={handleViewChange}
            />

            <section className="view-area">
              <ActiveView
                onNavigate={handleViewChange}
                initialPostSlug={viewContext.postSlug}
              />
            </section>
          </div>

          <StatusBar
            statusText={site.statusText}
            lastUpdated={site.lastUpdated}
          />
        </section>
      </div>
    </main>
  );
}
