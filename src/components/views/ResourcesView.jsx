import SectionHeading from "../SectionHeading";
import { assetUrl, resources } from "../../lib/content";

export default function ResourcesView() {
  return (
    <div className="resources-view">
      <SectionHeading as="h1" size="large" showRule>
        {resources.heading}
      </SectionHeading>

      <p className="resources-view__intro">
        {resources.intro}
      </p>

      <div className="post-category-list resource-category-list">
        {resources.categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="post-category-card resource-category-card"
            aria-label={`Open ${category.title}`}
          >
            <span className="post-category-card__icon" aria-hidden="true">
              <img src={assetUrl(category.icon)} alt="" draggable="false" />
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
