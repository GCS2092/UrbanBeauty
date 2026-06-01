#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_encoding.py
Corrige les fichiers dont le contenu UTF-8 a ete re-encode en Latin-1 (double encoding).
Symptomes typiques : e-accent devient 2 chars, copyright corrompu, etc.

Usage :
    python fix_encoding.py --dry-run --dir ./frontend
    python fix_encoding.py --dir ./frontend
    python fix_encoding.py --dir ./backend
"""

import argparse
import os
import sys
from pathlib import Path

DEFAULT_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx",
    ".html", ".htm",
    ".css", ".scss", ".sass",
    ".json", ".jsonc",
    ".md", ".mdx",
    ".vue", ".svelte",
    ".txt", ".env",
}

IGNORED_DIRS = {
    "node_modules", ".git", ".svn", "dist", "build",
    ".next", ".nuxt", ".output", "coverage", ".cache",
    "__pycache__", ".venv", "venv",
}

# Sequences binaires caracteristiques d'un UTF-8 relu comme Latin-1
# On travaille directement sur les bytes pour eviter tout probleme d'encodage du script lui-meme
DOUBLE_ENCODED_MARKERS = [
    b"\xc3\xa9",   # e accent aigu
    b"\xc3\xa0",   # a accent grave
    b"\xc3\xb4",   # o accent circonflexe
    b"\xc3\xbb",   # u accent circonflexe
    b"\xc3\xa8",   # e accent grave
    b"\xc3\xaa",   # e accent circonflexe
    b"\xc3\xaf",   # i trema
    b"\xc3\xb9",   # u accent grave
    b"\xc3\xa7",   # c cedille
    b"\xc3\x89",   # E accent aigu majuscule
    b"\xc2\xa9",   # copyright
    b"\xc2\xae",   # registered
    b"\xc2\xb0",   # degre
    b"\xe2\x80\x99",  # apostrophe typographique
    b"\xe2\x80\x93",  # tiret demi-cadratin
    b"\xe2\x80\x94",  # tiret cadratin
    b"\xe2\x80\x9c",  # guillemet ouvrant
    b"\xe2\x80\x9d",  # guillemet fermant
]


def is_double_encoded(raw_bytes):
    """Verifie si les bytes contiennent des sequences typiques de double encodage."""
    for marker in DOUBLE_ENCODED_MARKERS:
        # Re-encode le marker comme s'il avait ete lu en Latin-1 puis stocke
        try:
            corrupted = marker.decode("utf-8").encode("latin-1")
            if corrupted in raw_bytes:
                return True
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass
    return False


def fix_double_encoding(raw_bytes):
    """
    Corrige le double encodage.
    Strategie : decoder en Latin-1, puis re-decoder le resultat comme UTF-8.
    """
    try:
        # Lire comme Latin-1 (ne peut pas echouer, tous les bytes sont valides)
        text_latin = raw_bytes.decode("latin-1")
        # Re-encoder en bytes bruts
        raw_again = text_latin.encode("latin-1")
        # Decoder comme vrai UTF-8
        fixed_text = raw_again.decode("utf-8")
        return fixed_text.encode("utf-8"), True
    except (UnicodeDecodeError, UnicodeEncodeError):
        return raw_bytes, False


def process_file(file_path, dry_run):
    """Traite un fichier. Retourne : 'fixed', 'ok', 'error'."""
    try:
        raw = file_path.read_bytes()

        if not is_double_encoded(raw):
            return "ok"

        fixed_bytes, was_fixed = fix_double_encoding(raw)

        if was_fixed:
            if not dry_run:
                file_path.write_bytes(fixed_bytes)
            return "fixed"
        return "ok"

    except Exception:
        return "error"


def scan_directory(root, extensions, dry_run):
    stats = {"fixed": 0, "ok": 0, "skip": 0, "error": 0}
    fixed_files = []

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]

        for filename in filenames:
            file_path = Path(dirpath) / filename

            if file_path.suffix.lower() not in extensions:
                stats["skip"] += 1
                continue

            result = process_file(file_path, dry_run)
            stats[result] += 1

            if result == "fixed":
                rel = file_path.relative_to(root)
                fixed_files.append(str(rel))
                prefix = "[DRY-RUN] " if dry_run else "[CORRIGE] "
                print(f"  {prefix}{rel}")
            elif result == "error":
                print(f"  [ERREUR]  {file_path.relative_to(root)}")

    return stats, fixed_files


def main():
    parser = argparse.ArgumentParser(
        description="Corrige le double encodage UTF-8/Latin-1 dans les fichiers sources."
    )
    parser.add_argument("--dir", default=".", metavar="DOSSIER",
                        help="Dossier racine a analyser (defaut : repertoire courant)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Affiche les fichiers concernes sans rien modifier")
    parser.add_argument("--extensions", nargs="+", metavar="EXT",
                        help="Extensions a traiter (ex: .js .jsx .html)")
    args = parser.parse_args()

    root = Path(args.dir).resolve()
    if not root.exists():
        print(f"Erreur : le dossier '{root}' n'existe pas.", file=sys.stderr)
        sys.exit(1)

    extensions = set(args.extensions) if args.extensions else DEFAULT_EXTENSIONS
    mode = "APERCU SEULEMENT (--dry-run)" if args.dry_run else "CORRECTION ACTIVE"

    print(f"\n{'='*55}")
    print(f"  fix_encoding.py  |  {mode}")
    print(f"  Dossier : {root}")
    print(f"{'='*55}\n")

    stats, fixed_files = scan_directory(root, extensions, args.dry_run)

    print(f"\n{'─'*55}")
    print(f"  Fichiers a corriger  : {stats['fixed']}")
    print(f"  Fichiers OK          : {stats['ok']}")
    print(f"  Ignores (extension)  : {stats['skip']}")
    if stats['error']:
        print(f"  Erreurs              : {stats['error']}")
    print(f"{'─'*55}")

    if stats["fixed"] == 0:
        print("\n  Aucun fichier avec double encodage detecte.")
    elif args.dry_run:
        print(f"\n  -> Relancez SANS --dry-run pour corriger ces {stats['fixed']} fichier(s).")
    else:
        print(f"\n  -> {stats['fixed']} fichier(s) corrige(s) avec succes.")


if __name__ == "__main__":
    main()