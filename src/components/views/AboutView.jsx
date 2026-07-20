import SectionHeading from "../SectionHeading";
import { about, assetUrl } from "../../lib/content";

export default function AboutView() {
  return (
    <div className="about-view">
      <SectionHeading as="h1" size="large">
        {about.heading}
      </SectionHeading>

      <div className="about-view__image-frame">
        <img
          className="about-view__image"
          src={assetUrl(about.image)}
          alt={about.imageAlt}
          draggable="false"
        />
      </div>

      <div className="about-view__copy">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
