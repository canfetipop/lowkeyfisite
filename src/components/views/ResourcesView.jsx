import SectionHeading from "../SectionHeading";
import { assetUrl, resourcePosts, resources } from "../../lib/content";

export default function ResourcesView() {
  return (
    <div className="resources-view resources-view--scrollable">
      <SectionHeading as="h1" size="large" showRule>{resources.heading}</SectionHeading>
      <p className="resources-view__intro">{resources.intro}</p>

      <div className="recommendation-list">
        {resources.categories.map((category) => {
          const recommendations = resourcePosts.filter((entry) => entry.category === category.id);
          return (
            <section className="recommendation-group" key={category.id}>
              <header className="recommendation-group__heading">
                <img src={assetUrl(category.icon)} alt="" aria-hidden="true" />
                <div>
                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                </div>
              </header>

              <div className="recommendation-cards">
                {recommendations.map((entry) => (
                  <article className="recommendation-card" key={entry.slug}>
                    {entry.image && <img src={assetUrl(entry.image)} alt={entry.imageAlt ?? ""} />}
                    <div>
                      <h3>{entry.title}</h3>
                      {entry.body.split(/\n\s*\n/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      {entry.url && <a href={entry.url} target="_blank" rel="noreferrer">Visit recommendation →</a>}
                    </div>
                  </article>
                ))}
                {!recommendations.length && <p className="recommendation-empty">Recommendations coming soon.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
