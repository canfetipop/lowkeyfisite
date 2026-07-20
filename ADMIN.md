# LowKeyFI admin guide

LowKeyFI uses GitHub as its content store. It does not require a database.

## One-time setup

1. Merge the `codex/admin-cms` branch into `main`.
2. In the repository settings, open **Pages** and select **GitHub Actions** as the source.
3. Visit [Pages CMS](https://app.pagescms.org), sign in with the GitHub account that owns the repository, and install/authorize the Pages CMS GitHub App for `lowkeyfisite`.
4. Select the `canfetipop/lowkeyfisite` repository and the `main` branch.

The site's `/admin/` page provides a shortcut to the editor.

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
