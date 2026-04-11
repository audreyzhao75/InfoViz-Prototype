import { CompareDrawer } from './CompareDrawer';
import { ControlsBar } from './ControlsBar';
import { DetailsPanel } from './DetailsPanel';
import { Heatmap } from './Heatmap';
import { HelpBox } from './HelpBox';
import type { AggregateHeatmapCell, ModelOrderMode, ModelRoiColumn, Roi, SelectedHeatmapCell, WideCsvRow } from '../types/data';

type VisualizationViewProps = {
  rows: WideCsvRow[];
  modelRoiColumns: ModelRoiColumn[];
  heatmapRois: Roi[];
  heatmapCells: AggregateHeatmapCell[];
  visibleModels: string[];
  modelOrder: ModelOrderMode;
  selectedSortRoi: Roi;
  modelSearch: string;
  showScoreLabels: boolean;
  selectedCell: SelectedHeatmapCell | null;
  compareMode: boolean;
  compareCells: SelectedHeatmapCell[];
  comparableCellIds: Set<string>;
  onModelOrderChange: (modelOrder: ModelOrderMode) => void;
  onSelectedSortRoiChange: (roi: Roi) => void;
  onModelSearchChange: (searchTerm: string) => void;
  onShowScoreLabelsChange: (showScoreLabels: boolean) => void;
  onResetControls: () => void;
  onSelectCell: (cell: SelectedHeatmapCell) => void;
  onCompareModeChange: (enabled: boolean) => void;
};

export function VisualizationView({
  rows,
  modelRoiColumns,
  heatmapRois,
  heatmapCells,
  visibleModels,
  modelOrder,
  selectedSortRoi,
  modelSearch,
  showScoreLabels,
  selectedCell,
  compareMode,
  compareCells,
  comparableCellIds,
  onModelOrderChange,
  onSelectedSortRoiChange,
  onModelSearchChange,
  onShowScoreLabelsChange,
  onResetControls,
  onSelectCell,
  onCompareModeChange,
}: VisualizationViewProps) {
  return (
    <>
      <HelpBox />
      <ControlsBar
        rois={heatmapRois}
        modelOrder={modelOrder}
        selectedSortRoi={selectedSortRoi}
        modelSearch={modelSearch}
        showScoreLabels={showScoreLabels}
        onModelOrderChange={onModelOrderChange}
        onSelectedSortRoiChange={onSelectedSortRoiChange}
        onModelSearchChange={onModelSearchChange}
        onShowScoreLabelsChange={onShowScoreLabelsChange}
        onResetControls={onResetControls}
      />
      <div className="workspace-grid">
        <Heatmap
          cells={heatmapCells}
          models={visibleModels}
          rois={heatmapRois}
          showScoreLabels={showScoreLabels}
          selectedCell={selectedCell}
          compareMode={compareMode}
          compareCells={compareCells}
          comparableCellIds={comparableCellIds}
          onSelectCell={onSelectCell}
        />
        <DetailsPanel
          imageCount={rows.length}
          modelRoiColumns={modelRoiColumns}
          rows={rows}
          selectedCell={selectedCell}
        />
      </div>
      <CompareDrawer
        compareMode={compareMode}
        compareCells={compareCells}
        rows={rows}
        modelRoiColumns={modelRoiColumns}
        topK={6}
        onCompareModeChange={onCompareModeChange}
      />
    </>
  );
}
