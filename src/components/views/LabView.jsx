import SectionHeading from "../SectionHeading";

const labCategories = [
  {
    id: "building",
    title: "Building",
    description: "Websites, tools, templates, and side projects.",
    icon: "/images/lab/building.png",
  },
  {
    id: "learning",
    title: "Learning",
    description: "Surfing, languages, skills, and personal growth.",
    icon: "/images/lab/learning.png",
  },
  {
    id: "hobbies",
    title: "Hobbies",
    description: "Gaming, cooking, photography, writing, and more.",
    icon: "/images/lab/hobbies.png",
  },
  {
    id: "experiments",
    title: "Experiments",
    description: "Challenges, systems, and life experiments.",
    icon: "/images/lab/experiments.png",
  },
];

export default function LabView() {
  return (
    <div className="lab-view">
      <SectionHeading as="h1" size="large" showRule>
        LAB
      </SectionHeading>

      <p className="lab-view__intro">
        Things I&apos;m building, learning, and exploring.
      </p>

      <div className="post-category-list">
        {labCategories.map((category) => (
          <button
            className="post-category-card lab-category-card"
            key={category.id}
            type="button"
          >
            <span className="post-category-card__icon" aria-hidden="true">
              <img src={category.icon} alt="" />
            </span>

            <span className="post-category-card__content">
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </span>

            <span className="post-category-card__arrow" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
