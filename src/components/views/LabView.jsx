import SectionHeading from "../SectionHeading";
import { assetUrl, lab } from "../../lib/content";

export default function LabView() {
  return (
    <div className="lab-view">
      <SectionHeading as="h1" size="large" showRule>
        {lab.heading}
      </SectionHeading>

      <p className="lab-view__intro">
        {lab.intro}
      </p>

      <div className="post-category-list">
        {lab.categories.map((category) => (
          <button
            className="post-category-card lab-category-card"
            key={category.id}
            type="button"
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
