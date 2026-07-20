import { useEffect, useState } from "react";

import EntryReader from "../EntryReader";
import SectionHeading from "../SectionHeading";
import { assetUrl, resourcePosts, resources } from "../../lib/content";

export default function ResourcesView({ navigationKey }) {
  const [selectedEntrySlug, setSelectedEntrySlug] = useState(null);

  useEffect(() => {
    setSelectedEntrySlug(null);
  }, [navigationKey]);

  const selectedEntry = resourcePosts.find((entry) => entry.slug === selectedEntrySlug);
  const selectedCategory = resources.categories.find(
    (category) => category.id === selectedEntry?.category,
  );
  const visibleCategories = resources.categories.filter((category) =>
    resourcePosts.some((entry) => entry.category === category.id),
  );

  if (selectedEntry) {
    return (
      <EntryReader
        entry={selectedEntry}
        categoryTitle={selectedCategory?.title}
        backLabel="All Resources"
        onBack={() => setSelectedEntrySlug(null)}
      />
    );
  }

  return (
    <div className="resources-view">
      <SectionHeading as="h1" size="large" showRule>{resources.heading}</SectionHeading>
      <p className="resources-view__intro">{resources.intro}</p>
      {visibleCategories.length ? (
        <div className="post-category-list resource-category-list">
          {visibleCategories.map((category) => {
            const entry = resourcePosts.find((candidate) => candidate.category === category.id);
            return (
              <button
                key={category.id}
                type="button"
                className="post-category-card resource-category-card"
                aria-label={`Open ${category.title}`}
                onClick={() => setSelectedEntrySlug(entry.slug)}
              >
                <span className="post-category-card__icon" aria-hidden="true">
                  <img src={assetUrl(category.icon)} alt="" draggable="false" />
                </span>
                <span className="post-category-card__content">
                  <strong>{category.title}</strong>
                  <span>{category.description}</span>
                </span>
                <span className="post-category-card__arrow" aria-hidden="true">›</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="post-empty-state">No published Resources yet.</div>
      )}
    </div>
  );
}
