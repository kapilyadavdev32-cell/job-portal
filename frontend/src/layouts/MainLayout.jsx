import { Outlet } from "react-router-dom";
import { Footer } from "../shared/components/Footer.jsx";
import { Navbar } from "../shared/components/Navbar.jsx";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6">
          <Navbar />
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Outlet />
      </main>

      <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 md:pb-10">
        <Footer />
      </div>
    </div>
  );
}

export { MainLayout };
