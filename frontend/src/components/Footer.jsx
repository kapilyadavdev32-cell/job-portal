import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/client.js";
import { brand } from "../assets/brand.js";

function Footer() {
  return (
    <footer className="footer-bar">
      <div>
        <strong>{brand.name}</strong>
        <p className="muted">{brand.tagline}</p>
      </div>
      <div className="footer-links">
        <Link className="meta-pill" to="/jobs">
          Browse jobs
        </Link>
        <span className="meta-pill">API {API_BASE_URL}</span>
      </div>
    </footer>
  );
}

export { Footer };
