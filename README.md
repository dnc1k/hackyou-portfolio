# HackYoU Portfolio — Static / GitHub Pages

This version does not use Flask, SQLite or an admin panel. It is designed for GitHub Pages.

## The one file you usually edit

`data/portfolio.json` contains profile text, experience, skills, certificates, gallery, projects, contacts and CTF platforms.

Images live in `assets/uploads/`. Add a file there, then reference it in JSON, for example:

```json
{ "title": "New photo", "image": "assets/uploads/new-photo.jpg" }
```

Certificates are shown 2 per slide. Gallery photos are shown 6 per slide. Both support swipe and full-screen image preview.

## Preview locally

Do not double-click index.html because browsers may block JSON loading. From this folder run:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000`.

## Publish / update GitHub Pages

```bash
git add .
git commit -m "update portfolio"
git push
```

In GitHub: Repository → Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/ (root)` → Save.

After that every push to `main` updates the public site automatically.
