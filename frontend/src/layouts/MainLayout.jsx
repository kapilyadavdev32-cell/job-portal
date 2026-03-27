import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";

function MainLayout() {
  return (
    <div className="app-shell">
      <div className="nav-wrap">
        <div className="page-container">
          <Navbar />
        </div>
      </div>
      <div className="page-container">
        <Outlet />
      </div>
      <div className="page-container footer-wrap">
        <Footer />
      </div>
    </div>
  );
}

export { MainLayout };
