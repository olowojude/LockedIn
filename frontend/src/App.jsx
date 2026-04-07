// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "../utils/auth";

import HomePage         from "./pages/Home";
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import ProfilePage      from "./pages/ProfilePage";
import Onboarding       from "./pages/Onboarding";
import AspectsDashboard from "./pages/AspectsDashboard";
import AspectDetail     from "./pages/AspectDetail";
import WrappedPage      from "./pages/WrappedPage";
import AnalyticsPage    from "./pages/AnalyticsPage";

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  if (authService.isAuthenticated()) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route path="/"             element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/onboarding"   element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/aspects"      element={<ProtectedRoute><AspectsDashboard /></ProtectedRoute>} />
        <Route path="/aspects/:id"  element={<ProtectedRoute><AspectDetail /></ProtectedRoute>} />
        <Route path="/wrapped/:id"  element={<ProtectedRoute><WrappedPage /></ProtectedRoute>} />
        <Route path="/analytics"    element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Redirect old overview route to analytics */}
        <Route path="/overview" element={<Navigate to="/analytics" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}