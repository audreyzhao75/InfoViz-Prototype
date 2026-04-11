# Cortex Visualization Prototype

This repository contains the current React/Vite prototype for comparing brain-region alignment scores across computer vision models and then drilling into image-level evidence for selected ROI x model pairs.

## What The App Does

- Shows an aggregate heatmap of ROI x model scores.
- Lets users search and sort models.
- Opens a details panel for a selected cell.
- Ranks images by the matching ROI/model evidence column from the CSV.
- Supports compare mode for two evidence-backed cells.
- Includes a separate user study tab with an embedded form.

## Data In This Repo

The app loads data from `public/data/`:

- `murty185_zero_index.json`
  - aggregate ROI x model score matrix
- `combined_image_means.csv`
  - image-level evidence table used to rank stimuli for selected cells

The app also serves image assets from `public/images/`.

## Current Evidence Coverage

The evidence pipeline is real, but partial.

- Aggregate score matrix coverage: `127` models across `ppa`, `ffa`, `eba`, and `Overall`
- Image-level evidence coverage: `26` models across `ppa`, `ffa`, and `eba`
- Image rows: `185`

This means the heatmap can show more models than the evidence panel can explain. In compare mode, the UI intentionally restricts selection to cells that have matching CSV evidence.

## Tech Stack

- React
- TypeScript
- Vite
- D3 utilities for loading and processing data

## Project Structure

- `src/App.tsx`
  - top-level app state and data loading
- `src/components/`
  - heatmap, controls, details panel, compare drawer, and user study UI
- `src/utils/data.ts`
  - CSV/JSON loading and model/ROI parsing
- `src/utils/evidence.ts`
  - image ranking and evidence summaries
- `src/utils/compare.ts`
  - overlap and comparison summaries
- `public/data/`
  - score matrix and image-level evidence CSV
- `public/images/`
  - evidence image assets

## Local Development

Install dependencies:

=======
# Welcome to our Information Visualization prototype. 
In this repo, we explore a novel visualization to showcase how LLM models correlate in determining image accuracy against regions of interest of the brain (ROIs).

## To clone this repo:
```bash
git clone https://github.com/audreyzhao75/InfoViz-Prototype.git
cd InfoViz-Prototype
```

## To install the dependecies:
>>>>>>> c13d2c921981ab8a411a02d2023a3bd8c1d1a73d
```bash
npm install
```

<<<<<<< HEAD
Start the dev server:

=======
## To run the prototype:
>>>>>>> c13d2c921981ab8a411a02d2023a3bd8c1d1a73d
```bash
npm run dev
```

<<<<<<< HEAD
Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Cleanup Notes

This repo previously tracked generated artifacts and dependency folders. The `.gitignore` now excludes:

- `node_modules/`
- `dist/`
- `.DS_Store`
- TypeScript build info files

If you want the Git history to stop tracking those files, remove them from the index in a cleanup commit.
=======
And then follow the link in the console to open a localhost (example: http://localhost:5173/)
>>>>>>> c13d2c921981ab8a411a02d2023a3bd8c1d1a73d
