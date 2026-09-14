import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { canUser } from "./rolePermissionResolver";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Employees from "./Pages/Employees";
import Profile from "./Pages/Profile";
import EditProfile from "./Pages/EditProfile";
import ChangePassword from "./Pages/ChangePassword";
import Signup from "./Pages/Signup";
import UserRoles from "./Pages/UserRoles";

const API = "https://website-vltl.onrender.com";

axios.defaults.withCredentials = true;

/* ============================================================
   PERMISSION DENIED PAGE
============================================================ */

function PermissionDenied({
  permission,
}) {
  const navigate =
    useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg,#F0F9FF,#E0F2FE,#DBEAFE)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px",
          textAlign: "center",
          boxShadow:
            "0 20px 60px rgba(15,23,42,.12)",
          border:
            "1px solid rgba(239,68,68,.12)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            margin:
              "0 auto 20px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "rgba(239,68,68,.1)",
            color: "#EF4444",
            fontSize: "32px",
            fontWeight: 900,
          }}
        >
          !
        </div>

        <h2
          style={{
            margin:
              "0 0 12px",
            color: "#0F172A",
            fontWeight: 900,
          }}
        >
          Permission Denied
        </h2>

        <p
          style={{
            margin:
              "0 0 10px",
            color: "#64748B",
            lineHeight: 1.7,
          }}
        >
          You do not have
          permission to access
          this page.
        </p>

        {permission && (
          <div
            style={{
              display:
                "inline-block",
              padding:
                "8px 14px",
              marginBottom:
                "24px",
              borderRadius:
                "10px",
              background:
                "#F1F5F9",
              color:
                "#475569",
              fontFamily:
                "monospace",
              fontSize:
                "13px",
            }}
          >
            Required:{" "}
            {permission}
          </div>
        )}

        <br />

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          style={{
            border: "none",
            borderRadius:
              "12px",
            padding:
              "12px 24px",
            background:
              "#0284C7",
            color: "#FFFFFF",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PROTECTED ROUTE
============================================================ */

function ProtectedRoute({
  permission,
  user,
  loading,
  children,
}) {
  /* ----------------------------------------------------------
     AUTH LOADING
  ---------------------------------------------------------- */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          background:
            "linear-gradient(135deg,#F0F9FF,#E0F2FE,#DBEAFE)",
          color: "#0284C7",
          fontWeight: 800,
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  /* ----------------------------------------------------------
     NOT LOGGED IN
  ---------------------------------------------------------- */

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     NO PERMISSION REQUIRED
  ---------------------------------------------------------- */

  if (!permission) {
    return children;
  }

  /* ----------------------------------------------------------
     PERMISSION CHECK
  ---------------------------------------------------------- */

  if (canUser(user, permission)) {
    return children;
  }

  /* ----------------------------------------------------------
     PERMISSION DENIED
  ---------------------------------------------------------- */

  return (
    <PermissionDenied
      permission={
        permission
      }
    />
  );
}

/* ============================================================
   APP CONTENT
============================================================ */

function AppContent() {
  const location =
    useLocation();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // Prevent protected routes from rendering before /auth/me
  // finishes checking the newly requested URL.
  const [
    authCheckedPath,
    setAuthCheckedPath,
  ] = useState(null);

  /* ----------------------------------------------------------
     PUBLIC ROUTES
  ---------------------------------------------------------- */

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname ===
      "/signup";

  /* ==========================================================
     LOAD CURRENT USER
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    // ----------------------------------------------------------
    // PUBLIC ROUTES
    // ----------------------------------------------------------

    if (isPublicRoute) {
      setLoading(false);
      setAuthCheckedPath(
        location.pathname
      );

      return () => {
        mounted = false;
      };
    }

    // ----------------------------------------------------------
    // PROTECTED ROUTES
    // ----------------------------------------------------------

    // Invalidate the previous route check immediately.
    // ProtectedRoute will show Loading until this URL is checked.
    setLoading(true);
    setAuthCheckedPath(null);

    const loadCurrentUser =
      async () => {
        try {
          console.log(
            "AUTH ME REQUEST"
          );

          const response =
            await axios.get(
              `${API}/auth/me`,
              {
                withCredentials:
                  true,
              }
            );

          console.log(
            "AUTH ME RESPONSE:",
            response.data
          );

          const currentUser =
            response.data
              ?.user ||
            response.data
              ?.data ||
            null;

          if (mounted) {
            setUser(
              currentUser
            );
          }
        } catch (error) {
          console.error(
            "AUTH ME ERROR:",
            error?.response
              ?.data ||
              error?.message
          );

          if (mounted) {
            setUser(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
            setAuthCheckedPath(
              location.pathname
            );
          }
        }
      };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [
    location.pathname,
    isPublicRoute,
  ]);

  /* ==========================================================
     PUBLIC ROUTES
  ========================================================== */

  if (isPublicRoute) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Login />
          }
        />

        <Route
          path="/signup"
          element={
            <Signup />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    );
  }

  /* ==========================================================
     PROTECTED ROUTES
  ========================================================== */
return (
  <Routes>

    {/* ======================================================
        DASHBOARD
    ====================================================== */}

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute
          permission="dashboard.view"
          user={user}
          loading={
            loading ||
            authCheckedPath !==
              location.pathname
          }
        >
          <Dashboard />
        </ProtectedRoute>
      }
    />

    {/* ======================================================
        EMPLOYEES
    ====================================================== */}

    <Route
      path="/employees"
      element={
        <ProtectedRoute
          permission="employees.view"
          user={user}
          loading={
            loading ||
            authCheckedPath !==
              location.pathname
          }
        >
          <Employees />
        </ProtectedRoute>
      }
    />

    {/* ======================================================
        PROFILE
    ====================================================== */}

    <Route
      path="/profile"
      element={
        <ProtectedRoute
          permission="profile.view"
          user={user}
          loading={
            loading ||
            authCheckedPath !==
              location.pathname
          }
        >
          <Profile />
        </ProtectedRoute>
      }
    />

    {/* ======================================================
        EDIT PROFILE
    ====================================================== */}

    <Route
      path="/edit-profile"
      element={
        <ProtectedRoute
          permission="profile.edit"
          user={user}
          loading={
            loading ||
            authCheckedPath !==
              location.pathname
          }
        >
          <EditProfile />
        </ProtectedRoute>
      }
    />

    {/* ======================================================
        CHANGE PASSWORD
    ====================================================== */}

    <Route
      path="/change-password"
      element={
        <ProtectedRoute
          permission="password.view"
          user={user}
          loading={
            loading ||
            authCheckedPath !==
              location.pathname
          }
        >
          <ChangePassword />
        </ProtectedRoute>
      }
    />

    {/* ======================================================
        USER ROLES
    ====================================================== */}

    <Route
      path="/user-roles"
      element={
        <ProtectedRoute
          permission="permissions.view"
          user={user}
          loading={
            loading ||
            authCheckedPath !==
              location.pathname
          }
        >
          <UserRoles />
        </ProtectedRoute>
      }
    />

    {/* ======================================================
        UNKNOWN ROUTE
    ====================================================== */}

    <Route
      path="*"
      element={
        <Navigate
          to="/dashboard"
          replace
        />
      }
    />

  </Routes>
);
}

/* ============================================================
   APP
============================================================ */

function App() {
  return (
    <AppContent />
  );
}

export default App;