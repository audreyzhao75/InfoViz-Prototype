export type Roi = 'ffa' | 'ppa' | 'eba' | 'Overall' | (string & {});

export type WideCsvRow = {
  image_name: string;
} & Record<string, string | number | undefined>;

export type ModelRoiColumn = {
  columnName: string;
  model: string;
  roi: Roi;
};

export type LongFormDatum = {
  imageName: string;
  imageUrl: string;
  model: string;
  roi: Roi;
  value: number;
  columnName: string;
};

export type JsonScoreObject = Record<Roi, Record<string, number>>;

export type VisualizationData = {
  rows: WideCsvRow[];
  scores: JsonScoreObject;
  modelRoiColumns: ModelRoiColumn[];
};

export type RankingSystem = 'overall' | 'roi';
export type SortDirection = 'desc' | 'asc';

export type AggregateHeatmapCell = {
  id: string;
  roi: Roi;
  model: string;
  score: number | null;
  rankWithinRoi: number | null;
  overallScore: number | null;
};

export type SelectedHeatmapCell = AggregateHeatmapCell;

export type EvidenceImage = {
  imageName: string;
  imageUrl: string;
  value: number;
  rank: number;
};

export type EvidenceStats = {
  max: number;
  min: number;
  mean: number;
  median: number;
  standardDeviation: number;
};

export type EvidenceView = {
  columnName: string;
  images: EvidenceImage[];
  topImages: EvidenceImage[];
  bottomImages: EvidenceImage[];
  stats: EvidenceStats;
};

export type ImageSetComparison = {
  overlap: EvidenceImage[];
  uniqueA: EvidenceImage[];
  uniqueB: EvidenceImage[];
};

export type CompareSummary = {
  top: ImageSetComparison;
  bottom: ImageSetComparison;
  aggregateScoreDifference: number | null;
  imageMeanDifference: number | null;
};
