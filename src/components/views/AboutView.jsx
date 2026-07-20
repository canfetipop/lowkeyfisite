import SectionHeading from "../SectionHeading";

export default function AboutView() {
  return (
    <div className="about-view">
      <SectionHeading as="h1" size="large">
        ABOUT ME
      </SectionHeading>

      <div className="about-view__image-frame">
        <img
          className="about-view__image"
          src="/images/hero-night.png"
          alt="Pixel-art scene of a person working beside a window overlooking a city at night"
          draggable="false"
        />
      </div>

      <div className="about-view__copy">
        <p>I&apos;m the person behind eliz.exe.</p>
        <p>
          This space is where I document my journey toward financial independence
          while building a life I enjoy. I write about money, projects, travel,
          and everything in between.
        </p>
        <p>Thanks for being here.</p>
      </div>
    </div>
  );
}
