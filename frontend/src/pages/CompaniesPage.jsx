import { CompanyCard } from "../components/CompanyCard.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";
import { useAppData } from "../store/AppContext.jsx";

function CompaniesPage() {
  const { companies, refreshCompanies } = useAppData();

  return (
    <section className="section-block">
      <SectionHeader
        eyebrow="Companies"
        title="Hiring organizations"
        description="Employer profiles from the company API."
        action={
          <button className="secondary-button" onClick={refreshCompanies} type="button">
            Refresh companies
          </button>
        }
      />
      <div className="company-grid">
        {companies.items.length ? (
          companies.items.map((company) => (
            <CompanyCard company={company} key={company._id || company.name} />
          ))
        ) : (
          <EmptyState
            title="No companies found"
            description={companies.message || "The companies endpoint returned an empty list."}
          />
        )}
      </div>
    </section>
  );
}

export { CompaniesPage };
