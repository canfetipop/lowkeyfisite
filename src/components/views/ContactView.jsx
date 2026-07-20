import SectionHeading from "../SectionHeading";

const contactLinks = [
  {
    id: "email",
    label: "Email",
    handle: "hello@elizt.com",
    href: "mailto:hello@elizt.com",
    icon: "/images/contact/email.png",
    external: false,
  },
  {
    id: "discord",
    label: "Discord",
    handle: "elizt",
    href: "https://discord.com/",
    icon: "/images/contact/discord.png",
    external: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: "@elizt",
    href: "https://www.youtube.com/@elizt",
    icon: "/images/contact/youtube.png",
    external: true,
  },
];

export default function ContactView() {
  return (
    <div className="contact-view">
      <SectionHeading as="h1" size="large" showRule>
        CONTACT
      </SectionHeading>

      <p className="contact-view__intro">Let&apos;s connect!</p>

      <div className="contact-view__layout">
        <div className="contact-link-list">
          {contactLinks.map((link) => (
            <a
              className="contact-link"
              href={link.href}
              key={link.id}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              <span className="contact-link__icon" aria-hidden="true">
                <img src={link.icon} alt="" />
              </span>

              <span className="contact-link__content">
                <strong>{link.label}</strong>
                <span>{link.handle}</span>
              </span>
            </a>
          ))}
        </div>

        <aside className="support-card" aria-labelledby="support-card-title">
          <h2 id="support-card-title">SUPPORT ELIZ.EXE</h2>
          <p>If this space helped you, you can support the project.</p>
          <img
            className="support-card__image"
            src="/images/contact/ko-fi.png"
            alt="A pixel-art coffee mug with a heart"
          />
          <a
            className="support-card__link"
            href="https://ko-fi.com/elizt"
            target="_blank"
            rel="noreferrer"
          >
            Support on Ko-fi
          </a>
        </aside>
      </div>
    </div>
  );
}
