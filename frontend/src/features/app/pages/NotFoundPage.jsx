import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="section-block">
      <div className="info-panel">
        <p className="surface-label">404</p>
        <h2>Page not found</h2>
        <p className="muted">That URL does not match any route in this app.</p>
        <div className="inline-actions" style={{ marginTop: "1rem" }}>
          <button className="primary-button" onClick={() => navigate("/")} type="button">
            Go home
          </button>
        </div>
      </div>
    </section>
  );
}

export { NotFoundPage };
