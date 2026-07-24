import SectionHeading from "../SectionHeading";
import { assetUrl, resources } from "../../lib/content";

function ResourceSection({ section, index }) {
  const type = section._block ?? section.type;

  if (type === "heading") {
    return <h2 className="resource-content__heading">{section.text}</h2>;
  }

  if (type === "image") {
    return (
      <figure className="resource-content__image">
        <img src={assetUrl(section.image)} alt="" />
      </figure>
    );
  }

  return (
    <div className="resource-content__paragraph">
      {(section.text ?? "").split(/\n\s*\n/).filter(Boolean).map((paragraph) => (
        <p key={`${index}-${paragraph}`}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function ResourcesView() {
  return (
    <div className="resources-view resources-view--scrollable">
      <SectionHeading as="h1" size="large" showRule>{resources.heading}</SectionHeading>
      <div className="resource-content">
        {(resources.sections ?? []).map((section, index) => (
          <ResourceSection
            key={`${section._block ?? section.type}-${index}`}
            section={section}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
