const OWNER = "canfetipop";
const REPO = "lowkeyfisite";
const BRANCH = "main";
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;
const TOKEN_KEY = "lowkeyfi-admin-token";
const DRAFT_PREFIX = "lowkeyfi-draft:";

const elements = Object.fromEntries([
  "loginPanel", "editorPanel", "tokenInput", "connectButton", "disconnectButton",
  "loginStatus", "documentSelect", "postFields", "titleInput", "slugInput",
  "dateInput", "excerptInput", "publishedInput", "featuredInput", "bodyInput",
  "saveState", "editorStatus", "discardButton", "publishButton",
].map((id) => [id, document.getElementById(id)]));

let token = sessionStorage.getItem(TOKEN_KEY) || "";
let currentPath = "";
let currentSha = "";
let currentDocument = null;
let draftTimer = null;

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `status-message${type ? ` ${type}` : ""}`;
}

async function github(path, options = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path.startsWith("http") ? path : `${API_ROOT}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub request failed (${response.status})`);
  return data;
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

function draftKey(path = currentPath) {
  return `${DRAFT_PREFIX}${OWNER}/${REPO}/${BRANCH}/${path}`;
}

function valuesFromForm() {
  const next = { ...currentDocument, body: elements.bodyInput.value };
  if (currentPath.includes("/posts/")) {
    Object.assign(next, {
      title: elements.titleInput.value.trim(),
      slug: elements.slugInput.value.trim(),
      date: elements.dateInput.value,
      excerpt: elements.excerptInput.value,
      published: elements.publishedInput.checked,
      featured: elements.featuredInput.checked,
    });
  }
  return next;
}

function populateForm(value) {
  const isPost = currentPath.includes("/posts/");
  elements.postFields.hidden = !isPost;
  elements.titleInput.value = value.title || "";
  elements.slugInput.value = value.slug || "";
  elements.dateInput.value = value.date || "";
  elements.excerptInput.value = value.excerpt || "";
  elements.publishedInput.checked = Boolean(value.published);
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
    elements.saveState.textContent = "No draft changes";
    return;
  }
  try {
    const draft = JSON.parse(raw);
    if (draft.sha !== currentSha) {
      elements.saveState.textContent = "An older draft was skipped because GitHub has a newer version";
      return;
    }
    populateForm(draft.value);
    elements.saveState.textContent = `Restored browser draft from ${new Date(draft.updatedAt).toLocaleString()}`;
  } catch {
    localStorage.removeItem(draftKey());
  }
}

function documentLabel(path) {
  if (path.endsWith("resources.json")) return "Resources page";
  const parts = path.split("/");
  const category = parts.at(-2);
  const filename = parts.at(-1).replace(/\.json$/, "");
  return `${category[0].toUpperCase()}${category.slice(1)} — ${filename}`;
}

async function loadDocuments() {
  const tree = await github(`/git/trees/${encodeURIComponent(BRANCH)}?recursive=1`);
  const paths = tree.tree
    .filter((item) => item.type === "blob" && (
      /^src\/content\/posts\/[^/]+\/[^/]+\.json$/.test(item.path)
      || item.path === "src/content/resources.json"
    ))
    .map((item) => item.path)
    .sort();
  elements.documentSelect.replaceChildren(...paths.map((path) => {
    const option = document.createElement("option");
    option.value = path;
    option.textContent = documentLabel(path);
    return option;
  }));
  if (!paths.length) throw new Error("No editable posts or resources were found.");
  await loadDocument(paths[0]);
}

async function loadDocument(path) {
  saveDraft({ immediate: true });
  setStatus(elements.editorStatus, "Loading from GitHub…");
  const file = await github(`/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(BRANCH)}`);
  currentPath = path;
  currentSha = file.sha;
  currentDocument = JSON.parse(decodeBase64(file.content));
  elements.documentSelect.value = path;
  populateForm(currentDocument);
  restoreDraft();
  setStatus(elements.editorStatus, `Editing ${path}`);
  elements.bodyInput.focus();
}

async function connect() {
  const enteredToken = elements.tokenInput.value.trim();
  if (!enteredToken) {
    setStatus(elements.loginStatus, "Enter a GitHub token first.", "error");
    return;
  }
  token = enteredToken;
  elements.connectButton.disabled = true;
  setStatus(elements.loginStatus, "Checking GitHub access…");
  try {
    const user = await github("https://api.github.com/user");
    sessionStorage.setItem(TOKEN_KEY, token);
    elements.tokenInput.value = "";
    elements.loginPanel.hidden = true;
    elements.editorPanel.hidden = false;
    await loadDocuments();
    setStatus(elements.editorStatus, `Connected as ${user.login}. Drafts autosave locally; publishing writes to GitHub.`, "success");
  } catch (error) {
    token = "";
    sessionStorage.removeItem(TOKEN_KEY);
    setStatus(elements.loginStatus, error.message, "error");
  } finally {
    elements.connectButton.disabled = false;
  }
}

function disconnect() {
  saveDraft({ immediate: true });
  token = "";
  currentPath = "";
  currentSha = "";
  currentDocument = null;
  sessionStorage.removeItem(TOKEN_KEY);
  elements.editorPanel.hidden = true;
  elements.loginPanel.hidden = false;
  setStatus(elements.loginStatus, "Disconnected. Your browser drafts are still available.", "success");
}

async function publish() {
  if (!currentPath || !currentDocument) return;
  const nextDocument = valuesFromForm();
  if (!nextDocument.body.trim()) {
    setStatus(elements.editorStatus, "Content cannot be empty.", "error");
    return;
  }
  elements.publishButton.disabled = true;
  setStatus(elements.editorStatus, "Publishing to GitHub…");
  try {
    const response = await github(`/contents/${encodeURIComponent(currentPath)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Update ${currentPath} (via LowKeyFI Writer)`,
        content: encodeBase64(`${JSON.stringify(nextDocument, null, 2)}\n`),
        sha: currentSha,
        branch: BRANCH,
      }),
    });
    currentDocument = nextDocument;
    currentSha = response.content.sha;
    localStorage.removeItem(draftKey());
    elements.saveState.textContent = "Published; no local draft changes";
    setStatus(elements.editorStatus, "Published successfully. GitHub Pages is rebuilding the website.", "success");
  } catch (error) {
    setStatus(elements.editorStatus, error.message, "error");
  } finally {
    elements.publishButton.disabled = false;
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

elements.connectButton.addEventListener("click", connect);
elements.tokenInput.addEventListener("keydown", (event) => { if (event.key === "Enter") connect(); });
elements.disconnectButton.addEventListener("click", disconnect);
elements.documentSelect.addEventListener("change", (event) => loadDocument(event.target.value).catch((error) => setStatus(elements.editorStatus, error.message, "error")));
elements.publishButton.addEventListener("click", publish);
elements.discardButton.addEventListener("click", () => {
  if (!currentPath || !window.confirm("Discard the browser draft and reload the published GitHub version?")) return;
  localStorage.removeItem(draftKey());
  populateForm(currentDocument);
  elements.saveState.textContent = "Local draft discarded";
});
document.querySelector(".toolbar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button) format(button.dataset.action);
});
elements.editorPanel.addEventListener("input", () => saveDraft());
elements.editorPanel.addEventListener("change", () => saveDraft());
elements.bodyInput.addEventListener("keydown", handleEditorShortcut);
window.addEventListener("beforeunload", () => saveDraft({ immediate: true }));

if (token) {
  elements.tokenInput.value = token;
  connect();
}
