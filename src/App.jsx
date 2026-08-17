import { useEffect, useMemo, useRef, useState } from "react";

import Sidebar from "./components/Sidebar";
import WindowChrome from "./components/WindowChrome";

import AboutView from "./components/views/AboutView";
import ContactView from "./components/views/ContactView";
import HomeView from "./components/views/HomeView";
import PostsView from "./components/views/PostsView";
import ResourcesView from "./components/views/ResourcesView";
import { posts, site } from "./lib/content";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const COMPACT_DESIGN_WIDTH = 1440;
const COMPACT_ASPECT_RATIO = 1.35;
const MINIMIZED_WIDTH = 720;
const MINIMIZED_HEIGHT = 74;

const VIEW_COMPONENTS = {
  home: HomeView,
  about: AboutView,
  posts: PostsView,
  resources: ResourcesView,
  contact: ContactView,
};

function cleanPathname(pathname) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const relativePath = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname;
  return `/${relativePath.replace(/^\/+|\/+$/g, "")}`.replace(/^\/$/, "/");
}

function parseRoute(pathname) {
  const parts = cleanPathname(pathname).split("/").filter(Boolean);
  const view = parts[0] ?? "home";

  if (view === "lab") {
    return { view: "posts", categoryId: "exploring" };
  }

  if (!VIEW_COMPONENTS[view]) {
    return { view: "home" };
  }

  return {
    view,
    categoryId: view === "posts" ? parts[1] : undefined,
    postSlug: view === "posts" ? parts[2] : undefined,
  };
}

function routePath(view, context = {}) {
  if (view === "home") return "/";
  if (view !== "posts") return `/${view}`;

  let categoryId = context.categoryId;
  if (context.postSlug && !categoryId) {
    categoryId = posts.find((post) => post.slug === context.postSlug)?.category;
  }

  if (context.postSlug && categoryId) {
    return `/posts/${categoryId}/${context.postSlug}`;
  }
  return categoryId ? `/posts/${categoryId}` : "/posts";
}

function browserPath(route) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${basePath}${route === "/" ? "/" : route}`;
}

export default function LowkeyfiPage() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));
  const [automaticScale, setAutomaticScale] = useState(1);
  const initialDevicePixelRatio = useRef(window.devicePixelRatio || 1);
  const [nativeZoomIsActive, setNativeZoomIsActive] = useState(false);
  const [scaleIsReady, setScaleIsReady] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [designSize, setDesignSize] = useState({
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    function updateWindowScale() {
      // Normalize out native browser page zoom. This keeps the initial laptop-fit
      // presentation responsive to actual window resizing without shrinking the
      // site back down when Ctrl/Cmd zoom changes the CSS viewport dimensions.
      const browserZoomRatio = Math.max(
        (window.devicePixelRatio || initialDevicePixelRatio.current)
          / initialDevicePixelRatio.current,
        0.1,
      );
      const viewportWidth = Math.max(window.innerWidth * browserZoomRatio, 1);
      const viewportHeight = Math.max(window.innerHeight * browserZoomRatio, 1);
      const visualZoomRatio = window.visualViewport?.scale ?? 1;
      const viewportAspectRatio = viewportWidth / viewportHeight;
      const nextCompactLayout = !isMinimized
        && viewportAspectRatio < COMPACT_ASPECT_RATIO;
      const designWidth = isMinimized
        ? MINIMIZED_WIDTH
        : nextCompactLayout
          ? COMPACT_DESIGN_WIDTH
          : DESIGN_WIDTH;
      const designHeight = isMinimized
        ? MINIMIZED_HEIGHT
        : designWidth * (viewportHeight / viewportWidth);
      const nextScale = Math.min(
        viewportWidth / designWidth,
        viewportHeight / designHeight,
      );

      setIsCompactLayout(nextCompactLayout);
      setDesignSize({ width: designWidth, height: designHeight });
      setAutomaticScale(Math.max(isMinimized ? Math.min(nextScale, 1) : nextScale, 0.1));
      setNativeZoomIsActive(browserZoomRatio > 1.001 || visualZoomRatio > 1.001);
      setScaleIsReady(true);
    }

    updateWindowScale();
    window.addEventListener("resize", updateWindowScale);
    window.visualViewport?.addEventListener("resize", updateWindowScale);
    return () => {
      window.removeEventListener("resize", updateWindowScale);
      window.visualViewport?.removeEventListener("resize", updateWindowScale);
    };
  }, [isMinimized]);

  useEffect(() => {
    document.documentElement.classList.toggle("native-page-zoomed", nativeZoomIsActive);
    return () => document.documentElement.classList.remove("native-page-zoomed");
  }, [nativeZoomIsActive]);

  useEffect(() => {
    const handlePopState = () => setRoute(parseRoute(window.location.pathname));
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const ActiveView = VIEW_COMPONENTS[route.view] ?? HomeView;
  const windowScale = Math.max(
    isMinimized ? Math.min(automaticScale, 1) : automaticScale,
    0.1,
  );
  const frameSize = useMemo(() => ({
    width: designSize.width * windowScale,
    height: designSize.height * windowScale,
  }), [designSize, windowScale]);

  function handleViewChange(viewId, nextContext = {}) {
    const nextPath = routePath(viewId, nextContext);
    window.history.pushState({}, "", browserPath(nextPath));
    setRoute(parseRoute(browserPath(nextPath)));
    setIsClosed(false);
    setIsMinimized(false);
  }

  function handleMinimize() {
    setIsMinimized((current) => !current);
  }

  async function handleMaximize() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setIsFullscreen((current) => !current);
    }
  }

  function handleClose() {
    setIsClosed(true);
    setIsMinimized(false);
  }

  return (
    <main
      className="site-stage"
      style={{
        "--design-width": `${designSize.width}px`,
        "--design-height": `${designSize.height}px`,
        "--windows-blue": site.theme.accentColor,
        "--windows-blue-light": site.theme.accentColorLight,
        "--windows-gray": site.theme.windowColor,
        "--stage-background": site.theme.pageBackground,
        "--panel-radius": site.theme.cornerStyle === "square" ? "2px" : "10px",
        minWidth: isClosed ? "100%" : `${frameSize.width}px`,
        minHeight: isClosed ? "100vh" : `${frameSize.height}px`,
      }}
    >
      {isClosed ? (
        <section className="closed-screen" aria-label="LowKeyFI is closed">
          <div className="closed-screen__dialog">
            <strong>Thanks for visiting LowKeyFI.</strong>
            <p>The window is closed, but your journey can continue.</p>
            <button type="button" onClick={() => setIsClosed(false)}>Reopen LowKeyFI</button>
          </div>
        </section>
      ) : (
        <div
          className="scaled-window-frame"
          style={{
            width: `${frameSize.width}px`,
            height: `${frameSize.height}px`,
            visibility: scaleIsReady ? "visible" : "hidden",
          }}
        >
          <section
            className={`desktop-window${isMinimized ? " desktop-window--minimized" : ""}${isCompactLayout ? " desktop-window--compact" : ""}`}
            aria-label="Lowkeyfi personal website"
            style={{ transform: `scale(${windowScale})` }}
          >
            <WindowChrome
              title={site.windowTitle}
              isMinimized={isMinimized}
              isFullscreen={isFullscreen}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onClose={handleClose}
            />

            {!isMinimized && (
              <div className="window-body">
                <Sidebar activeView={route.view} onNavigate={handleViewChange} />
                <section className="view-area">
                  <ActiveView
                    onNavigate={handleViewChange}
                    initialCategoryId={route.categoryId}
                    initialPostSlug={route.postSlug}
                  />
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
