const PUBLIC_REPOSITORY = { owner: "canfetipop", repo: "lowkeyfisite", branch: "main" };
const PRIVATE_REPOSITORY = { owner: "emaeveky", repo: "lowkeyfi-content", branch: "main" };
const TOKEN_KEY = "lowkeyfi-admin-token";
const DRAFT_PREFIX = "lowkeyfi-private-draft:";

const elements = Object.fromEntries([
  "loginPanel", "editorPanel", "tokenInput", "connectButton", "disconnectButton",
  "loginStatus", "signedInLabel", "refreshButton", "syncButton", "categoryCount",
  "publicPostCount", "privatePostCount", "deploymentState", "categoryList",
  "postList", "previewFrame", "documentSelect", "editorDrawer", "postFields",
  "titleInput", "slugInput", "dateInput", "excerptInput", "publishedInput",
  "featuredInput", "bodyInput", "saveState", "editorStatus", "discardButton",
  "publishButton",
].map((id) => [id, document.getElementById(id)]));

let token = sessionStorage.getItem(TOKEN_KEY) || "";
let privateCategoryDocument = null;
let privateCategorySha = "";
let privatePosts = [];
let privateTree = [];
let currentPath = "";
let currentSha = "";
let currentDocument = null;
let draftTimer = null;
let busy = false;

function repositoryApi(repository, path = "") {
  return `https://api.github.com/repos/${repository.owner}/${repository.repo}${path}`;
}

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `status-message${type ? ` ${type}` : ""}${element === elements.editorStatus ? " admin-status" : ""}`;
}

function setBusy(nextBusy) {
  busy = nextBusy;
  [elements.connectButton, elements.refreshButton, elements.syncButton, elements.publishButton]
    .filter(Boolean)
    .forEach((element) => { element.disabled = nextBusy; });
  document.querySelectorAll("[data-visibility-action]").forEach((button) => {
    button.disabled = nextBusy;
  });
}

async function request(url, options = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub request failed (${response.status})`);
  return data;
}

function github(repository, path, options = {}) {
  return request(repositoryApi(repository, path), options);
}

function decodeBase64(value) {
  const bytes = Uint8Array.from(atob(value.replace(/\n/g, "")), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function normalizeVisibility(value) {
  return value === "public" ? "public" : "private";
}

function categoryForPost(post) {
  return privateCategoryDocument?.categories.find((category) => category.id === post.category);
}

function effectiveVisibility(post) {
  return normalizeVisibility(post.visibility) === "public"
    && normalizeVisibility(categoryForPost(post)?.visibility) === "public"
    ? "public"
    : "private";
}

function cleanDocument(document) {
  const { _path, _sha, ...clean } = document;
  return clean;
}

function draftKey(path = currentPath) {
  return `${DRAFT_PREFIX}${PRIVATE_REPOSITORY.owner}/${PRIVATE_REPOSITORY.repo}/${path}`;
}

function valuesFromForm() {
  const visibility = elements.publishedInput.checked ? "public" : "private";
  return {
    ...cleanDocument(currentDocument),
    title: elements.titleInput.value.trim(),
    slug: elements.slugInput.value.trim(),
    date: elements.dateInput.value,
    excerpt: elements.excerptInput.value,
    visibility,
    published: visibility === "public",
    featured: elements.featuredInput.checked,
    body: elements.bodyInput.value,
  };
}

function populateForm(value) {
  elements.titleInput.value = value.title || "";
  elements.slugInput.value = value.slug || "";
  elements.dateInput.value = value.date || "";
  elements.excerptInput.value = value.excerpt || "";
  elements.publishedInput.checked = normalizeVisibility(value.visibility) === "public";
  elements.featuredInput.checked = Boolean(value.featured);
  elements.bodyInput.value = value.body || "";
}

function saveDraft({ immediate = false } = {}) {
  if (!currentPath || !currentDocument) return;
  clearTimeout(draftTimer);
  const write = () => {
    const draft = { sha: currentSha, updatedAt: new Date().toISOString(), value: valuesFromForm() };
    localStorage.setItem(draftKey(), JSON.stringify(draft));
    elements.saveState.textContent = `Draft saved locally at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };
  if (immediate) write();
  else {
    elements.saveState.textContent = "Saving local draft…";
    draftTimer = setTimeout(write, 650);
  }
}

function restoreDraft() {
  const raw = localStorage.getItem(draftKey());
  if (!raw) {
    elements.saveState.textContent = "No local draft changes";
    return;
  }
  try {
    const draft = JSON.parse(raw);
    if (draft.sha !== currentSha) {
      elements.saveState.textContent = "Older browser draft skipped because private GitHub content is newer";
      return;
    }
    populateForm(draft.value);
    elements.saveState.textContent = `Restored browser draft from ${new Date(draft.updatedAt).toLocaleString()}`;
  } catch {
    localStorage.removeItem(draftKey());
  }
}

async function getRepositoryTree(repository) {
  const tree = await github(repository, `/git/trees/${encodeURIComponent(repository.branch)}?recursive=1`);
  return tree.tree ?? [];
}

async function getJsonFile(repository, path) {
  const file = await github(repository, `/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(repository.branch)}`);
  return { sha: file.sha, value: JSON.parse(decodeBase64(file.content)) };
}

async function loadPrivateContent({ preserveSelection = true } = {}) {
  const selectedPath = preserveSelection ? currentPath : "";
  privateTree = await getRepositoryTree(PRIVATE_REPOSITORY);
  const categoryFile = await getJsonFile(PRIVATE_REPOSITORY, "content/post-categories.json");
  privateCategorySha = categoryFile.sha;
  privateCategoryDocument = {
    ...categoryFile.value,
    categories: (categoryFile.value.categories ?? []).map((category) => ({
      ...category,
      visibility: normalizeVisibility(category.visibility),
    })),
  };

  const postPaths = privateTree
    .filter((item) => item.type === "blob" && /^content\/posts\/[^/]+\/[^/]+\.json$/.test(item.path))
    .map((item) => item.path);
  privatePosts = await Promise.all(postPaths.map(async (path) => {
    const file = await getJsonFile(PRIVATE_REPOSITORY, path);
    const category = path.split("/").at(-2);
    return {
      ...file.value,
      category: file.value.category ?? category,
      visibility: normalizeVisibility(file.value.visibility ?? (file.value.published ? "public" : "private")),
      _path: path,
      _sha: file.sha,
    };
  }));
  privatePosts.sort((first, second) => (second.date ?? "").localeCompare(first.date ?? ""));

  renderDashboard();
  populateDocumentSelect();
  sendPreviewContent();

  const nextSelection = privatePosts.some((post) => post._path === selectedPath)
    ? selectedPath
    : privatePosts[0]?._path;
  if (nextSelection) loadDocument(nextSelection);
}

function visibilityBadge(visibility, extraText = "") {
  const label = visibility === "public" ? "PUBLIC" : "PRIVATE";
  return `<span class="visibility-badge visibility-badge--${visibility}">${label}${extraText}</span>`;
}

function adminAssetUrl(path) {
  if (!path) return "";
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `..${path.startsWith("/") ? path : `/${path}`}`;
}

function renderDashboard() {
  const publicPosts = privatePosts.filter((post) => effectiveVisibility(post) === "public");
  elements.categoryCount.textContent = String(privateCategoryDocument.categories.length);
  elements.publicPostCount.textContent = String(publicPosts.length);
  elements.privatePostCount.textContent = String(privatePosts.length - publicPosts.length);

  elements.categoryList.innerHTML = privateCategoryDocument.categories.map((category) => {
    const visibility = normalizeVisibility(category.visibility);
    const nextVisibility = visibility === "public" ? "private" : "public";
    const count = privatePosts.filter((post) => post.category === category.id).length;
    return `
      <article class="visibility-row">
        <img src="${escapeAttribute(adminAssetUrl(category.icon))}" alt="" />
        <div>
          ${visibilityBadge(visibility)}
          <strong>${escapeHtml(category.title)}</strong>
          <span>${count} post${count === 1 ? "" : "s"}</span>
        </div>
        <button type="button" data-visibility-action="category" data-id="${escapeAttribute(category.id)}" data-next="${nextVisibility}">
          Make ${nextVisibility}
        </button>
      </article>`;
  }).join("");

  elements.postList.innerHTML = privatePosts.map((post) => {
    const ownVisibility = normalizeVisibility(post.visibility);
    const category = categoryForPost(post);
    const categoryPrivate = normalizeVisibility(category?.visibility) !== "public";
    const effective = effectiveVisibility(post);
    const nextVisibility = ownVisibility === "public" ? "private" : "public";
    const note = categoryPrivate && ownVisibility === "public" ? " — CATEGORY PRIVATE" : "";
    return `
      <article class="visibility-row visibility-row--post">
        <div>
          ${visibilityBadge(effective, note)}
          <strong>${escapeHtml(post.title)}</strong>
          <span>${escapeHtml(category?.title ?? post.category)} · ${escapeHtml(post.date ?? "No date")}</span>
        </div>
        <div class="row-actions">
          <button type="button" data-edit-path="${escapeAttribute(post._path)}">Edit</button>
          <button type="button" data-visibility-action="post" data-path="${escapeAttribute(post._path)}" data-next="${nextVisibility}">
            Make ${nextVisibility}
          </button>
        </div>
      </article>`;
  }).join("");
}

function populateDocumentSelect() {
  const previous = elements.documentSelect.value;
  elements.documentSelect.replaceChildren(...privatePosts.map((post) => {
    const option = document.createElement("option");
    option.value = post._path;
    option.textContent = `${post.category} — ${post.title} [${effectiveVisibility(post)}]`;
    return option;
  }));
  if (privatePosts.some((post) => post._path === previous)) elements.documentSelect.value = previous;
}

function loadDocument(path) {
  if (currentPath && currentPath !== path) saveDraft({ immediate: true });
  const post = privatePosts.find((item) => item._path === path);
  if (!post) return;
  currentPath = path;
  currentSha = post._sha;
  currentDocument = post;
  elements.documentSelect.value = path;
  populateForm(post);
  restoreDraft();
  setStatus(elements.editorStatus, `Editing private source: ${path}`);
}

function sendPreviewContent() {
  if (!elements.previewFrame.contentWindow || !privateCategoryDocument) return;
  elements.previewFrame.contentWindow.postMessage({
    type: "lowkeyfi-admin-preview",
    postCategories: privateCategoryDocument,
    posts: privatePosts.map(cleanDocument),
  }, window.location.origin);
}

async function updateJsonFile(repository, path, sha, value, message) {
  return github(repository, `/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: encodeBase64(`${JSON.stringify(value, null, 2)}\n`),
      sha,
      branch: repository.branch,
    }),
  });
}

async function toggleCategory(categoryId, nextVisibility) {
  const nextDocument = {
    ...privateCategoryDocument,
    categories: privateCategoryDocument.categories.map((category) => (
      category.id === categoryId
        ? { ...category, visibility: normalizeVisibility(nextVisibility) }
        : category
    )),
  };
  await updateJsonFile(
    PRIVATE_REPOSITORY,
    "content/post-categories.json",
    privateCategorySha,
    nextDocument,
    `Set ${categoryId} category ${nextVisibility}`,
  );
}

async function togglePost(path, nextVisibility) {
  const post = privatePosts.find((item) => item._path === path);
  if (!post) throw new Error("Post was not found in the private source.");
  const visibility = normalizeVisibility(nextVisibility);
  await updateJsonFile(
    PRIVATE_REPOSITORY,
    path,
    post._sha,
    { ...cleanDocument(post), visibility, published: visibility === "public" },
    `Set ${post.title} ${visibility}`,
  );
}

function referencedImagePaths(categories, posts) {
  const paths = new Set();
  const add = (value) => {
    if (typeof value === "string" && value.startsWith("/images/")) paths.add(value);
  };
  categories.forEach((category) => add(category.icon));
  posts.forEach((post) => {
    add(post.image);
    const markdownImages = post.body?.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)(?:\s+[^)]*)?\)/g) ?? [];
    for (const match of markdownImages) add(match[1]);
    const htmlImages = post.body?.matchAll(/<img[^>]+src=["'](\/images\/[^"']+)["']/gi) ?? [];
    for (const match of htmlImages) add(match[1]);
  });
  return [...paths];
}

async function createBlob(repository, content, encoding = "utf-8") {
  return github(repository, "/git/blobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, encoding }),
  });
}

async function syncPublicSnapshot() {
  const publicCategories = privateCategoryDocument.categories.filter(
    (category) => normalizeVisibility(category.visibility) === "public",
  );
  const publicCategoryIds = new Set(publicCategories.map((category) => category.id));
  const publicPosts = privatePosts.filter(
    (post) => normalizeVisibility(post.visibility) === "public" && publicCategoryIds.has(post.category),
  );

  const ref = await github(PUBLIC_REPOSITORY, `/git/ref/heads/${PUBLIC_REPOSITORY.branch}`);
  const parentCommit = await github(PUBLIC_REPOSITORY, `/git/commits/${ref.object.sha}`);
  const publicTree = await getRepositoryTree(PUBLIC_REPOSITORY);
  const publicTreeByPath = new Map(publicTree.map((item) => [item.path, item]));
  const privateTreeByPath = new Map(privateTree.map((item) => [item.path, item]));
  const treeEntries = [];

  async function addText(path, value) {
    const blob = await createBlob(PUBLIC_REPOSITORY, `${JSON.stringify(value, null, 2)}\n`);
    treeEntries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }

  await addText("src/content/post-categories.json", {
    ...privateCategoryDocument,
    categories: publicCategories,
  });

  const desiredPostPaths = new Set();
  for (const post of publicPosts) {
    const path = `src/content/posts/${post.category}/${post.slug}.json`;
    desiredPostPaths.add(path);
    await addText(path, { ...cleanDocument(post), visibility: "public", published: true });
  }

  for (const item of publicTree) {
    if (/^src\/content\/posts\/[^/]+\/[^/]+\.json$/.test(item.path) && !desiredPostPaths.has(item.path)) {
      treeEntries.push({ path: item.path, mode: "100644", type: "blob", sha: null });
    }
  }

  for (const imagePath of referencedImagePaths(publicCategories, publicPosts)) {
    const relativePath = imagePath.replace(/^\/images\//, "");
    const privatePath = `media/${relativePath}`;
    const publicPath = `public/images/${relativePath}`;
    const privateItem = privateTreeByPath.get(privatePath);
    if (!privateItem || publicTreeByPath.get(publicPath)?.sha === privateItem.sha) continue;
    const privateBlob = await github(PRIVATE_REPOSITORY, `/git/blobs/${privateItem.sha}`);
    const publicBlob = await createBlob(PUBLIC_REPOSITORY, privateBlob.content.replace(/\n/g, ""), "base64");
    treeEntries.push({ path: publicPath, mode: "100644", type: "blob", sha: publicBlob.sha });
  }

  const tree = await github(PUBLIC_REPOSITORY, "/git/trees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: treeEntries }),
  });
  if (tree.sha === parentCommit.tree.sha) return { changed: false, publicPosts: publicPosts.length };

  const commit = await github(PUBLIC_REPOSITORY, "/git/commits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Sync public content from private LowKeyFI dashboard",
      tree: tree.sha,
      parents: [ref.object.sha],
    }),
  });
  await github(PUBLIC_REPOSITORY, `/git/refs/heads/${PUBLIC_REPOSITORY.branch}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return { changed: true, publicPosts: publicPosts.length, commit: commit.sha };
}

async function refreshDeploymentState() {
  try {
    const runs = await github(PUBLIC_REPOSITORY, `/actions/runs?branch=${PUBLIC_REPOSITORY.branch}&per_page=1`);
    const run = runs.workflow_runs?.[0];
    elements.deploymentState.textContent = run
      ? run.status === "completed" ? (run.conclusion ?? "completed") : run.status
      : "No runs";
  } catch {
    elements.deploymentState.textContent = "Unavailable";
  }
}

async function synchronize({ message = "Synchronizing public website…" } = {}) {
  if (busy) return;
  setBusy(true);
  setStatus(elements.editorStatus, message);
  try {
    const result = await syncPublicSnapshot();
    setStatus(
      elements.editorStatus,
      result.changed
        ? `Public snapshot updated with ${result.publicPosts} posts. GitHub Pages is rebuilding.`
        : `Public snapshot is already current with ${result.publicPosts} posts.`,
      "success",
    );
    await refreshDeploymentState();
  } catch (error) {
    setStatus(elements.editorStatus, error.message, "error");
    throw error;
  } finally {
    setBusy(false);
  }
}

async function handleVisibilityChange(target) {
  if (busy) return;
  setBusy(true);
  setStatus(elements.editorStatus, "Updating private source…");
  try {
    if (target.dataset.visibilityAction === "category") {
      await toggleCategory(target.dataset.id, target.dataset.next);
    } else {
      await togglePost(target.dataset.path, target.dataset.next);
    }
    await loadPrivateContent();
    setBusy(false);
    await synchronize({ message: "Private source updated. Synchronizing public snapshot…" });
  } catch (error) {
    setStatus(elements.editorStatus, error.message, "error");
    setBusy(false);
  }
}

async function connect() {
  const enteredToken = elements.tokenInput.value.trim() || token;
  if (!enteredToken) {
    setStatus(elements.loginStatus, "Enter a GitHub token first.", "error");
    return;
  }
  token = enteredToken;
  setBusy(true);
  setStatus(elements.loginStatus, "Checking both repositories…");
  try {
    const [user, privateRepo, publicRepo] = await Promise.all([
      request("https://api.github.com/user"),
      github(PRIVATE_REPOSITORY, ""),
      github(PUBLIC_REPOSITORY, ""),
    ]);
    if (!privateRepo.permissions?.push || !publicRepo.permissions?.push) {
      throw new Error("This token needs write access to both the private content and public website repositories.");
    }
    sessionStorage.setItem(TOKEN_KEY, token);
    elements.tokenInput.value = "";
    elements.loginPanel.hidden = true;
    elements.editorPanel.hidden = false;
    elements.signedInLabel.textContent = `SIGNED IN: ${user.login}`;
    await loadPrivateContent({ preserveSelection: false });
    await refreshDeploymentState();
    setStatus(elements.editorStatus, "Private source loaded. Nothing is published until the public snapshot is synchronized.", "success");
  } catch (error) {
    token = "";
    sessionStorage.removeItem(TOKEN_KEY);
    setStatus(elements.loginStatus, error.message, "error");
  } finally {
    setBusy(false);
  }
}

function disconnect() {
  saveDraft({ immediate: true });
  token = "";
  currentPath = "";
  currentSha = "";
  currentDocument = null;
  privatePosts = [];
  privateCategoryDocument = null;
  sessionStorage.removeItem(TOKEN_KEY);
  elements.editorPanel.hidden = true;
  elements.loginPanel.hidden = false;
  setStatus(elements.loginStatus, "Signed out. Browser drafts remain on this device.", "success");
}

async function publish() {
  if (!currentPath || !currentDocument || busy) return;
  const nextDocument = valuesFromForm();
  if (!nextDocument.body.trim()) {
    setStatus(elements.editorStatus, "Content cannot be empty.", "error");
    return;
  }
  setBusy(true);
  setStatus(elements.editorStatus, "Saving to the private source…");
  try {
    await updateJsonFile(
      PRIVATE_REPOSITORY,
      currentPath,
      currentSha,
      nextDocument,
      `Update ${nextDocument.title} via LowKeyFI admin`,
    );
    localStorage.removeItem(draftKey());
    await loadPrivateContent();
    setBusy(false);
    await synchronize({ message: "Private source saved. Synchronizing public snapshot…" });
    elements.saveState.textContent = "Private source and public snapshot synchronized";
  } catch (error) {
    setStatus(elements.editorStatus, error.message, "error");
    setBusy(false);
  }
}

function replaceSelection(before, after = before, placeholder = "text") {
  const editor = elements.bodyInput;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || placeholder;
  editor.setRangeText(`${before}${selected}${after}`, start, end, "end");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.focus();
}

function prefixLines(prefix) {
  const editor = elements.bodyInput;
  const start = editor.value.lastIndexOf("\n", Math.max(0, editor.selectionStart - 1)) + 1;
  const followingBreak = editor.value.indexOf("\n", editor.selectionEnd);
  const end = followingBreak === -1 ? editor.value.length : followingBreak;
  const lines = editor.value.slice(start, end).split("\n");
  const replacement = lines.map((line, index) => `${typeof prefix === "function" ? prefix(index) : prefix}${line}`).join("\n");
  editor.setRangeText(replacement, start, end, "select");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.focus();
}

function format(action) {
  if (action === "bold") replaceSelection("**", "**", "bold text");
  else if (action === "italic") replaceSelection("*", "*", "italic text");
  else if (action === "code") replaceSelection("`", "`", "code");
  else if (action === "h2") prefixLines("## ");
  else if (action === "h3") prefixLines("### ");
  else if (action === "bullet") prefixLines("- ");
  else if (action === "number") prefixLines((index) => `${index + 1}. `);
  else if (action === "quote") prefixLines("> ");
  else if (action === "link") {
    const url = window.prompt("Link URL (website URL or /posts/category/post-name)", "https://");
    if (url) replaceSelection("[", `](${url.trim()})`, "link text");
  }
}

function handleEditorShortcut(event) {
  const modifier = event.ctrlKey || event.metaKey;
  if (!modifier) return;
  const key = event.key.toLowerCase();
  let action = "";
  if (key === "k") action = "link";
  else if (key === "b") action = "bold";
  else if (key === "i") action = "italic";
  else if (event.altKey && key === "2") action = "h2";
  else if (event.altKey && key === "3") action = "h3";
  else if (event.shiftKey && key === "8") action = "bullet";
  else if (event.shiftKey && key === "7") action = "number";
  else if (key === "s") {
    event.preventDefault();
    if (event.shiftKey) publish();
    else saveDraft({ immediate: true });
    return;
  }
  if (action) {
    event.preventDefault();
    format(action);
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

elements.connectButton.addEventListener("click", connect);
elements.tokenInput.addEventListener("keydown", (event) => { if (event.key === "Enter") connect(); });
elements.disconnectButton.addEventListener("click", disconnect);
elements.refreshButton.addEventListener("click", async () => {
  if (busy) return;
  setBusy(true);
  try {
    await loadPrivateContent();
    await refreshDeploymentState();
    setStatus(elements.editorStatus, "Private source refreshed.", "success");
  } catch (error) {
    setStatus(elements.editorStatus, error.message, "error");
  } finally {
    setBusy(false);
  }
});
elements.syncButton.addEventListener("click", () => synchronize());
elements.documentSelect.addEventListener("change", (event) => loadDocument(event.target.value));
elements.publishButton.addEventListener("click", publish);
elements.discardButton.addEventListener("click", () => {
  if (!currentPath || !window.confirm("Discard this browser draft and reload the private GitHub version?")) return;
  localStorage.removeItem(draftKey());
  populateForm(currentDocument);
  elements.saveState.textContent = "Local draft discarded";
});
elements.categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-visibility-action]");
  if (button) handleVisibilityChange(button);
});
elements.postList.addEventListener("click", (event) => {
  const visibilityButton = event.target.closest("[data-visibility-action]");
  if (visibilityButton) {
    handleVisibilityChange(visibilityButton);
    return;
  }
  const editButton = event.target.closest("[data-edit-path]");
  if (editButton) {
    loadDocument(editButton.dataset.editPath);
    elements.editorDrawer.open = true;
    elements.editorDrawer.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
document.querySelector(".toolbar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button) format(button.dataset.action);
});
elements.editorPanel.addEventListener("input", () => saveDraft());
elements.editorPanel.addEventListener("change", () => saveDraft());
elements.bodyInput.addEventListener("keydown", handleEditorShortcut);
elements.previewFrame.addEventListener("load", sendPreviewContent);
window.addEventListener("beforeunload", () => saveDraft({ immediate: true }));

if (token) connect();
