import { Link } from "react-router-dom";
import { formatJobMeta } from "../utils/formatters.js";

function JobCard({ job }) {
  const meta = formatJobMeta(job);
  const id = job._id || job.id;
  const companyName = job.companyName || job.company?.name || "Company";

  const body = (
    <>
      <div>
        <h3>{job.title || "Untitled role"}</h3>
        <p>{companyName}</p>
      </div>
      <div className="meta-list">
        {meta.map((item) => (
          <span className="meta-pill" key={item}>
            {item}
          </span>
        ))}
      </div>
      <p className="muted">
        {job.description
          ? `${String(job.description).slice(0, 140)}${String(job.description).length > 140 ? "…" : ""}`
          : "Open role — open the listing for full details."}
      </p>
    </>
  );

  if (id) {
    return (
      <Link className="job-card job-card-link" to={`/jobs/${id}`}>
        {body}
      </Link>
    );
  }

  return <article className="job-card">{body}</article>;
}

export { JobCard };
