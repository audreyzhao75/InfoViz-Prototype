import { useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { extent, interpolateViridis, scaleBand, scaleSequential } from 'd3';
import type { AggregateHeatmapCell, Roi, SelectedHeatmapCell } from '../types/data';
import { inferModelCategory } from '../utils/modelTags';

type HeatmapProps = {
  cells: AggregateHeatmapCell[];
  models: string[];
  rois: Roi[];
  showScoreLabels: boolean;
  selectedCell: SelectedHeatmapCell | null;
  compareMode: boolean;
  compareCells: SelectedHeatmapCell[];
  comparableCellIds: Set<string>;
  onSelectCell: (cell: SelectedHeatmapCell) => void;
};

type TooltipState = {
  cell: AggregateHeatmapCell;
  x: number;
  y: number;
};

const margin = { top: 34, right: 28, bottom: 62, left: 190 };
const roiColumnWidth = 96;
const modelRowHeight = 28;

function formatScore(score: number | null): string {
  return score === null ? 'NA' : score.toFixed(3);
}

function cellAriaLabel(cell: AggregateHeatmapCell, compareMode: boolean): string {
  const parts = [
    `ROI ${cell.roi}`,
    `model ${cell.model}`,
    `category ${inferModelCategory(cell.model)}`,
    `aggregate score ${formatScore(cell.score)}`,
    `rank ${cell.rankWithinRoi === null ? 'unavailable' : cell.rankWithinRoi}`,
  ];

  return `${parts.join(', ')}. ${compareMode ? 'Press Enter to toggle this compare selection.' : 'Press Enter to select this cell.'}`;
}

function tooltipScore(cell: AggregateHeatmapCell, compareMode: boolean, isComparable: boolean): string {
  if (compareMode && !isComparable) {
    return 'No image-level data available for comparison';
  }

  return formatScore(cell.score);
}

function scoreTextColor(score: number, minValue: number, maxValue: number): string {
  const range = maxValue - minValue;
  const normalized = range === 0 ? 1 : (score - minValue) / range;
  return normalized < 0.58 ? '#ffffff' : '#152018';
}

export function Heatmap({
  cells,
  models,
  rois,
  showScoreLabels,
  selectedCell,
  compareMode,
  compareCells,
  comparableCellIds,
  onSelectCell,
}: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hoveredCell = tooltip?.cell ?? null;

  const scoredCells = useMemo(() => cells.filter((cell) => cell.score !== null), [cells]);
  const [minScore = 0, maxScore = 1] = extent(scoredCells, (cell) => cell.score ?? undefined);
  const adjustedMaxScore = minScore === maxScore ? maxScore + 1 : maxScore;
  const color = scaleSequential<string>().domain([minScore, adjustedMaxScore]).interpolator(interpolateViridis);

  const width = Math.max(560, margin.left + margin.right + rois.length * roiColumnWidth);
  const heatmapHeight = Math.max(220, models.length * modelRowHeight);
  const height = margin.top + margin.bottom + heatmapHeight;
  const innerWidth = width - margin.left - margin.right;

  const x = scaleBand<string>().domain(rois).range([0, innerWidth]).padding(0.12);
  const y = scaleBand<string>().domain(models).range([0, heatmapHeight]).padding(0.08);
  const canShowScoreLabels = showScoreLabels && x.bandwidth() >= 30 && y.bandwidth() >= 28;
  const legendValues = [minScore, (minScore + adjustedMaxScore) / 2, adjustedMaxScore];
  const legendSteps = Array.from({ length: 48 }, (_, index) => minScore + ((adjustedMaxScore - minScore) * index) / 47);

  function updateTooltip(cell: AggregateHeatmapCell, event: MouseEvent<SVGRectElement>) {
    const bounds = containerRef.current?.getBoundingClientRect();
    setTooltip({
      cell,
      x: bounds ? event.clientX - bounds.left + 14 : event.clientX,
      y: bounds ? event.clientY - bounds.top + 14 : event.clientY,
    });
  }

  function updateFocusTooltip(cell: AggregateHeatmapCell, xPosition: number, yPosition: number) {
    setTooltip({
      cell,
      x: margin.left + xPosition + Math.max(x.bandwidth() / 2, 12),
      y: margin.top + yPosition + Math.max(y.bandwidth() / 2, 12),
    });
  }

  function handleCellKeyDown(cell: AggregateHeatmapCell, event: KeyboardEvent<SVGRectElement>, isComparable: boolean) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (compareMode && !isComparable) {
        return;
      }
      onSelectCell(cell);
    }
  }

  function handleCellClick(cell: AggregateHeatmapCell, isComparable: boolean) {
    if (compareMode && !isComparable) {
      return;
    }

    onSelectCell(cell);
  }

  return (
    <section className="heatmap-area" aria-label="Heatmap area" ref={containerRef}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Heatmap</p>
          <h2>Aggregate score by model and ROI</h2>
        </div>
        <span>{cells.length} cells</span>
      </div>
      <div className="heatmap-scroll" onMouseLeave={() => setTooltip(null)}>
        {cells.length === 0 ? (
          <div className="heatmap-empty-state">
            <h3>No models match the current search</h3>
            <p>Clear the search field or reset the controls to restore the full heatmap.</p>
          </div>
        ) : (
          <svg className="heatmap-svg" viewBox={`0 0 ${width} ${height}`} role="img">
            <title>Model by ROI aggregate score heatmap</title>
            <g transform={`translate(${margin.left},${margin.top})`}>
              {hoveredCell && (
                <>
                  <rect className="heatmap-highlight" x={0} y={y(hoveredCell.model) ?? 0} width={innerWidth} height={y.bandwidth()} />
                  <rect className="heatmap-highlight" x={x(hoveredCell.roi) ?? 0} y={0} width={x.bandwidth()} height={heatmapHeight} />
                </>
              )}

              {cells.map((cell) => {
                const xPosition = x(cell.roi) ?? 0;
                const yPosition = y(cell.model) ?? 0;
                const compareIndex = compareCells.findIndex((compareCell) => compareCell.id === cell.id);
                const isCompareSelected = compareIndex !== -1;
                const isSelected = !compareMode && selectedCell?.id === cell.id;
                const isComparable = comparableCellIds.has(cell.id);
                const isCompareDisabled = compareMode && !isComparable;
                const fill = cell.score === null ? '#eef1ed' : color(cell.score);

                return (
                  <g key={cell.id}>
                    <rect
                      className={`heatmap-cell${isSelected ? ' selected' : ''}${isCompareSelected ? ' compare-selected' : ''}${isCompareDisabled ? ' compare-disabled' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-disabled={isCompareDisabled}
                      aria-label={
                        isCompareDisabled
                          ? `${cellAriaLabel(cell, compareMode)} No image-level data available for comparison.`
                          : cellAriaLabel(cell, compareMode)
                      }
                      x={xPosition}
                      y={yPosition}
                      width={x.bandwidth()}
                      height={y.bandwidth()}
                      rx={4}
                      fill={fill}
                      onMouseEnter={(event) => updateTooltip(cell, event)}
                      onMouseMove={(event) => updateTooltip(cell, event)}
                      onFocus={() => updateFocusTooltip(cell, xPosition, yPosition)}
                      onBlur={() => setTooltip(null)}
                      onKeyDown={(event) => handleCellKeyDown(cell, event, isComparable)}
                      onClick={() => handleCellClick(cell, isComparable)}
                    />
                    {isCompareSelected && (
                      <text className="compare-cell-marker" x={xPosition + 6} y={yPosition + 14}>
                        {compareIndex === 0 ? 'A' : 'B'}
                      </text>
                    )}
                    {canShowScoreLabels && cell.score !== null && (
                      <text
                        className="cell-score-label"
                        x={xPosition + x.bandwidth() / 2}
                        y={yPosition + y.bandwidth() / 2}
                        fill={scoreTextColor(cell.score, minScore, adjustedMaxScore)}
                      >
                        {cell.score.toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}

              <g className="axis-labels y-axis-labels">
                {models.map((model) => (
                  <text key={model} x={-16} y={(y(model) ?? 0) + y.bandwidth() / 2} textAnchor="end" dominantBaseline="middle">
                    {model}
                  </text>
                ))}
              </g>

              <g className="axis-labels x-axis-labels">
                {rois.map((roi) => (
                  <text
                    key={roi}
                    x={(x(roi) ?? 0) + x.bandwidth() / 2}
                    y={-14}
                    textAnchor="middle"
                  >
                    {roi}
                  </text>
                ))}
              </g>
            </g>

            <g className="heatmap-legend" transform={`translate(${margin.left},${height - 42})`}>
              {legendSteps.map((value, index) => (
                <rect key={value} x={index * 4} y={0} width={4} height={10} fill={color(value)} />
              ))}
              {legendValues.map((value, index) => (
                <text key={value} x={index * 94} y={30} textAnchor={index === 2 ? 'end' : 'start'}>
                  {value.toFixed(2)}
                </text>
              ))}
              <text x={214} y={10} dominantBaseline="middle">
                Aggregate score
              </text>
              {compareMode && (
                <g className="disabled-cell-legend" transform="translate(328, 0)">
                  <rect width={16} height={10} rx={3} />
                  <text x={24} y={10} dominantBaseline="middle">
                    Not comparable
                  </text>
                </g>
              )}
            </g>
          </svg>
        )}
      </div>

      {tooltip && (
        <div className="heatmap-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <dl>
            <div>
              <dt>ROI</dt>
              <dd>{tooltip.cell.roi}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>
                {tooltip.cell.model} <span className="model-tag">{inferModelCategory(tooltip.cell.model)}</span>
              </dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd>{tooltipScore(tooltip.cell, compareMode, comparableCellIds.has(tooltip.cell.id))}</dd>
            </div>
            <div>
              <dt>ROI rank</dt>
              <dd>{tooltip.cell.rankWithinRoi === null ? 'NA' : `#${tooltip.cell.rankWithinRoi}`}</dd>
            </div>
            <div>
              <dt>Overall</dt>
              <dd>{formatScore(tooltip.cell.overallScore)}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
