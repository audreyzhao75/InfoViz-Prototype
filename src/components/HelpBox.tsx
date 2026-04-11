export function HelpBox() {
  return (
    <details className="help-box">
      <summary>How to use this prototype</summary>
      <div>
        <p>
          Start with the heatmap: columns are ROIs, rows are models, and color encodes the aggregate JSON score. Use
          search and sort controls to narrow the model set.
        </p>
        <p>
          Click a cell, or focus it and press Enter, to open image-level evidence in the details panel. Turn on compare
          mode to select two cells and inspect top-image overlap.
        </p>
      </div>
    </details>
  );
}
