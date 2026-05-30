# Minimal portfolio/blog (GitHub Pages)

This is a no-build, static site (HTML/CSS/JS).

## Write posts in Markdown

1. Add a Markdown file in `posts/`, e.g. `posts/my-post.md`
2. Add an entry in `posts/index.json`:

```json
{
  "id": "my-post",
  "title": "My Post",
  "summary": "One-liner summary.",
  "publishAt": "2026-06-01T09:00:00+05:30",
  "file": "my-post.md"
}
```

Only posts whose `publishAt` is in the past are listed.

## Preview a scheduled post

Open:

- `post.html?id=my-post&preview=1`

## Publish on GitHub Pages (simple)

1. Create a GitHub repo and push these files.
2. Repo → **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` (or `master`), folder: `/ (root)`

That’s it.
