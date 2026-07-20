import SectionHeading from "../SectionHeading";
import {
  assetUrl,
  featuredPost,
  formatPostDate,
  home,
  postCategories,
} from "../../lib/content";

const STATUS_ICONS = {
  computer: "/images/sidebar/home.png",
  learning: "/images/lab/learning.png",
  reading: "/images/resources/books.png",
  planning: "/images/posts/travel.png",
  focus: "/images/posts/money.png",
};

export default function HomeView({ onNavigate }) {
  const latestPost = featuredPost;
  const latestCategory = postCategories.categories.find(
    (category) => category.id === latestPost?.category,
  );

  function openLatestPost() {
    if (latestPost) {
      onNavigate("posts", { postSlug: latestPost.slug });
    }
  }

  return (
    <div className="home-view">
      <section className="home-hero">
        <div className="home-hero__introduction">
          <SectionHeading as="h1" size="large" showRule>
            {home.heading}
          </SectionHeading>

          <p className="home-hero__description">{home.description}</p>
        </div>

        <div className="home-hero__image-frame">
          <img
            className="home-hero__image"
            src={assetUrl(home.heroImage)}
            alt={home.heroImageAlt}
            draggable="false"
          />
        </div>
      </section>

      <section className="home-dashboard">
        <article className="windows-panel latest-post-panel">
          <SectionHeading as="h2" size="medium">
            LATEST POST
          </SectionHeading>

          {latestPost ? (
            <div className="latest-post">
              <button
                type="button"
                onClick={openLatestPost}
                className="latest-post__image-link"
                aria-label={`Read ${latestPost.title}`}
              >
                <img
                  className="latest-post__image"
                  src={assetUrl(latestPost.image)}
                  alt={latestPost.imageAlt}
                  draggable="false"
                />
              </button>

              <div className="latest-post__content">
                <button
                  type="button"
                  onClick={openLatestPost}
                  className="latest-post__title"
                >
                  {latestPost.title}
                </button>

                <div className="latest-post__metadata">
                  <span>{formatPostDate(latestPost.date)}</span>
                  <span aria-hidden="true">•</span>
                  <span>{latestCategory?.title ?? latestPost.category}</span>
                </div>

                <p className="latest-post__description">{latestPost.excerpt}</p>

                <button
                  type="button"
                  onClick={openLatestPost}
                  className="latest-post__read-more"
                >
                  <span>Read more</span>
                  <span className="latest-post__arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="latest-post-empty">
              Add a published post from the admin editor.
            </p>
          )}
        </article>

        <aside className="windows-panel current-status-panel">
          <SectionHeading as="h2" size="medium">
            CURRENT STATUS
          </SectionHeading>

          <div className="current-status-list">
            {home.currentStatus.map((statusItem) => (
              <button
                type="button"
                key={statusItem.id}
                onClick={() => onNavigate("posts")}
                className="current-status-item"
              >
                <span className="current-status-item__icon" aria-hidden="true">
                  <img
                    className="status-pixel-icon"
                    src={assetUrl(
                      STATUS_ICONS[statusItem.icon] ?? STATUS_ICONS.computer,
                    )}
                    alt=""
                  />
                </span>

                <span className="current-status-item__text">
                  <strong>{statusItem.label}</strong>
                  <span>{statusItem.value}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
