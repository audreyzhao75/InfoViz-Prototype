import { useMemo, useState } from 'react';
import { ImageGrid } from './ImageGrid';
import type { EvidenceImage, ModelRoiColumn, SelectedHeatmapCell, WideCsvRow } from '../types/data';
import { downloadJson } from '../utils/browserActions';
import { buildCompareSummary } from '../utils/compare';
import { buildEvidenceView } from '../utils/evidence';
import { inferModelCategory } from '../utils/modelTags';

type CompareDrawerProps = {
  compareMode: boolean;
  compareCells: SelectedHeatmapCell[];
  rows: WideCsvRow[];
  modelRoiColumns: ModelRoiColumn[];
  topK: number;
  onCompareModeChange: (enabled: boolean) => void;
};

function formatScore(score: number | null): string {
  return score === null ? 'Unavailable' : score.toFixed(3);
}

function formatDifference(value: number | null): string {
  if (value === null) {
    return 'Unavailable';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(3)}`;
}

function CompareCellCard({
  label,
  cell,
  onOpenImage,
  evidenceView,
}: {
  label: 'A' | 'B';
  cell: SelectedHeatmapCell;
  onOpenImage: (image: EvidenceImage) => void;
  evidenceView: ReturnType<typeof buildEvidenceView>;
}) {
  return (
    <article className="compare-cell-card">
      <div className="compare-card-heading">
        <span>{label}</span>
        <div>
          <h3>{cell.model}</h3>
          <p>
            {cell.roi} <span className="model-tag">{inferModelCategory(cell.model)}</span>
          </p>
        </div>
      </div>
      <dl className="compare-metrics">
        <div>
          <dt>Aggregate</dt>
          <dd>{formatScore(cell.score)}</dd>
        </div>
        <div>
          <dt>Image mean</dt>
          <dd>{evidenceView ? evidenceView.stats.mean.toFixed(3) : 'Unavailable'}</dd>
        </div>
      </dl>
      {evidenceView ? (
        <>
          <ImageGrid title={`Top ${label}`} images={evidenceView.topImages} onOpenImage={onOpenImage} compact />
          <ImageGrid title={`Bottom ${label}`} images={evidenceView.bottomImages} onOpenImage={onOpenImage} compact />
        </>
      ) : (
        <p className="compare-empty">No matching CSV column found.</p>
      )}
    </article>
  );
}

function ImageModal({ image, onClose }: { image: EvidenceImage; onClose: () => void }) {
  const [imageMissing, setImageMissing] = useState(false);

  return (
    <div className="image-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="image-modal" role="dialog" aria-modal="true" aria-label={image.imageName} onClick={(event) => event.stopPropagation()}>
        <div className="image-modal-header">
          <div>
            <h3>{image.imageName}</h3>
            <p>Value: {image.value.toFixed(3)}</p>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {imageMissing ? (
          <span className="modal-missing-image">Image unavailable</span>
        ) : (
          <img src={image.imageUrl} alt={image.imageName} onError={() => setImageMissing(true)} />
        )}
      </div>
    </div>
  );
}

export function CompareDrawer({
  compareMode,
  compareCells,
  rows,
  modelRoiColumns,
  topK,
  onCompareModeChange,
}: CompareDrawerProps) {
  const [modalImage, setModalImage] = useState<EvidenceImage | null>(null);
  const [cellA, cellB] = compareCells;
  const evidenceA = useMemo(
    () => (cellA ? buildEvidenceView(cellA, rows, modelRoiColumns, topK) : null),
    [cellA, modelRoiColumns, rows, topK],
  );
  const evidenceB = useMemo(
    () => (cellB ? buildEvidenceView(cellB, rows, modelRoiColumns, topK) : null),
    [cellB, modelRoiColumns, rows, topK],
  );
  const compareSummary = cellA && cellB ? buildCompareSummary(cellA, evidenceA, cellB, evidenceB) : null;

  function handleExportCompare() {
    if (!cellA || !cellB || !compareSummary) {
      return;
    }

    downloadJson('compare-summary.json', {
      cellA: {
        roi: cellA.roi,
        model: cellA.model,
        modelCategory: inferModelCategory(cellA.model),
        aggregateScore: cellA.score,
        evidence: evidenceA,
      },
      cellB: {
        roi: cellB.roi,
        model: cellB.model,
        modelCategory: inferModelCategory(cellB.model),
        aggregateScore: cellB.score,
        evidence: evidenceB,
      },
      summary: compareSummary,
    });
  }

  return (
    <section className="compare-drawer" aria-label="Compare drawer">
      <div className="compare-drawer-heading">
        <div>
          <h2>Compare</h2>
          <p>{compareMode ? 'Select two heatmap cells to compare image-level evidence.' : 'Turn on compare mode to pin two cells.'}</p>
        </div>
        <label className="compare-toggle">
          <input type="checkbox" checked={compareMode} onChange={(event) => onCompareModeChange(event.target.checked)} />
          Compare mode
        </label>
      </div>

      {compareMode && (
        <div className="compare-drawer-body">
          <p className="compare-selection-note">{compareCells.length}/2 cells selected</p>

          {cellA && cellB ? (
            <>
              <div className="compare-card-grid">
                <CompareCellCard
                  label="A"
                  cell={cellA}
                  onOpenImage={setModalImage}
                  evidenceView={evidenceA}
                />
                <CompareCellCard
                  label="B"
                  cell={cellB}
                  onOpenImage={setModalImage}
                  evidenceView={evidenceB}
                />
              </div>

              {compareSummary ? (
                <section className="compare-overlap-section">
                  <div className="compare-badge-row">
                    <span>Top overlap: {compareSummary.top.overlap.length}</span>
                    <span>Bottom overlap: {compareSummary.bottom.overlap.length}</span>
                    <span>Aggregate diff A-B: {formatDifference(compareSummary.aggregateScoreDifference)}</span>
                    <span>Mean diff A-B: {formatDifference(compareSummary.imageMeanDifference)}</span>
                  </div>
                  <div className="panel-action-row">
                    <button type="button" onClick={handleExportCompare}>
                      Export compare JSON
                    </button>
                  </div>
                  <div className="compare-overlap-grid">
                    <ImageGrid title="Overlapping top images" images={compareSummary.top.overlap} onOpenImage={setModalImage} compact />
                    <ImageGrid title="Unique top images for A" images={compareSummary.top.uniqueA} onOpenImage={setModalImage} compact />
                    <ImageGrid title="Unique top images for B" images={compareSummary.top.uniqueB} onOpenImage={setModalImage} compact />
                  </div>
                  <div className="compare-bottom-overlap">
                    <span>Bottom unique A: {compareSummary.bottom.uniqueA.length}</span>
                    <span>Bottom unique B: {compareSummary.bottom.uniqueB.length}</span>
                  </div>
                </section>
              ) : (
                <p className="compare-empty">Both selected cells need matching CSV columns before overlaps can be computed.</p>
              )}
            </>
          ) : (
            <p className="compare-empty">Click two ROI x model cells in the heatmap. Click a selected compare cell again to deselect it.</p>
          )}
        </div>
      )}

      {modalImage && <ImageModal image={modalImage} onClose={() => setModalImage(null)} />}
    </section>
  );
}
