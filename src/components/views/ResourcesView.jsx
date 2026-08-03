import SectionHeading from "../SectionHeading";
import RichTextContent from "../RichTextContent";
import { assetUrl, resources } from "../../lib/content";

function imageWidth(value) {
  const requestedWidth = Number(value ?? 100);
  return Math.min(100, Math.max(10, Number.isFinite(requestedWidth) ? requestedWidth : 100));
}

function ResourceSection({ section, index }) {
  const type = section._block ?? section.type;

  if (type === "heading") {
    return <h2 className="resource-content__heading">{section.text}</h2>;
  }

  if (type === "image") {
    return (
      <figure
        className="resource-content__image"
        style={{ "--content-image-width": `${imageWidth(section.width)}%` }}
      >
        <img src={assetUrl(section.image)} alt="" />
      </figure>
    );
  }

  return (
    <div className="resource-content__paragraph">
      <RichTextContent text={section.text} />
    </div>
  );
}

export default function ResourcesView() {
  const hasResourceBody = typeof resources.body === "string" && resources.body.trim().length > 0;

  return (
    <div className="resources-view resources-view--scrollable">
      <SectionHeading as="h1" size="large" showRule>{resources.heading}</SectionHeading>
      <div className="resource-content">
        {hasResourceBody ? (
          <RichTextContent text={resources.body} />
        ) : (
          (resources.sections ?? []).map((section, index) => (
            <ResourceSection
              key={`${section._block ?? section.type}-${index}`}
              section={section}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
