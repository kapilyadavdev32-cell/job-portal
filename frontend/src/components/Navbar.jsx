import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth.js";
import { brand } from "../assets/brand.js";
import { useAppData } from "../store/AppContext.jsx";

const navClass = ({ isActive }) =>
  `nav-link${isActive ? " active" : ""}`;

function Navbar() {
  const navigate = useNavigate();
  const { auth, clearSession } = useAppData();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      /* still clear local session */
    }
    clearSession();
    navigate("/");
  };

  return (
    <nav className="nav-bar">
      <Link className="brand-link" to="/">
        {brand.name}
      </Link>
      <div className="nav-links">
        <NavLink className={navClass} end to="/">
          Home
        </NavLink>
        <NavLink className={navClass} to="/jobs">
          Jobs
        </NavLink>
        <NavLink className={navClass} to="/companies">
          Companies
        </NavLink>
        {auth.status === "ready" && auth.user ? (
          <>
            <NavLink className={navClass} to="/dashboard">
              Dashboard
            </NavLink>
            <span className="nav-user">
              <span className="meta-pill">{auth.user.username}</span>
              <button className="secondary-button nav-logout" onClick={handleLogout} type="button">
                Log out
              </button>
            </span>
          </>
        ) : (
          <NavLink className={navClass} to="/auth">
            Sign in
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export { Navbar };
