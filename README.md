# kaalveniiz.github.io
blog

## Hugo quick start

1. Create a new post:
   `hugo new posts/my-new-post.md`
2. Run local preview:
   `hugo server -D`
3. Build static files:
   `hugo`

## Notes

- RSS is disabled in `config.toml`.
- First post is at `content/posts/hello-world.md`.

## Easy post tool

Use this helper to create a post without manually editing front matter:

```bash
./tools/new-post.sh "Your Post Title"
```

Or run without a title and it will ask:

```bash
./tools/new-post.sh
```

It will ask for tags, ask if it should be a draft, then let you paste your post text.
Press `Ctrl-D` to finish pasting.
After that, you can choose to add images by dragging files into Terminal.

### Image flow with the tool

1. Run `./tools/new-post.sh`
2. Paste your post text, then press `Ctrl-D`
3. Type `y` for "Add images now?"
4. Drag and drop photo files into Terminal and press Enter

The tool will:
- copy images into `static/images/`
- auto-insert Markdown like `![name](/images/file.jpg)` into your post

## Web helper editor

Open:

- `tools/editor.html`

Features:

- fill title/tags/draft/date
- default slug is current time (`DD-MM-YYYY HH:MM:SS`)
- paste post content
- drag/drop images
- generate/copy/download Markdown
- optional direct save into `content/posts/` and `static/images/` (Chrome/Edge on `https://` or `http://localhost`)
