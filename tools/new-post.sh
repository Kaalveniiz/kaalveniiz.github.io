#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POST_DIR="$ROOT_DIR/content/posts"
IMAGE_DIR="$ROOT_DIR/static/images"

mkdir -p "$POST_DIR"
mkdir -p "$IMAGE_DIR"

title="${1:-}"
if [[ -z "$title" ]]; then
  printf "Post title: "
  IFS= read -r title
fi

if [[ -z "$title" ]]; then
  echo "Error: title cannot be empty."
  exit 1
fi

slug="$(printf "%s" "$title" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"

if [[ -z "$slug" ]]; then
  slug="post"
fi

printf "Tags (comma separated, optional): "
IFS= read -r tags_raw

printf "Publish now? [Y/n]: "
IFS= read -r publish_raw
publish_raw="${publish_raw:-y}"

draft="false"
if [[ "$publish_raw" =~ ^[Nn]$ ]]; then
  draft="true"
fi

base_slug="$slug"
file_path="$POST_DIR/$slug.md"
i=2
while [[ -e "$file_path" ]]; do
  slug="${base_slug}-${i}"
  file_path="$POST_DIR/$slug.md"
  i=$((i + 1))
done

tags_toml=""
if [[ -n "$tags_raw" ]]; then
  IFS=',' read -r -a tags_array <<< "$tags_raw"
  clean_tags=()
  for t in "${tags_array[@]}"; do
    tt="$(printf "%s" "$t" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
    if [[ -n "$tt" ]]; then
      clean_tags+=("\"$tt\"")
    fi
  done

  if [[ ${#clean_tags[@]} -gt 0 ]]; then
    tags_toml="$(IFS=', '; printf '[%s]' "${clean_tags[*]}")"
  fi
fi

if [[ -z "$tags_toml" ]]; then
  tags_toml="[]"
fi

echo "Paste post content below. Press Ctrl-D when done."
tmp_body="$(mktemp)"
cat > "$tmp_body"

now="$(date +"%Y-%m-%dT%H:%M:%S%:z")"

cat > "$file_path" <<EOF
+++
title = "$title"
date = $now
slug = "$slug"
tags = $tags_toml
draft = $draft
+++

$(cat "$tmp_body")
EOF

rm -f "$tmp_body"

echo
echo "Add images now? [y/N]"
IFS= read -r add_images_raw

if [[ "$add_images_raw" =~ ^[Yy]$ ]]; then
  echo "Drag and drop image files here (space-separated), then press Enter:"
  IFS= read -r image_input

  if [[ -n "$image_input" ]]; then
    eval "set -- $image_input"
    {
      echo
      echo "## Images"
      echo
    } >> "$file_path"

    for src in "$@"; do
      if [[ ! -f "$src" ]]; then
        echo "Skipped (not found): $src"
        continue
      fi

      base="$(basename "$src")"
      name="${base%.*}"
      ext="${base##*.}"
      safe_name="$(printf "%s" "$name" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
      [[ -z "$safe_name" ]] && safe_name="image"
      safe_ext="$(printf "%s" "$ext" | tr '[:upper:]' '[:lower:]')"

      target="$IMAGE_DIR/${safe_name}.${safe_ext}"
      n=2
      while [[ -e "$target" ]]; do
        target="$IMAGE_DIR/${safe_name}-${n}.${safe_ext}"
        n=$((n + 1))
      done

      cp "$src" "$target"
      web_path="/images/$(basename "$target")"

      {
        echo "![${name}](${web_path})"
        echo
      } >> "$file_path"

      echo "Added image: $web_path"
    done
  fi
fi

echo
echo "Created: $file_path"
echo "Next:"
echo "  1) Preview: hugo server -D"
echo "  2) Commit + push when ready"
