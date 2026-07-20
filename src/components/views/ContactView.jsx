import SectionHeading from "../SectionHeading";
import { assetUrl, contact } from "../../lib/content";

export default function ContactView() {
  return (
    <div className="contact-view">
      <SectionHeading as="h1" size="large" showRule>
        {contact.heading}
      </SectionHeading>

      <p className="contact-view__intro">{contact.intro}</p>

      <div className="contact-view__layout">
        <div className="contact-link-list">
          {contact.links.map((link) => (
            <a
              className="contact-link"
              href={link.url}
              key={link.id}
              target={link.openInNewTab ? "_blank" : undefined}
              rel={link.openInNewTab ? "noreferrer" : undefined}
            >
              <span className="contact-link__icon" aria-hidden="true">
                <img src={assetUrl(link.icon)} alt="" />
              </span>

              <span className="contact-link__content">
                <strong>{link.label}</strong>
                <span>{link.handle}</span>
              </span>
            </a>
          ))}
        </div>

        {contact.support.enabled && (
        <aside className="support-card" aria-labelledby="support-card-title">
          <h2 id="support-card-title">{contact.support.heading}</h2>
          <p>{contact.support.description}</p>
          <img
            className="support-card__image"
            src={assetUrl(contact.support.image)}
            alt={contact.support.imageAlt}
          />
          <a
            className="support-card__link"
            href={contact.support.url}
            target="_blank"
            rel="noreferrer"
          >
            {contact.support.buttonLabel}
          </a>
        </aside>
        )}
      </div>
    </div>
  );
}
