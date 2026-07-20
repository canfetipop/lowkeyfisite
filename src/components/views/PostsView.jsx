import { useEffect, useMemo, useState } from "react";

import SectionHeading from "../SectionHeading";
import {
  assetUrl,
  formatPostDate,
  postCategories,
  posts,
} from "../../lib/content";

export default function PostsView({ initialPostSlug, navigationKey }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPostSlug, setSelectedPostSlug] = useState(initialPostSlug ?? null);

  useEffect(() => {
    if (initialPostSlug) {
      setSelectedPostSlug(initialPostSlug);
      setSelectedCategoryId(null);
    } else {
      setSelectedPostSlug(null);
      setSelectedCategoryId(null);
    }
  }, [initialPostSlug, navigationKey]);

  const selectedPost = posts.find((post) => post.slug === selectedPostSlug);
  const selectedCategory = postCategories.categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const categoryPosts = useMemo(
    () => posts.filter((post) => post.category === selectedCategoryId),
    [selectedCategoryId],
  );
  const visibleCategories = postCategories.categories.filter((category) =>
    posts.some((post) => post.category === category.id),
  );

  if (selectedPost) {
    return (
      <article className="post-reader">
        <button
          className="post-view-back"
          type="button"
          onClick={() => {
            setSelectedPostSlug(null);
            setSelectedCategoryId(selectedPost.category);
          }}
        >
          ← Back to posts
        </button>

        <SectionHeading as="h1" size="large" showRule>
          {selectedPost.title}
        </SectionHeading>

        <div className="post-reader__metadata">
          <span>{formatPostDate(selectedPost.date)}</span>
          <span>•</span>
          <span>{categoryTitle(selectedPost.category)}</span>
        </div>

        {selectedPost.image && (
          <img
            className="post-reader__image"
            src={assetUrl(selectedPost.image)}
            alt={selectedPost.imageAlt}
          />
        )}

        <div className="post-reader__body">
          {selectedPost.body.split(/\n\s*\n/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    );
  }

  if (selectedCategory) {
    return (
      <div className="posts-view">
        <button
          className="post-view-back"
          type="button"
          onClick={() => setSelectedCategoryId(null)}
        >
          ← All categories
        </button>

        <SectionHeading as="h1" size="large" showRule>
          {selectedCategory.title}
        </SectionHeading>

        <p className="posts-view__intro">{selectedCategory.description}</p>

        <div className="post-entry-list">
          {categoryPosts.length ? (
            categoryPosts.map((post) => (
              <button
                className="post-entry-card"
                key={post.slug}
                type="button"
                onClick={() => setSelectedPostSlug(post.slug)}
              >
                {post.image && (
                  <img src={assetUrl(post.image)} alt="" aria-hidden="true" />
                )}
                <span className="post-entry-card__content">
                  <strong>{post.title}</strong>
                  <small>{formatPostDate(post.date)}</small>
                  <span>{post.excerpt}</span>
                </span>
                <span className="post-category-card__arrow" aria-hidden="true">›</span>
              </button>
            ))
          ) : (
            <div className="post-empty-state">
              No published posts yet. Add the first one from the admin editor.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="posts-view">
      <SectionHeading as="h1" size="large" showRule>
        {postCategories.heading}
      </SectionHeading>

      <p className="posts-view__intro">{postCategories.intro}</p>

      <div className="post-category-list">
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="post-category-card"
            aria-label={`Open ${category.title} posts`}
            onClick={() => setSelectedCategoryId(category.id)}
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
        ))}
      </div>
    </div>
  );
}

function categoryTitle(categoryId) {
  return (
    postCategories.categories.find((category) => category.id === categoryId)
      ?.title ?? categoryId
  );
}
