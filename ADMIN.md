# LowKeyFI admin guide

LowKeyFI uses GitHub as its content store. It does not require a database.

## One-time setup

1. Merge the `codex/admin-cms` branch into `main`.
2. In the repository settings, open **Pages** and select **GitHub Actions** as the source.
3. Visit [Pages CMS](https://app.pagescms.org), sign in with the GitHub account that owns the repository, and install/authorize the Pages CMS GitHub App for `lowkeyfisite`.
4. Select the `canfetipop/lowkeyfisite` repository and the `main` branch.

The site's `/admin/` page includes a focused post/resource writing editor and a
shortcut to PagesCMS for full-site configuration.

## Writing editor

The writing editor saves drafts to the current browser automatically. Browser
drafts do not create Git commits or deployments. Use **Publish to GitHub** when
the draft is ready; publishing creates one commit and starts the Pages workflow.

The editor asks for a fine-grained GitHub access token with Contents read/write
permission for only `canfetipop/lowkeyfisite`. It stores that token in
`sessionStorage`, so closing the browser tab signs the editor out. The token is
never included in the website source or committed to the repository.

Useful shortcuts:

- `Ctrl+K`: add a link
- `Ctrl+B`: bold
- `Ctrl+I`: italic
- `Ctrl+Alt+2` / `Ctrl+Alt+3`: heading
- `Ctrl+S`: save the browser draft immediately
- `Ctrl+Shift+S`: publish to GitHub

PagesCMS remains the editor for site colors, navigation, images, and other page
settings.

## What is editable

- Site window title, status text, update date, colors, and corner style
- Homepage heading, introduction, image, and current status
- About page image and paragraphs
- Post, Lab, and Resource category text and icons
- Contact links and the support card
- Posts, including cover images, publish state, date, category, excerpt, and body

## Publishing

Saving in Pages CMS commits the edited content to GitHub. A commit to `main`
starts the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.
The site normally updates after the workflow finishes.

Uploaded images are stored in `public/images/uploads` and remain part of the
repository and its Git history.

## Future custom domain

Do not change the deployment until `lowkey-fi.com` has been purchased. When the
domain is ready, configure it under the repository's **Settings > Pages**, add
the DNS records GitHub provides, and set `LOWKEYFI_CUSTOM_DOMAIN: "true"` for
the build step in `.github/workflows/deploy-pages.yml`. This switches Vite from
`/lowkeyfisite/` asset paths to root-domain paths without changing content URLs.

This repository deploys with GitHub Actions, so a committed `CNAME` file is not
required; GitHub's Pages settings are the source of truth for the domain.
