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

  function handleViewChange(viewId) {
    setActiveView(viewId);
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
    <main className="site-stage">
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
            title="eliz.exe"
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
              <ActiveView onNavigate={handleViewChange} />
            </section>
          </div>

          <StatusBar
            statusText="Ready"
            lastUpdated="May 27, 2025"
          />
        </section>
      </div>
    </main>
  );
}
