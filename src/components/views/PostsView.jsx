import SectionHeading from "../SectionHeading";

const postCategories = [
  {
    id: "money",
    title: "Money",
    description: "Budgeting, saving, investing, FIRE, and money notes.",
    icon: "/images/posts/money.png",
  },
  {
    id: "travel",
    title: "Travel",
    description: "Trips, costs, itineraries, and travel reflections.",
    icon: "/images/posts/travel.png",
  },
  {
    id: "life-notes",
    title: "Life Notes",
    description: "Personal essays, habits, routines, and reflections.",
    icon: "/images/posts/life-notes.png",
  },
  {
    id: "guides",
    title: "Guides",
    description: "How-to guides and helpful setup posts.",
    icon: "/images/posts/guides.png",
  },
];

export default function PostsView() {
  return (
    <div className="posts-view">
      <SectionHeading as="h1" size="large" showRule>
        POSTS
      </SectionHeading>

      <p className="posts-view__intro">
        Thoughts, updates, guides, and lessons.
      </p>

      <div className="post-category-list">
        {postCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="post-category-card"
            aria-label={`Open ${category.title} posts`}
          >
            <span className="post-category-card__icon" aria-hidden="true">
              <img src={category.icon} alt="" draggable="false" />
            </span>

            <span className="post-category-card__content">
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </span>

            <span className="post-category-card__arrow" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
