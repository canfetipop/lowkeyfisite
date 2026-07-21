import EntryReader from "../EntryReader";
import SectionHeading from "../SectionHeading";
import { assetUrl, formatPostDate, postCategories, posts } from "../../lib/content";

export default function PostsView({ initialCategoryId, initialPostSlug, onNavigate }) {
  const selectedPost = posts.find((post) => post.slug === initialPostSlug);
  const selectedCategory = postCategories.categories.find((category) => category.id === initialCategoryId);
  const categoryPosts = posts.filter((post) => post.category === initialCategoryId);

  if (selectedPost) {
    return (
      <EntryReader
        entry={selectedPost}
        categoryTitle={categoryTitle(selectedPost.category)}
        backLabel={`Back to ${categoryTitle(selectedPost.category)}`}
        onBack={() => onNavigate("posts", { categoryId: selectedPost.category })}
      />
    );
  }

  if (selectedCategory) {
    return (
      <div className="posts-view">
        <button className="post-view-back" type="button" onClick={() => onNavigate("posts")}>← All categories</button>
        <SectionHeading as="h1" size="large" showRule>{selectedCategory.title}</SectionHeading>

        <div className="post-entry-list post-entry-list--category">
          {categoryPosts.length ? categoryPosts.map((post) => (
            <button
              className="post-entry-card"
              key={post.slug}
              type="button"
              onClick={() => onNavigate("posts", { categoryId: post.category, postSlug: post.slug })}
            >
              {post.image && <img src={assetUrl(post.image)} alt="" aria-hidden="true" />}
              <span className="post-entry-card__content">
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
  return postCategories.categories.find((category) => category.id === categoryId)?.title ?? categoryId;
}
