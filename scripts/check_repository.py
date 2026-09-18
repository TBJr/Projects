"""Check first-party syntax and local links in project entry pages.

Copyright (c) 2026 Thomas Brown. Licensed under the MIT license.
"""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
import os
from pathlib import Path
import subprocess
from urllib.parse import unquote, urlsplit


class LocalLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.links.append(value)


def source_files(root: Path) -> tuple[list[Path], list[Path], list[Path]]:
    scripts: list[Path] = []
    php_files: list[Path] = []
    entry_pages: list[Path] = []
    for directory, folders, files in os.walk(root):
        here = Path(directory)
        folders[:] = sorted(
            name for name in folders
            if name not in {".git", "_site", "node_modules", "fontawesome-5.15.4-web"}
        )
        for name in sorted(files):
            path = here / name
            if name.endswith(".js"):
                scripts.append(path)
            elif name.endswith(".php"):
                php_files.append(path)
            elif name == "index.html":
                entry_pages.append(path)
    return scripts, php_files, entry_pages


def local_link_errors(root: Path, page: Path) -> list[str]:
    parser = LocalLinks()
    parser.feed(page.read_text(encoding="utf-8"))
    errors = []
    for link in parser.links:
        parts = urlsplit(link)
        if parts.scheme or parts.netloc or not parts.path:
            continue
        target = root / unquote(parts.path).lstrip("/") if parts.path.startswith("/") else page.parent / unquote(parts.path)
        if not target.exists():
            errors.append(f"{page.relative_to(root)}: missing {link}")
    return errors


def check_command(command: list[str], root: Path) -> str | None:
    result = subprocess.run(command, capture_output=True, text=True, cwd=root, check=False)
    if result.returncode:
        return (result.stderr or result.stdout).strip()
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    scripts, php_files, pages = source_files(root)

    errors = []
    for path in scripts:
        problem = check_command(["node", "--check", str(path)], root)
        if problem:
            errors.append(f"{path.relative_to(root)}: {problem}")
    for path in php_files:
        problem = check_command(["php", "-l", str(path)], root)
        if problem:
            errors.append(f"{path.relative_to(root)}: {problem}")
    for path in pages:
        errors.extend(local_link_errors(root, path))

    if errors:
        print("\n".join(errors))
        return 1
    print(f"Checked {len(scripts)} JavaScript files, {len(php_files)} PHP files, and {len(pages)} entry pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
