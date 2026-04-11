type HeaderProps = {
  imageCount: number;
  modelCount: number;
  roiCount: number;
};

export function Header({ imageCount, modelCount, roiCount }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Cortex model alignment</p>
        <h1>Interactive information visualization</h1>
        <p className="lede">
          Compare aggregate model alignment scores across cortical regions, then inspect the image-level evidence that
          drives each ROI/model cell.
        </p>
      </div>
      <dl className="summary-stats" aria-label="Dataset summary">
        <div>
          <dt>Images</dt>
          <dd>{imageCount || '-'}</dd>
        </div>
        <div>
          <dt>Models</dt>
          <dd>{modelCount || '-'}</dd>
        </div>
        <div>
          <dt>ROIs</dt>
          <dd>{roiCount || '-'}</dd>
        </div>
      </dl>
    </header>
  );
}
