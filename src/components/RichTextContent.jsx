import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { assetUrl } from "../lib/content";

function linkUrl(href = "") {
  if (!href || /^(?:[a-z]+:|#|\/\/)/i.test(href)) {
    return href;
  }

  const base = import.meta.env.BASE_URL;

  if (href.startsWith(base)) {
    return href;
  }

  return href.startsWith("/")
    ? `${base}${href.replace(/^\/+/, "")}`
    : href;
}

function openInternalLink(event, url) {
  const modifiedClick = event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey;
  const isInternal = url && !/^(?:[a-z]+:|#|\/\/)/i.test(url);

  if (modifiedClick || !isInternal) {
    return;
  }

  event.preventDefault();
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function RichTextContent({ text = "" }) {
  return (
    <div className="rich-text-content">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ node: _node, href, children, ...props }) {
            const url = linkUrl(href);
            const external = /^(?:https?:)?\/\//i.test(url);

            return (
              <a
                href={url}
                onClick={(event) => openInternalLink(event, url)}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
          img({ node: _node, src, alt = "", ...props }) {
            return <img src={assetUrl(src)} alt={alt} {...props} />;
          },
          table({ node: _node, children, ...props }) {
            return (
              <div className="rich-text-table" role="region" aria-label="Scrollable table" tabIndex="0">
                <table {...props}>{children}</table>
              </div>
            );
          },
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
