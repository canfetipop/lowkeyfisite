import { useEffect, useMemo, useState } from "react";

import EntryReader from "../EntryReader";
import SectionHeading from "../SectionHeading";
import { assetUrl, lab, labPosts } from "../../lib/content";

export default function LabView({ navigationKey }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedEntrySlug, setSelectedEntrySlug] = useState(null);

  useEffect(() => {
    setSelectedCategoryId(null);
    setSelectedEntrySlug(null);
  }, [navigationKey]);

  const selectedCategory = lab.categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const selectedEntry = labPosts.find((entry) => entry.slug === selectedEntrySlug);
  const categoryEntries = useMemo(
    () => labPosts.filter((entry) => entry.category === selectedCategoryId),
    [selectedCategoryId],
  );
  const visibleCategories = lab.categories.filter((category) =>
    labPosts.some((entry) => entry.category === category.id),
  );

  if (selectedEntry) {
    return (
      <EntryReader
        entry={selectedEntry}
        categoryTitle={selectedCategory?.title}
        backLabel={`Back to ${selectedCategory?.title ?? "Lab"}`}
        onBack={() => setSelectedEntrySlug(null)}
      />
    );
  }

  if (selectedCategory) {
    return (
      <div className="lab-view">
        <button className="post-view-back" type="button" onClick={() => setSelectedCategoryId(null)}>
          ← All Lab categories
        </button>
        <SectionHeading as="h1" size="large" showRule>{selectedCategory.title}</SectionHeading>
        <p className="lab-view__intro">{selectedCategory.description}</p>
        <div className="post-entry-list">
          {categoryEntries.map((entry) => (
            <button className="post-entry-card" key={entry.slug} type="button" onClick={() => setSelectedEntrySlug(entry.slug)}>
              {entry.image && <img src={assetUrl(entry.image)} alt="" aria-hidden="true" />}
              <span className="post-entry-card__content">
                <strong>{entry.title}</strong>
                <span>{entry.excerpt}</span>
              </span>
              <span className="post-category-card__arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lab-view">
      <SectionHeading as="h1" size="large" showRule>{lab.heading}</SectionHeading>
      <p className="lab-view__intro">{lab.intro}</p>
      {visibleCategories.length ? (
        <div className="post-category-list">
          {visibleCategories.map((category) => (
            <button className="post-category-card lab-category-card" key={category.id} type="button" onClick={() => setSelectedCategoryId(category.id)}>
              <span className="post-category-card__icon" aria-hidden="true">
                <img src={assetUrl(category.icon)} alt="" draggable="false" />
              </span>
              <span className="post-category-card__content">
                <strong>{category.title}</strong>
                <span>{category.description}</span>
              </span>
              <span className="post-category-card__arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="post-empty-state">No published Lab posts yet.</div>
      )}
    </div>
  );
}
