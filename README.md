# Lush View Bar — Inventory & POS (`iwani1/Inventory-`)

Deployable PHP 8.1+ / SQLite Point-of-Sale and Inventory Management application for **Lush View Bar**.

- **Quick Start:** See **[`START-HERE.md`](START-HERE.md)**
- **Fedora / Local Run Guide:** See **[`RESET-AND-RUN.md`](RESET-AND-RUN.md)** or run `./reset-and-run-fedora.sh`
- **Audit & Repair Report:** See **[`extracted/AUDIT-lushview-bar.md`](extracted/AUDIT-lushview-bar.md)**
- **Branch & PR Report:** See **[`BRANCH-REPORT.md`](BRANCH-REPORT.md)**

---

## Artifacts in This Repository

| File / Path | What it is | Status |
|---|---|---|
| **`lushview-bar-fixed.zip`** | **Repaired, ready-to-deploy cPanel build** (`README.txt` + `public_html/`) with all 12 PHP endpoints, fixed sidebar/hamburger CSS & JS, rebuilt `tailwind.css`, bar-specific installer seeds, `favicon.svg`, and cocktail-glass logo. (`SHA-256: a3f5d64772cbf3e1bdfb44d7181297f2118730bcbe3aee8e3b618a170bce35cc`) | **Current build (Deploy this)** |
| `extracted/lushview-bar/` | Unpacked working tree corresponding byte-for-byte to `lushview-bar-fixed.zip`. | **Current source tree** |
| `lushview-bar.zip` | Original uploaded archive (5 PHP endpoints had stripped `$` sigils). | Broken original (kept for history) |
| `invenza-app php test1.zip` | Earlier Invenza-branded PHP build (10 endpoints; no Users or Reports API). | Superseded |
| `invenza-app.zip` | Earlier static HTML/CSS/JS prototype. | Superseded |
| `invenzatailwindcss-10.zip` | Tailwind v3 source kit + documentation. | Reference |
