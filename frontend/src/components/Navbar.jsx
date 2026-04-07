// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Menu, X, Home, BarChart3, Layers } from "lucide-react";
import { authService } from "../../utils/auth";
import LockedInLogo from "./Logo";

const NAV_ITEMS = [
  { label: "Home",      path: "/",          icon: Home     },
  { label: "Locks",     path: "/aspects",   icon: Layers   },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Profile",   path: "/profile",   icon: User     },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [loggingOut, setLoggingOut]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = authService.getUser();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = async () => {
    // Guard against double-click / double-call
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await authService.logout();
    } catch (err) {
      // Token already blacklisted or network error — clear locally regardless
      authService.removeTokens();
    } finally {
      setMobileOpen(false);
      navigate("/login", { replace: true });
      // Don't reset loggingOut — component will unmount on navigation
    }
  };

  const linkCls = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
      isActive(path)
        ? "bg-indigo-100 text-indigo-700 shadow-sm"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  const mobileLinkCls = (path) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-indigo-100 text-indigo-700 shadow-sm"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <nav className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link to="/" onClick={() => setMobileOpen(false)}>
            <LockedInLogo />
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path} className={linkCls(path)}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 ml-2">
              <span className="text-gray-600 text-sm">
                {user?.first_name || user?.username || "User"}
              </span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            {mobileOpen
              ? <X    className="w-5 h-5 text-gray-600" />
              : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-lg z-50">
            <div className="px-4 py-4 space-y-1">
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={mobileLinkCls(path)}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-4 py-2 text-sm text-gray-500">
                  Signed in as{" "}
                  <span className="font-medium text-gray-700">
                    {user?.first_name || user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  {loggingOut ? "Logging out…" : "Logout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}