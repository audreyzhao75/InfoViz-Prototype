import type { CompareSummary, EvidenceImage, EvidenceView, ImageSetComparison, SelectedHeatmapCell } from '../types/data';

function imageNameSet(images: EvidenceImage[]): Set<string> {
  return new Set(images.map((image) => image.imageName));
}

export function compareImageSets(aImages: EvidenceImage[], bImages: EvidenceImage[]): ImageSetComparison {
  const bNames = imageNameSet(bImages);
  const aNames = imageNameSet(aImages);

  return {
    overlap: aImages.filter((image) => bNames.has(image.imageName)),
    uniqueA: aImages.filter((image) => !bNames.has(image.imageName)),
    uniqueB: bImages.filter((image) => !aNames.has(image.imageName)),
  };
}

function difference(aValue: number | null, bValue: number | null): number | null {
  if (aValue === null || bValue === null) {
    return null;
  }

  return aValue - bValue;
}

export function buildCompareSummary(
  aCell: SelectedHeatmapCell,
  aEvidence: EvidenceView | null,
  bCell: SelectedHeatmapCell,
  bEvidence: EvidenceView | null,
): CompareSummary | null {
  if (!aEvidence || !bEvidence) {
    return null;
  }

  return {
    top: compareImageSets(aEvidence.topImages, bEvidence.topImages),
    bottom: compareImageSets(aEvidence.bottomImages, bEvidence.bottomImages),
    aggregateScoreDifference: difference(aCell.score, bCell.score),
    imageMeanDifference: aEvidence.stats.mean - bEvidence.stats.mean,
  };
}
