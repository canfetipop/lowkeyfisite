import SectionHeading from "../SectionHeading";

const resourceCategories = [
  {
    id: "books",
    title: "Books",
    description: "Finance, mindset, investing, and more.",
    icon: "/images/resources/books.png",
  },
  {
    id: "tools",
    title: "Tools / Apps",
    description: "Apps, software, and tools that help me.",
    icon: "/images/resources/tools.png",
  },
  {
    id: "equipment",
    title: "Equipment",
    description: "Gear and setups I use and recommend.",
    icon: "/images/resources/equipment.png",
  },
  {
    id: "other",
    title: "Other Recommendations",
    description: "Random things worth sharing.",
    icon: "/images/resources/other.png",
  },
];

export default function ResourcesView() {
  return (
    <div className="resources-view">
      <SectionHeading as="h1" size="large" showRule>
        RESOURCES
      </SectionHeading>

      <p className="resources-view__intro">
        Books, tools, and things I recommend.
      </p>

      <div className="post-category-list resource-category-list">
        {resourceCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="post-category-card resource-category-card"
            aria-label={`Open ${category.title}`}
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
