const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScgwaGWRFbbhhG1cF3bL76moGiCR93AbqD-ZNZXtK8hdtsy6A/viewform?usp=publish-editor';
const EMBED_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScgwaGWRFbbhhG1cF3bL76moGiCR93AbqD-ZNZXtK8hdtsy6A/viewform?embedded=true';

export function UserStudyView() {
  return (
    <section className="user-study-panel" aria-labelledby="user-study-title">
      <div className="user-study-header">
        <div>
          <p className="eyebrow">User study</p>
          <h2 id="user-study-title">Complete the study form here</h2>
          <p>
            You can switch back to the visualization tab at any time. The form may take a second to load.
          </p>
        </div>
        <a href={FORM_URL} target="_blank" rel="noreferrer">
          Open form in new tab
        </a>
      </div>
      <div className="form-frame-shell">
        <iframe
          src={EMBED_URL}
          title="Cortex visualization user study Google Form"
          loading="lazy"
        >
          Loading the user study form.
        </iframe>
      </div>
      <p className="form-fallback-note">
        If the embedded form does not load, use the external link above to open it directly.
      </p>
    </section>
  );
}
