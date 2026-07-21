import SectionHeading from "./SectionHeading";
import { assetUrl, formatPostDate } from "../lib/content";

function paragraphs(text = "") {
  return text.split(/\n\s*\n/).filter(Boolean);
}

function TextBlock({ text }) {
  return paragraphs(text).map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>);
}

function ContentSection({ section, index }) {
  const type = section.type ?? "text";

  if (type === "image") {
    return (
      <figure className={`article-image article-image--${section.size ?? "large"}`}>
        <img src={assetUrl(section.image)} alt={section.imageAlt ?? ""} />
        {section.caption && <figcaption>{section.caption}</figcaption>}
      </figure>
    );
  }

  if (type === "text-image") {
    return (
      <section className={`article-split article-split--${section.imagePosition ?? "right"} article-split--${section.size ?? "medium"}`}>
        <div className="article-split__text"><TextBlock text={section.text} /></div>
        <figure className="article-split__media">
          <img src={assetUrl(section.image)} alt={section.imageAlt ?? ""} />
          {section.caption && <figcaption>{section.caption}</figcaption>}
        </figure>
      </section>
    );
  }

  return <section className="article-text" key={index}><TextBlock text={section.text} /></section>;
}

export default function EntryReader({ entry, categoryTitle, onBack, backLabel }) {
  const sections = entry.sections?.length
    ? entry.sections
    : [{ type: entry.image ? "text-image" : "text", text: entry.body, image: entry.image, imageAlt: entry.imageAlt, imagePosition: entry.coverPosition ?? "right", size: entry.coverSize ?? "medium" }];

  return (
    <article className="post-reader">
      <button className="post-view-back" type="button" onClick={onBack}>← {backLabel}</button>

      <SectionHeading as="h1" size="large" showRule>{entry.title}</SectionHeading>

      {(entry.date || categoryTitle) && (
        <div className="post-reader__metadata">
          {entry.date && <span>{formatPostDate(entry.date)}</span>}
          {entry.date && categoryTitle && <span>•</span>}
          {categoryTitle && <span>{categoryTitle}</span>}
        </div>
      )}

      <div className="post-reader__body">
        {sections.map((section, index) => <ContentSection section={section} index={index} key={`${section.type}-${index}`} />)}
      </div>
    </article>
  );
}
