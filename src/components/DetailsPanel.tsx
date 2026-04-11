import { useMemo, useState } from 'react';
import { ImageGrid } from './ImageGrid';
import type { EvidenceImage, ModelRoiColumn, SelectedHeatmapCell, WideCsvRow } from '../types/data';
import { copyText, downloadJson } from '../utils/browserActions';
import { buildEvidenceView } from '../utils/evidence';
import { inferModelCategory } from '../utils/modelTags';

type DetailsPanelProps = {
  imageCount: number;
  modelRoiColumns: ModelRoiColumn[];
  rows: WideCsvRow[];
  selectedCell: SelectedHeatmapCell | null;
};

const topKOptions = [6, 9, 12];

function formatScore(score: number | null): string {
  return score === null ? 'Unavailable' : score.toFixed(3);
}

function formatValue(value: number): string {
  return value.toFixed(3);
}

function ImageModal({ image, onClose }: { image: EvidenceImage; onClose: () => void }) {
  const [imageMissing, setImageMissing] = useState(false);

  return (
    <div className="image-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="image-modal" role="dialog" aria-modal="true" aria-label={image.imageName} onClick={(event) => event.stopPropagation()}>
        <div className="image-modal-header">
          <div>
            <h3>{image.imageName}</h3>
            <p>Value: {formatValue(image.value)}</p>
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

export function DetailsPanel({ imageCount, modelRoiColumns, rows, selectedCell }: DetailsPanelProps) {
  const [topK, setTopK] = useState(6);
  const [modalImage, setModalImage] = useState<EvidenceImage | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const evidenceView = useMemo(() => {
    if (!selectedCell) {
      return null;
    }

    return buildEvidenceView(selectedCell, rows, modelRoiColumns, topK);
  }, [modelRoiColumns, rows, selectedCell, topK]);

  function selectedPayload() {
    if (!selectedCell) {
      return null;
    }

    return {
      roi: selectedCell.roi,
      model: selectedCell.model,
      modelCategory: inferModelCategory(selectedCell.model),
      aggregateScore: selectedCell.score,
      rankWithinRoi: selectedCell.rankWithinRoi,
      overallScore: selectedCell.overallScore,
      evidence: evidenceView
        ? {
            csvColumn: evidenceView.columnName,
            stats: evidenceView.stats,
            topImages: evidenceView.topImages,
            bottomImages: evidenceView.bottomImages,
          }
        : null,
    };
  }

  async function handleCopyMetadata() {
    const payload = selectedPayload();

    if (!payload) {
      return;
    }

    try {
      await copyText(JSON.stringify(payload, null, 2));
      setActionMessage('Copied selected metadata.');
    } catch {
      setActionMessage('Clipboard access is unavailable.');
    }
  }

  function handleExportSelection() {
    const payload = selectedPayload();

    if (!payload) {
      return;
    }

    downloadJson(`selected-${payload.model}-${payload.roi}.json`, payload);
    setActionMessage('Exported selected summary.');
  }

  if (!selectedCell) {
    return (
      <aside className="details-panel" aria-label="Details panel">
        <h2>Details</h2>
        <p>Select a heatmap cell to rank images by the matching CSV response column.</p>
        <div className="empty-state-card">
          <h3>No cell selected</h3>
          <p>Use the heatmap to choose one ROI/model cell, or turn on compare mode to select two cells.</p>
        </div>
        <dl className="details-list">
          <div>
            <dt>Selection</dt>
            <dd>None</dd>
          </div>
          <div>
            <dt>Loaded images</dt>
            <dd>{imageCount}</dd>
          </div>
        </dl>
      </aside>
    );
  }

  return (
    <aside className="details-panel evidence-panel" aria-label="Details panel">
      <div className="evidence-panel-header">
        <p className="eyebrow">Selected cell</p>
        <h2>
          {selectedCell.roi} / {selectedCell.model}
        </h2>
        <span className="model-tag">{inferModelCategory(selectedCell.model)}</span>
        <dl className="selected-score-strip">
          <div>
            <dt>Aggregate score</dt>
            <dd>{formatScore(selectedCell.score)}</dd>
          </div>
          <div>
            <dt>ROI rank</dt>
            <dd>{selectedCell.rankWithinRoi === null ? 'Unavailable' : `#${selectedCell.rankWithinRoi}`}</dd>
          </div>
          <div>
            <dt>Overall</dt>
            <dd>{formatScore(selectedCell.overallScore)}</dd>
          </div>
        </dl>
      </div>

      <div className="panel-action-row" aria-live="polite">
        <button type="button" onClick={handleExportSelection}>
          Export JSON
        </button>
        <button type="button" onClick={handleCopyMetadata}>
          Copy metadata
        </button>
        {actionMessage && <span>{actionMessage}</span>}
      </div>

      <label className="evidence-control">
        Top-k / bottom-k
        <select value={topK} onChange={(event) => setTopK(Number(event.target.value))}>
          {topKOptions.map((option) => (
            <option key={option} value={option}>
              {option} images
            </option>
          ))}
        </select>
      </label>

      {!evidenceView ? (
        <div className="evidence-empty-state">
          <h3>No image-level evidence found</h3>
          <p>
            The aggregate JSON contains this model/ROI score, but the CSV does not include a matching column for{' '}
            <strong>
              {selectedCell.model}_{selectedCell.roi}
            </strong>
            .
          </p>
        </div>
      ) : (
        <>
          <dl className="summary-card-grid">
            <div>
              <dt>Max image value</dt>
              <dd>{formatValue(evidenceView.stats.max)}</dd>
            </div>
            <div>
              <dt>Min image value</dt>
              <dd>{formatValue(evidenceView.stats.min)}</dd>
            </div>
            <div>
              <dt>Mean</dt>
              <dd>{formatValue(evidenceView.stats.mean)}</dd>
            </div>
            <div>
              <dt>Median</dt>
              <dd>{formatValue(evidenceView.stats.median)}</dd>
            </div>
            <div>
              <dt>Std. dev.</dt>
              <dd>{formatValue(evidenceView.stats.standardDeviation)}</dd>
            </div>
          </dl>

          <p className="evidence-column-note">
            CSV column: <strong>{evidenceView.columnName}</strong>
          </p>

          <ImageGrid title="Top images" images={evidenceView.topImages} onOpenImage={setModalImage} />
          <ImageGrid title="Bottom images" images={evidenceView.bottomImages} onOpenImage={setModalImage} />
        </>
      )}

      {modalImage && <ImageModal image={modalImage} onClose={() => setModalImage(null)} />}
    </aside>
  );
}
