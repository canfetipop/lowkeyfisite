import SectionHeading from "../SectionHeading";

const HOME_CONTENT = {
  hero: {
    heading: "HOME",
    description: (
      <>
        notes on money, projects,
        <br />
        travel, and becoming.
      </>
    ),
    imageSource: "/images/hero-night.png",
    imageAlt:
      "Pixel-art scene of a person working beside a window overlooking a city at night",
  },

  latestPost: {
    title: "Annual Spending Update – 2024",
    date: "May 27, 2025",
    category: "Money",
    description:
      "A full breakdown of my spending in 2024, what changed, and what I’m adjusting for 2025.",
    href: "/posts/annual-spending-update-2024",
    imageSource: "/images/annual-spending-2024.png",
    imageAlt:
      "Notebook labeled 2024 Spending beside a calculator and coffee",
  },

  currentStatus: [
    {
      id: "building",
      label: "Building:",
      value: "eliz.exe v1",
      href: "/posts?tag=current-status-building",
      Icon: ComputerStatusIcon,
    },
    {
      id: "learning",
      label: "Learning:",
      value: "Surfing",
      href: "/posts?tag=current-status-learning",
      Icon: LearningStatusIcon,
    },
    {
      id: "reading",
      label: "Reading:",
      value: "The Psychology of Money",
      href: "/posts?tag=current-status-reading",
      Icon: ReadingStatusIcon,
    },
    {
      id: "planning",
      label: "Planning:",
      value: "Bali trip",
      href: "/posts?tag=current-status-planning",
      Icon: PlanningStatusIcon,
    },
    {
      id: "focus",
      label: "Focus:",
      value: "Save, invest, grow",
      href: "/posts?tag=current-status-focus",
      Icon: FocusStatusIcon,
    },
  ],
};

export default function HomeView({ onNavigate }) {
  const { hero, latestPost, currentStatus } = HOME_CONTENT;

  return (
    <div className="home-view">
      <section className="home-hero">
        <div className="home-hero__introduction">
          <SectionHeading
            as="h1"
            size="large"
            showRule
          >
            {hero.heading}
          </SectionHeading>

          <p className="home-hero__description">
            {hero.description}
          </p>
        </div>

        <div className="home-hero__image-frame">
          <img
            className="home-hero__image"
            src={hero.imageSource}
            alt={hero.imageAlt}
            draggable="false"
          />
        </div>
      </section>

      <section className="home-dashboard">
        <article className="windows-panel latest-post-panel">
          <SectionHeading
            as="h2"
            size="medium"
          >
            LATEST POST
          </SectionHeading>

          <div className="latest-post">
            <button
              type="button"
              onClick={() => onNavigate("posts")}
              className="latest-post__image-link"
              aria-label={`Read ${latestPost.title}`}
            >
              <img
                className="latest-post__image"
                src={latestPost.imageSource}
                alt={latestPost.imageAlt}
                draggable="false"
              />
            </button>

            <div className="latest-post__content">
              <button
                type="button"
                onClick={() => onNavigate("posts")}
                className="latest-post__title"
              >
                {latestPost.title}
              </button>

              <div className="latest-post__metadata">
                <span>{latestPost.date}</span>
                <span aria-hidden="true">•</span>
                <span>{latestPost.category}</span>
              </div>

              <p className="latest-post__description">
                {latestPost.description}
              </p>

              <button
                type="button"
                onClick={() => onNavigate("posts")}
                className="latest-post__read-more"
              >
                <span>Read more</span>
                <span
                  className="latest-post__arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </div>
          </div>
        </article>

        <aside className="windows-panel current-status-panel">
          <SectionHeading
            as="h2"
            size="medium"
          >
            CURRENT STATUS
          </SectionHeading>

          <div className="current-status-list">
            {currentStatus.map((statusItem) => {
              const Icon = statusItem.Icon;

              return (
                <button
                  type="button"
                  key={statusItem.id}
                  onClick={() => onNavigate("posts")}
                  className="current-status-item"
                >
                  <span
                    className="current-status-item__icon"
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>

                  <span className="current-status-item__text">
                    <strong>
                      {statusItem.label}
                    </strong>

                    <span>{statusItem.value}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}

function ComputerStatusIcon() {
  return (
    <svg
      viewBox="0 0 44 44"
      className="status-pixel-icon"
      shapeRendering="crispEdges"
    >
      <rect
        x="7"
        y="5"
        width="28"
        height="23"
        rx="2"
        fill="#bdbdbd"
        stroke="#111"
        strokeWidth="2"
      />
      <rect
        x="11"
        y="9"
        width="20"
        height="14"
        fill="#168ac7"
        stroke="#111"
        strokeWidth="2"
      />
      <path
        d="M18 28v5h-8v5h25v-5H26v-5"
        fill="#bdbdbd"
        stroke="#111"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="12"
        width="10"
        height="7"
        fill="#65d9ff"
      />
    </svg>
  );
}

function LearningStatusIcon() {
  return (
    <svg
      viewBox="0 0 44 44"
      className="status-pixel-icon"
      shapeRendering="crispEdges"
    >
      <path
        d="M32 4C17 8 8 20 10 37c13-5 22-15 22-33Z"
        fill="#38b45c"
        stroke="#111"
        strokeWidth="2"
      />
      <path
        d="M28 8C22 20 17 27 9 38"
        fill="none"
        stroke="#d1a13b"
        strokeWidth="3"
      />
      <path
        d="m19 19 8-4M15 26l8-3"
        fill="none"
        stroke="#0b7c32"
        strokeWidth="2"
      />
    </svg>
  );
}

function ReadingStatusIcon() {
  return (
    <svg
      viewBox="0 0 44 44"
      className="status-pixel-icon"
      shapeRendering="crispEdges"
    >
      <path
        d="M4 9c7-3 12-2 18 3v27c-6-5-12-6-18-3Z"
        fill="#f2cf63"
        stroke="#111"
        strokeWidth="2"
      />
      <path
        d="M40 9c-7-3-12-2-18 3v27c6-5 12-6 18-3Z"
        fill="#fff1a2"
        stroke="#111"
        strokeWidth="2"
      />
      <path
        d="M22 12v27"
        fill="none"
        stroke="#111"
        strokeWidth="2"
      />
    </svg>
  );
}

function PlanningStatusIcon() {
  return (
    <svg
      viewBox="0 0 44 44"
      className="status-pixel-icon"
      shapeRendering="crispEdges"
    >
      <path
        d="m5 27 13-4L33 7c3-3 7 1 4 4L25 27l-3 13-5-1 1-9-8 2Z"
        fill="#78b7e8"
        stroke="#111"
        strokeWidth="2"
      />
      <path
        d="m18 23 7 4"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <path
        d="m30 11 5 5"
        fill="none"
        stroke="#1c5f9e"
        strokeWidth="2"
      />
    </svg>
  );
}

function FocusStatusIcon() {
  return (
    <svg
      viewBox="0 0 44 44"
      className="status-pixel-icon"
      shapeRendering="crispEdges"
    >
      <circle
        cx="22"
        cy="22"
        r="17"
        fill="#ed2024"
        stroke="#111"
        strokeWidth="2"
      />
      <circle
        cx="22"
        cy="22"
        r="12"
        fill="#fff"
        stroke="#d40d12"
        strokeWidth="2"
      />
      <circle
        cx="22"
        cy="22"
        r="7"
        fill="#ed2024"
        stroke="#111"
        strokeWidth="2"
      />
      <circle
        cx="22"
        cy="22"
        r="2"
        fill="#fff"
      />
    </svg>
  );
}
