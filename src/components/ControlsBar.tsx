import type { ModelOrderMode, Roi } from '../types/data';

type ControlsBarProps = {
  rois: string[];
  modelOrder: ModelOrderMode;
  selectedSortRoi: Roi;
  modelSearch: string;
  showScoreLabels: boolean;
  onModelOrderChange: (modelOrder: ModelOrderMode) => void;
  onSelectedSortRoiChange: (roi: Roi) => void;
  onModelSearchChange: (searchTerm: string) => void;
  onShowScoreLabelsChange: (showScoreLabels: boolean) => void;
  onResetControls: () => void;
};

export function ControlsBar({
  rois,
  modelOrder,
  selectedSortRoi,
  modelSearch,
  showScoreLabels,
  onModelOrderChange,
  onSelectedSortRoiChange,
  onModelSearchChange,
  onShowScoreLabelsChange,
  onResetControls,
}: ControlsBarProps) {
  return (
    <section className="controls-bar" aria-label="Visualization controls">
      <label>
        Search models
        <input
          type="search"
          value={modelSearch}
          placeholder="clip, resnet, taskonomy..."
          onChange={(event) => onModelSearchChange(event.target.value)}
        />
      </label>
      <label>
        Model order
        <select value={modelOrder} onChange={(event) => onModelOrderChange(event.target.value as ModelOrderMode)}>
          <option value="overall-desc">Overall descending</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="selected-roi-desc">Selected ROI descending</option>
        </select>
      </label>
      <label>
        Sort ROI
        <select value={selectedSortRoi} onChange={(event) => onSelectedSortRoiChange(event.target.value)}>
          {rois.map((roi) => (
            <option key={roi} value={roi}>
              {roi}
            </option>
          ))}
        </select>
      </label>
      <label className="toggle-control">
        <input
          type="checkbox"
          checked={showScoreLabels}
          onChange={(event) => onShowScoreLabelsChange(event.target.checked)}
        />
        Show cell labels when space allows
      </label>
      <button className="reset-controls-button" type="button" onClick={onResetControls}>
        Reset controls
      </button>
    </section>
  );
}
