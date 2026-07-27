import SectionHeading from "./SectionHeading";
import RichTextContent from "./RichTextContent";
import { assetUrl, formatPostDate } from "../lib/content";

function imageWidth(value) {
  const requestedWidth = Number(value ?? 100);
  return Math.min(100, Math.max(10, Number.isFinite(requestedWidth) ? requestedWidth : 100));
}

function ContentSection({ section, index }) {
  const type = section._block ?? section.type ?? "paragraph";

  if (type === "image") {
    return (
      <figure
        className="article-image"
        style={{ "--content-image-width": `${imageWidth(section.width)}%` }}
      >
        <img src={assetUrl(section.image)} alt="" />
      </figure>
    );
  }

  if (type === "heading") {
    return <h2 className="article-heading">{section.text}</h2>;
  }

  if (type === "text-image") {
    return (
      <section className={`article-split article-split--${section.imagePosition ?? "right"} article-split--${section.size ?? "medium"}`}>
        <div className="article-split__text"><RichTextContent text={section.text} /></div>
        <figure className="article-split__media">
          <img src={assetUrl(section.image)} alt="" />
          {section.caption && <figcaption>{section.caption}</figcaption>}
        </figure>
      </section>
    );
  }

  return <section className="article-text" key={index}><RichTextContent text={section.text} /></section>;
}

export default function EntryReader({ entry, categoryTitle, onBack, backLabel }) {
  const sections = entry.sections?.length
    ? entry.sections
    : [{ _block: "paragraph", text: entry.body }];

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
        {sections.map((section, index) => <ContentSection section={section} index={index} key={`${section._block ?? section.type}-${index}`} />)}
      </div>
    </article>
  );
}
