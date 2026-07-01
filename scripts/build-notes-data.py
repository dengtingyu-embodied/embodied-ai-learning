from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTES_DIR = ROOT / "notes"
OUT_FILE = ROOT / "note" / "data" / "notes.json"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[\\/:*?\"<>|]+", "", value)
    value = re.sub(r"\s+", "-", value)
    return value or "paper-note"


def split_tags(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [tag.strip() for tag in re.split(r"[,，;；]", str(value or "")) if tag.strip()]


def parse_frontmatter(text: str):
    match = re.match(r"^---\s*\n([\s\S]*?)\n---\s*\n?", text)
    if not match:
        return {}, text

    meta = {}
    for line in match.group(1).splitlines():
        pair = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$", line)
        if not pair:
            continue
        value = pair.group(2).strip()
        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        meta[pair.group(1).strip()] = value
    return meta, text[match.end() :]


def parse_note(path: Path):
    text = path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)
    first_title = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    rel = path.relative_to(ROOT).as_posix()
    title = meta.get("title") or (first_title.group(1).strip() if first_title else path.stem.replace("-", " "))
    stat = path.stat()
    updated = datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()

    return {
        "id": meta.get("id") or f"repo:{slugify(path.stem)}",
        "title": title.strip() or "未命名论文",
        "authors": meta.get("authors") or meta.get("author") or "",
        "year": meta.get("year") or "",
        "venue": meta.get("venue") or "",
        "tags": split_tags(meta.get("tags") or ""),
        "status": meta.get("status") or "待读",
        "pdf": meta.get("pdf") or "",
        "summary": meta.get("summary") or "",
        "content": body.strip(),
        "createdAt": updated,
        "updatedAt": updated,
        "sourcePath": rel,
    }


def main():
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    notes = []
    if NOTES_DIR.exists():
        for path in sorted(NOTES_DIR.glob("*.md")):
            if path.name.lower() in {"readme.md", "template.md", "notes-template.md"}:
                continue
            notes.append(parse_note(path))

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "notes": notes,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(notes)} notes to {OUT_FILE}")


if __name__ == "__main__":
    main()
