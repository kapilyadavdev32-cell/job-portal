import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { createCompany, fetchCompanyById, updateCompany } from "../api/companies.js";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { useToast } from "../../../store/ToastContext.jsx";
import { useAppData } from "../../../store/AppContext.jsx";

function CompanyEditorPage() {
  const { companyId } = useParams();
  const isEditMode = Boolean(companyId);
  const navigate = useNavigate();
  const { auth, refreshCompanies } = useAppData();
  const { pushToast } = useToast();
  const [status, setStatus] = useState({ loading: isEditMode, error: "" });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    website: "",
    location: "",
    description: "",
    logoUrl: "",
  });

  const user = auth.user;
  const isRecruiterOrAdmin = user?.role === "recruiter" || user?.role === "admin";

  useEffect(() => {
    let cancelled = false;

    async function loadCompany() {
      if (!isEditMode) {
        setStatus({ loading: false, error: "" });
        return;
      }
      setStatus({ loading: true, error: "" });
      try {
        const result = await fetchCompanyById(companyId);
        const company = result?.data?.company ?? result?.data;
        if (!company) {
          throw new Error("Company not found.");
        }

        const ownerId = company.owner?._id || company.owner;
        const isAllowed =
          user?.role === "admin" ||
          (user?.role === "recruiter" &&
            ownerId &&
            String(ownerId) === String(user?._id));

        if (!isAllowed) {
          throw new Error("You can edit only your own company.");
        }

        if (!cancelled) {
          setForm({
            name: company.name || "",
            website: company.website || "",
            location: company.location || "",
            description: company.description || "",
            logoUrl: company.logo?.url || "",
          });
          setStatus({ loading: false, error: "" });
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({
            loading: false,
            error: error.message || "Could not load company.",
          });
        }
      }
    }

    if (auth.status === "ready") {
      loadCompany();
    }

    return () => {
      cancelled = true;
    };
  }, [auth.status, companyId, isEditMode, user?._id, user?.role]);

  if (auth.status === "loading") {
    return (
      <section className="section-block">
        <div className="page-loading">
          <div className="loading-spinner" aria-hidden />
          <p>Loading your session…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isRecruiterOrAdmin) {
    return (
      <section className="section-block">
        <EmptyState
          title="Recruiter access required"
          description="Only recruiters and admins can create or update companies."
        />
      </section>
    );
  }

  if (status.loading) {
    return (
      <section className="section-block">
        <div className="page-loading">
          <div className="loading-spinner" aria-hidden />
          <p>Loading company…</p>
        </div>
      </section>
    );
  }

  if (status.error) {
    return (
      <section className="section-block">
        <EmptyState title="Cannot continue" description={status.error} />
      </section>
    );
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      website: form.website.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
    };

    if (form.logoUrl.trim()) {
      payload.logo = { url: form.logoUrl.trim() };
    }

    setSaving(true);
    try {
      const result = isEditMode
        ? await updateCompany(companyId, payload)
        : await createCompany(payload);
      const savedCompany = result?.data?.company ?? result?.data;
      await refreshCompanies();
      pushToast(
        isEditMode ? "Company updated successfully." : "Company created successfully.",
        "success",
      );
      if (savedCompany?._id) {
        navigate(`/companies/${savedCompany._id}`);
      } else {
        navigate("/companies");
      }
    } catch (error) {
      pushToast(error.message || "Could not save company.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-block">
      <div className="detail-hero">
        <p className="surface-label">{isEditMode ? "Update company" : "Create company"}</p>
        <h1>{isEditMode ? "Edit company profile" : "Create company profile"}</h1>
        <p className="lead">
          Keep your employer profile updated so candidates can trust and discover your roles.
        </p>
      </div>

      <form className="panel auth-form" onSubmit={onSubmit}>
        <div className="input-group">
          <label htmlFor="name">Company name</label>
          <input
            id="name"
            name="name"
            onChange={onChange}
            placeholder="Acme Technologies"
            required
            value={form.name}
          />
        </div>

        <div className="filter-grid">
          <div className="input-group">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              onChange={onChange}
              placeholder="https://company.com"
              type="url"
              value={form.website}
            />
          </div>
          <div className="input-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              onChange={onChange}
              placeholder="Noida, India"
              value={form.location}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="logoUrl">Logo URL (optional)</label>
          <input
            id="logoUrl"
            name="logoUrl"
            onChange={onChange}
            placeholder="https://company.com/logo.png"
            type="url"
            value={form.logoUrl}
          />
        </div>

        <div className="input-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="textarea-input"
            id="description"
            name="description"
            onChange={onChange}
            placeholder="What your company does, team size, and hiring focus."
            rows={6}
            value={form.description}
          />
        </div>

        <div className="inline-actions">
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? "Saving…" : isEditMode ? "Update company" : "Create company"}
          </button>
          <Link className="secondary-button" style={{ display: "inline-flex" }} to="/companies">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

export { CompanyEditorPage };
