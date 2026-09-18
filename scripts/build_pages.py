"""Create a static GitHub Pages artifact without PHP or server configuration.

Copyright (c) 2026 Thomas Brown. Licensed under the MIT license.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import shutil


STATIC_SUFFIXES = {
    ".css", ".eot", ".gif", ".html", ".ico", ".jpeg", ".jpg",
    ".js", ".md", ".otf", ".png", ".svg", ".txt", ".ttf",
    ".webp", ".woff", ".woff2",
}
ROOT_FILES = {
    "index.html", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md",
    "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "SECURITY.md",
}
SKIP_DIRECTORIES = {"php", "database", "node_modules", "__pycache__"}


def copy_file(source: Path, root: Path, destination: Path) -> None:
    target = destination / source.relative_to(root)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    destination = args.destination.resolve()
    if destination.exists():
        parser.error(f"destination already exists: {destination}")
    destination.mkdir(parents=True)

    for name in ROOT_FILES:
        source = root / name
        if source.is_file():
            copy_file(source, root, destination)

    for folder_name in ("css", "docs", "LICENSES"):
        folder = root / folder_name
        if folder.is_dir():
            for source in folder.rglob("*"):
                if source.is_file() and not source.is_symlink():
                    copy_file(source, root, destination)

    projects = 0
    for project in sorted(root.iterdir()):
        if not project.is_dir() or project.name.startswith("."):
            continue
        if not (project / "index.html").is_file() and not (project / "index.php").is_file():
            continue
        projects += 1
        for source in project.rglob("*"):
            if not source.is_file() or source.is_symlink():
                continue
            relative = source.relative_to(project)
            if any(part.startswith(".") or part in SKIP_DIRECTORIES for part in relative.parts[:-1]):
                continue
            if source.suffix.lower() in STATIC_SUFFIXES:
                copy_file(source, root, destination)

    published = sum(path.is_file() for path in destination.rglob("*"))
    print(f"Prepared {published} static files from {projects} projects in {destination}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
