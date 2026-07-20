export default function SectionHeading({
  as: HeadingElement = "h2",
  children,
  size = "medium",
  showRule = false,
  className = "",
}) {
  const headingClasses = [
    "section-heading",
    `section-heading--${size}`,
    showRule ? "section-heading--with-rule" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <HeadingElement className={headingClasses}>
      <span>{children}</span>
    </HeadingElement>
  );
}