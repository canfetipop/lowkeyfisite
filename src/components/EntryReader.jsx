import SectionHeading from "./SectionHeading";
import { assetUrl, formatPostDate } from "../lib/content";

export default function EntryReader({ entry, categoryTitle, onBack, backLabel }) {
  return (
    <article className="post-reader">
      <button className="post-view-back" type="button" onClick={onBack}>
        ← {backLabel}
      </button>

      <SectionHeading as="h1" size="large" showRule>
        {entry.title}
      </SectionHeading>

      {(entry.date || categoryTitle) && (
        <div className="post-reader__metadata">
          {entry.date && <span>{formatPostDate(entry.date)}</span>}
          {entry.date && categoryTitle && <span>•</span>}
          {categoryTitle && <span>{categoryTitle}</span>}
        </div>
      )}

      {entry.image && (
        <img
          className="post-reader__image"
          src={assetUrl(entry.image)}
          alt={entry.imageAlt ?? ""}
        />
      )}

      <div className="post-reader__body">
        {entry.body.split(/\n\s*\n/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
