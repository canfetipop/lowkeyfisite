# LowKeyFI private-content admin guide

LowKeyFI uses two GitHub repositories and does not require a database or paid
backend.

- `emaeveky/lowkeyfi-content` is private and is the source of truth for every
  post, category, draft, and post image.
- `canfetipop/lowkeyfisite` is public and contains only the snapshot that the
  admin dashboard has synchronized as public.

## One-time setup

1. Sign in to GitHub as `canfetipop` and accept the collaborator invitation for
   `emaeveky/lowkeyfi-content` if you plan to use that account in PagesCMS.
2. Open [PagesCMS](https://app.pagescms.org), authorize its GitHub App for the
   private `emaeveky/lowkeyfi-content` repository, and select its `main` branch.
3. Create a GitHub personal access token for the admin dashboard. It must be
   able to read/write the private content repository and push to the public
   website repository. A classic token from an account that can access both
   repositories is the most compatible option for this cross-owner setup.
4. Open `/lowkeyfisite/admin/`, enter the token, and use **Sync public site**.

The dashboard keeps the token only in `sessionStorage`. Closing the tab signs
the dashboard out. The token is never committed to either repository.

## Visibility rules

- A public post is deployed only when its category is also public.
- Making a category private removes that category and every post inside it from
  the next public snapshot.
- Making a post private removes its JSON from the current public source tree.
- Private posts are fetched only after the dashboard authenticates with GitHub.
- The public build fails if a private category or post is accidentally present
  under `src/content`.

The private repository keeps all versions. The public repository intentionally
keeps only currently publishable JSON files.

## Editing workflow

Use PagesCMS on `emaeveky/lowkeyfi-content` for full rich-text and media editing.
Its configuration provides `Public` and `Private` visibility choices for both
categories and posts.

Use the authenticated dashboard for:

- Exact public-site preview with public/private badges
- Category and post visibility toggles
- Focused post editing and keyboard shortcuts
- Synchronizing the sanitized public snapshot
- Viewing current GitHub Pages deployment status

Saving in private PagesCMS does not publish automatically. This is deliberate:
open the dashboard afterward, review the combined preview, and click
**Sync public site**.

## Historical limitation

Posts previously committed to the public repository may remain recoverable in
its Git history even after removal. Do not treat those old versions as secret.
Future private drafts remain only in the private repository.

Rewriting the public repository's history is a separate destructive operation
and should be done only after creating a backup and confirming that old public
links and integrations can tolerate the rewrite.

## Future custom domain

When `lowkey-fi.com` is ready, configure it under the public repository's
**Settings > Pages** and set `LOWKEYFI_CUSTOM_DOMAIN: "true"` for the build step
in `.github/workflows/deploy-pages.yml`.
