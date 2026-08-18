import EntryReader from "../EntryReader";
import SectionHeading from "../SectionHeading";
import {
  assetUrl,
  formatPostDate,
  postCategories as publicPostCategories,
  posts as publicPosts,
} from "../../lib/content";

export default function PostsView({
  initialCategoryId,
  initialPostSlug,
  isAdminPreview = false,
  onNavigate,
  postCategories = publicPostCategories,
  posts = publicPosts,
}) {
  const selectedPost = posts.find((post) => post.slug === initialPostSlug);
  const selectedCategory = postCategories.categories.find((category) => category.id === initialCategoryId);
  const categoryPosts = posts.filter((post) => post.category === initialCategoryId);

  if (selectedPost) {
    return (
      <EntryReader
        entry={selectedPost}
        adminVisibility={isAdminPreview ? effectiveVisibility(selectedPost, categoryFor(postCategories, selectedPost.category)) : ""}
        categoryTitle={categoryTitle(postCategories, selectedPost.category)}
        backLabel={`Back to ${categoryTitle(postCategories, selectedPost.category)}`}
        onBack={() => onNavigate("posts", { categoryId: selectedPost.category })}
      />
    );
  }

  if (selectedCategory) {
    return (
      <div className="posts-view">
        <button className="post-view-back" type="button" onClick={() => onNavigate("posts")}>← All categories</button>
        {isAdminPreview && (
          <span className={`admin-preview-badge admin-preview-badge--${selectedCategory.visibility ?? "private"}`}>
            {(selectedCategory.visibility ?? "private").toUpperCase()}
          </span>
        )}
        <SectionHeading as="h1" size="large" showRule>{selectedCategory.title}</SectionHeading>

        <div className="post-entry-list post-entry-list--category">
          {categoryPosts.length ? categoryPosts.map((post) => (
            <button
              className={`post-entry-card${post.image ? "" : " post-entry-card--no-image"}`}
              key={post.slug}
              type="button"
              onClick={() => onNavigate("posts", { categoryId: post.category, postSlug: post.slug })}
            >
              {post.image && <img src={assetUrl(post.image)} alt="" aria-hidden="true" />}
              <span className="post-entry-card__content">
                {isAdminPreview && (
                  <span className={`admin-preview-badge admin-preview-badge--${effectiveVisibility(post, selectedCategory)}`}>
                    {effectiveVisibility(post, selectedCategory).toUpperCase()}
                  </span>
                )}
                <strong>{post.title}</strong>
                <small>{formatPostDate(post.date)}</small>
                <span>{post.excerpt}</span>
              </span>
              <span className="post-category-card__arrow" aria-hidden="true">›</span>
            </button>
          )) : (
            <div className="post-empty-state">No posts in this category yet.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="posts-view">
      <SectionHeading as="h1" size="large" showRule>{postCategories.heading}</SectionHeading>
      <p className="posts-view__intro">{postCategories.intro}</p>

      <div className="post-category-list">
        {postCategories.categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="post-category-card"
            aria-label={`Open ${category.title} posts`}
            onClick={() => onNavigate("posts", { categoryId: category.id })}
          >
            <span className="post-category-card__icon" aria-hidden="true">
              <img src={assetUrl(category.icon)} alt="" draggable="false" />
            </span>
            <span className="post-category-card__content">
              {isAdminPreview && (
                <span className={`admin-preview-badge admin-preview-badge--${category.visibility ?? "private"}`}>
                  {(category.visibility ?? "private").toUpperCase()}
                </span>
              )}
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

function categoryTitle(postCategories, categoryId) {
  return postCategories.categories.find((category) => category.id === categoryId)?.title ?? categoryId;
}

function effectiveVisibility(post, category) {
  return post.visibility === "public" && category?.visibility === "public"
    ? "public"
    : "private";
}

function categoryFor(postCategories, categoryId) {
  return postCategories.categories.find((category) => category.id === categoryId);
}
