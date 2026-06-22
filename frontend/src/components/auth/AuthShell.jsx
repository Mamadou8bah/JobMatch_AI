import { Link } from "react-router-dom";
import BrandLogo from "../BrandLogo.jsx";

export default function AuthShell({ title, children }) {
  return (
    <main className="auth-page">
      <div className="auth-layout">
        <aside className="auth-aside" aria-hidden="true">
          <BrandLogo to="/" size="xl" className="auth-aside-brand" />
        </aside>

        <div className="auth-main">
          <div className="auth-card">
            <div className="auth-card-top">
              <BrandLogo
                to="/"
                size="md"
                iconClassName="!h-14 !w-14"
                className="auth-mobile-brand"
              />
              <Link className="auth-home-link" to="/">
                Home
              </Link>
            </div>

            <h1 className="auth-title">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
