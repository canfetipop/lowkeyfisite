import siteContent from "../content/site.json";
import homeContent from "../content/home.json";
import aboutContent from "../content/about.json";
import postCategoryContent from "../content/post-categories.json";
import labContent from "../content/lab.json";
import resourceContent from "../content/resources.json";
import contactContent from "../content/contact.json";

const postModules = import.meta.glob("../content/posts/*.json", {
  eager: true,
  import: "default",
});

export const site = siteContent;
export const home = homeContent;
export const about = aboutContent;
export const postCategories = postCategoryContent;
export const lab = labContent;
export const resources = resourceContent;
export const contact = contactContent;

export const posts = Object.values(postModules)
  .filter((post) => post.published)
  .sort((firstPost, secondPost) =>
    secondPost.date.localeCompare(firstPost.date),
  );

export const featuredPost =
  posts.find((post) => post.featured) ?? posts[0] ?? null;

export function assetUrl(path) {
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export function formatPostDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
