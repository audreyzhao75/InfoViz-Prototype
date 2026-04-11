import type { AggregateHeatmapCell, JsonScoreObject, ModelOrderMode, Roi } from '../types/data';

export const DEFAULT_HEATMAP_ROIS: Roi[] = ['ffa', 'ppa', 'eba'];

function getScore(scores: JsonScoreObject, roi: Roi, model: string): number | null {
  const value = scores[roi]?.[model];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function compareScoresDesc(aScore: number | null, bScore: number | null, aModel: string, bModel: string): number {
  if (aScore === null && bScore === null) {
    return aModel.localeCompare(bModel);
  }

  if (aScore === null) {
    return 1;
  }

  if (bScore === null) {
    return -1;
  }

  return bScore - aScore || aModel.localeCompare(bModel);
}

export function getDefaultHeatmapRois(scores: JsonScoreObject): Roi[] {
  const availableRois = new Set(Object.keys(scores));
  const defaults = DEFAULT_HEATMAP_ROIS.filter((roi) => availableRois.has(roi));

  if (defaults.length > 0) {
    return defaults;
  }

  return Object.keys(scores).filter((roi) => roi !== 'Overall');
}

export function inferAggregateModels(scores: JsonScoreObject, rois: Roi[]): string[] {
  const modelNames = new Set<string>();

  for (const roi of [...rois, 'Overall']) {
    for (const model of Object.keys(scores[roi] ?? {})) {
      modelNames.add(model);
    }
  }

  return Array.from(modelNames);
}

export function orderAggregateModels(
  models: string[],
  scores: JsonScoreObject,
  orderMode: ModelOrderMode,
  selectedRoi: Roi,
): string[] {
  const sortedModels = [...models];

  if (orderMode === 'alphabetical') {
    return sortedModels.sort((a, b) => a.localeCompare(b));
  }

  const scoreRoi = orderMode === 'selected-roi-desc' ? selectedRoi : 'Overall';

  return sortedModels.sort((a, b) => compareScoresDesc(getScore(scores, scoreRoi, a), getScore(scores, scoreRoi, b), a, b));
}

export function filterModelsBySearch(models: string[], searchTerm: string): string[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return models;
  }

  return models.filter((model) => model.toLowerCase().includes(normalizedSearch));
}

export function rankModelsWithinRoi(scores: JsonScoreObject, roi: Roi): Map<string, number> {
  const scoredModels = Object.entries(scores[roi] ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]))
    .sort(([aModel, aScore], [bModel, bScore]) => bScore - aScore || aModel.localeCompare(bModel));

  return new Map(scoredModels.map(([model], index) => [model, index + 1]));
}

export function buildAggregateHeatmapCells(
  scores: JsonScoreObject,
  rois: Roi[],
  models: string[],
): AggregateHeatmapCell[] {
  const rankMaps = new Map(rois.map((roi) => [roi, rankModelsWithinRoi(scores, roi)]));

  return rois.flatMap((roi) =>
    models.map((model) => {
      const score = getScore(scores, roi, model);

      return {
        id: `${roi}__${model}`,
        roi,
        model,
        score,
        rankWithinRoi: rankMaps.get(roi)?.get(model) ?? null,
        overallScore: getScore(scores, 'Overall', model),
      };
    }),
  );
}
