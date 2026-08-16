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
const MIN_USER_ZOOM = 1;
const MAX_USER_ZOOM = 3;
const KEYBOARD_ZOOM_STEP = 0.1;
const PINCH_ZOOM_SENSITIVITY = 0.007;
const PAN_SPEED = 1.35;
const PAN_OVERSCAN_RATIO = 0.35;
const ARROW_PAN_DISTANCE = 48;

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

function clampZoom(value) {
  return Math.min(Math.max(value, MIN_USER_ZOOM), MAX_USER_ZOOM);
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export default function LowkeyfiPage() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));
  const [automaticScale, setAutomaticScale] = useState(1);
  const [viewportTransform, setViewportTransform] = useState({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const viewportTransformRef = useRef(viewportTransform);
  const [scaleIsReady, setScaleIsReady] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [designSize, setDesignSize] = useState({
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [isClosed, setIsClosed] = useState(false);

  viewportTransformRef.current = viewportTransform;

  function constrainTransform(transform) {
    const scale = Math.max(
      isMinimized
        ? Math.min(automaticScale * transform.zoom, 1)
        : automaticScale * transform.zoom,
      0.1,
    );
    const frameWidth = designSize.width * scale;
    const frameHeight = designSize.height * scale;
    const overscanX = transform.zoom > 1 ? window.innerWidth * PAN_OVERSCAN_RATIO : 0;
    const overscanY = transform.zoom > 1 ? window.innerHeight * PAN_OVERSCAN_RATIO : 0;
    const maximumPanX = Math.max((frameWidth - window.innerWidth) / 2, 0) + overscanX;
    const maximumPanY = Math.max((frameHeight - window.innerHeight) / 2, 0) + overscanY;

    return {
      zoom: transform.zoom,
      panX: clamp(transform.panX, -maximumPanX, maximumPanX),
      panY: clamp(transform.panY, -maximumPanY, maximumPanY),
    };
  }

  function zoomAtAnchor(getNextZoom, anchorX = window.innerWidth / 2, anchorY = window.innerHeight / 2) {
    setViewportTransform((current) => {
      const requestedZoom = typeof getNextZoom === "function"
        ? getNextZoom(current.zoom)
        : getNextZoom;
      const nextZoom = clampZoom(Number(requestedZoom.toFixed(3)));
      if (nextZoom === current.zoom) return current;

      const zoomRatio = nextZoom / current.zoom;
      const cursorFromCenterX = anchorX - window.innerWidth / 2;
      const cursorFromCenterY = anchorY - window.innerHeight / 2;
      return constrainTransform({
        zoom: nextZoom,
        // Preserve the content point directly underneath the cursor.
        panX: cursorFromCenterX - (cursorFromCenterX - current.panX) * zoomRatio,
        panY: cursorFromCenterY - (cursorFromCenterY - current.panY) * zoomRatio,
      });
    });
  }

  function panViewportBy(deltaX, deltaY) {
    setViewportTransform((current) => constrainTransform({
      ...current,
      panX: current.panX + deltaX,
      panY: current.panY + deltaY,
    }));
  }

  function resetViewport() {
    setViewportTransform({ zoom: 1, panX: 0, panY: 0 });
  }

  useEffect(() => {
    function updateWindowScale() {
      // Use the layout viewport so touchpad pinch gestures do not repeatedly
      // resize and reposition the retro window through visualViewport changes.
      const viewportWidth = Math.max(window.innerWidth, 1);
      const viewportHeight = Math.max(window.innerHeight, 1);
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
      setScaleIsReady(true);
    }

    updateWindowScale();
    window.addEventListener("resize", updateWindowScale);
    return () => {
      window.removeEventListener("resize", updateWindowScale);
    };
  }, [isMinimized]);

  useEffect(() => {
    function handleZoomShortcut(event) {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && (event.key === "=" || event.key === "+")) {
        event.preventDefault();
        zoomAtAnchor((current) => current + KEYBOARD_ZOOM_STEP);
      } else if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        zoomAtAnchor((current) => current - KEYBOARD_ZOOM_STEP);
      } else if ((event.ctrlKey || event.metaKey) && event.key === "0") {
        event.preventDefault();
        resetViewport();
      } else if (!isTyping && event.shiftKey && event.key === "1") {
        event.preventDefault();
        resetViewport();
      } else if (!isTyping && viewportTransformRef.current.zoom > 1 && event.key.startsWith("Arrow")) {
        event.preventDefault();
        const distance = ARROW_PAN_DISTANCE * (event.shiftKey ? 3 : 1);
        if (event.key === "ArrowLeft") panViewportBy(distance, 0);
        if (event.key === "ArrowRight") panViewportBy(-distance, 0);
        if (event.key === "ArrowUp") panViewportBy(0, distance);
        if (event.key === "ArrowDown") panViewportBy(0, -distance);
      }
    }

    function handleTouchpad(event) {
      if (event.ctrlKey) {
        event.preventDefault();
        const zoomFactor = clamp(
          Math.exp(-event.deltaY * PINCH_ZOOM_SENSITIVITY),
          0.82,
          1.22,
        );
        zoomAtAnchor((current) => current * zoomFactor, event.clientX, event.clientY);
        return;
      }

      if (viewportTransformRef.current.zoom <= 1 || isMinimized) return;

      event.preventDefault();
      const deltaMultiplier = event.deltaMode === 1
        ? 24
        : event.deltaMode === 2
          ? window.innerHeight
          : 1;
      const horizontalDelta = event.shiftKey && Math.abs(event.deltaX) < 0.5
        ? event.deltaY
        : event.deltaX;
      const verticalDelta = event.shiftKey && Math.abs(event.deltaX) < 0.5
        ? 0
        : event.deltaY;
      panViewportBy(
        -horizontalDelta * deltaMultiplier * PAN_SPEED,
        -verticalDelta * deltaMultiplier * PAN_SPEED,
      );
    }

    function preventNativeGesture(event) {
      event.preventDefault();
    }

    window.addEventListener("keydown", handleZoomShortcut);
    window.addEventListener("wheel", handleTouchpad, { passive: false });
    document.addEventListener("gesturestart", preventNativeGesture, { passive: false });
    document.addEventListener("gesturechange", preventNativeGesture, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleZoomShortcut);
      window.removeEventListener("wheel", handleTouchpad);
      document.removeEventListener("gesturestart", preventNativeGesture);
      document.removeEventListener("gesturechange", preventNativeGesture);
    };
  }, [automaticScale, designSize, isMinimized]);

  useEffect(() => {
    setViewportTransform((current) => {
      const scale = Math.max(
        isMinimized
          ? Math.min(automaticScale * current.zoom, 1)
          : automaticScale * current.zoom,
        0.1,
      );
      const overscanX = current.zoom > 1 ? window.innerWidth * PAN_OVERSCAN_RATIO : 0;
      const overscanY = current.zoom > 1 ? window.innerHeight * PAN_OVERSCAN_RATIO : 0;
      const maximumPanX = Math.max((designSize.width * scale - window.innerWidth) / 2, 0) + overscanX;
      const maximumPanY = Math.max((designSize.height * scale - window.innerHeight) / 2, 0) + overscanY;
      const panX = clamp(current.panX, -maximumPanX, maximumPanX);
      const panY = clamp(current.panY, -maximumPanY, maximumPanY);

      return panX === current.panX && panY === current.panY
        ? current
        : { ...current, panX, panY };
    });
  }, [automaticScale, designSize, isMinimized]);

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
    isMinimized
      ? Math.min(automaticScale * viewportTransform.zoom, 1)
      : automaticScale * viewportTransform.zoom,
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
      }}
    >
      {!isClosed && !isMinimized && (
        <div className="zoom-controls" aria-label="Zoom controls">
          <button
            type="button"
            aria-label="Zoom out"
            title="Zoom out (Ctrl+-)"
            disabled={viewportTransform.zoom <= MIN_USER_ZOOM}
            onClick={() => zoomAtAnchor((current) => current - KEYBOARD_ZOOM_STEP)}
          >
            −
          </button>
          <button
            type="button"
            className="zoom-controls__percentage"
            aria-label={`Reset zoom, currently ${Math.round(viewportTransform.zoom * 100)} percent`}
            title="Reset zoom (Ctrl+0 or Shift+1)"
            onClick={resetViewport}
          >
            {Math.round(viewportTransform.zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            title="Zoom in (Ctrl+=)"
            disabled={viewportTransform.zoom >= MAX_USER_ZOOM}
            onClick={() => zoomAtAnchor((current) => current + KEYBOARD_ZOOM_STEP)}
          >
            +
          </button>
        </div>
      )}

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
            left: `calc(50% + ${viewportTransform.panX}px)`,
            top: `calc(50% + ${viewportTransform.panY}px)`,
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
