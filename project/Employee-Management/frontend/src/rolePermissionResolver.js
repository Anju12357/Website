import { isAdminUser } from "./permissions";

/* ============================================================
   NORMALIZE
============================================================ */

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

/* ============================================================
   GET USER ROLE CANDIDATES
============================================================ */

const getRoleCandidates = (user) => {
  const candidates = [
    user?.role?.name,
    user?.role?.title,
    user?.role,

    user?.user_role?.name,
    user?.user_role?.title,
    user?.user_role,

    user?.userRole?.name,
    user?.userRole?.title,
    user?.userRole,

    user?.role_name,
    user?.roleName,
  ];

  return [
    ...new Set(
      candidates
        .map(normalize)
        .filter(Boolean)
    ),
  ];
};

/* ============================================================
   GET BACKEND PERMISSIONS
   ------------------------------------------------------------
   The database is now the source of truth.

   Backend:
   employee_roles.permissions
          ↓
      /auth/me
          ↓
     user.permissions
============================================================ */

export const getBackendPermissions = (user) => {
  if (!user) {
    return [];
  }

  const permissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];

  return [
    ...new Set(
      permissions
        .map(normalize)
        .filter(Boolean)
    ),
  ];
};

/* ============================================================
   GET ROLE PERMISSION STATE
   ------------------------------------------------------------
   Kept with the old function name so existing imports do not
   break.

   It no longer reads localStorage.
============================================================ */

export const getSavedRolePermissionState = (user) => {
  if (!user) {
    return {
      found: false,
      roleName: "",
      permissions: [],
    };
  }

  const roleCandidates = getRoleCandidates(user);
  const permissions = getBackendPermissions(user);

  return {
    found: roleCandidates.length > 0,
    roleName: roleCandidates[0] || "",
    permissions,
  };
};

/* ============================================================
   CENTRAL PERMISSION CHECK
   ------------------------------------------------------------
   IMPORTANT:
   No localStorage permission check.
   No frontend role permission copy.
   Database permissions returned by /auth/me are authoritative.
============================================================ */

export const canUser = (user, permission) => {
  const target = normalize(permission);

  if (!user || !target) {
    return false;
  }

  /* ==========================================================
     ADMIN
     ========================================================== */

  if (isAdminUser(user)) {
    return true;
  }

  /* ==========================================================
     DATABASE PERMISSIONS
     ========================================================== */

  const backendPermissions =
    getBackendPermissions(user);

  const allowed =
    backendPermissions.includes(target);

  /* ==========================================================
     DEBUG
     ========================================================== */

  console.log("================================");
  console.log("CENTRAL PERMISSION CHECK");
  console.log("User:", user?.name);
  console.log("Email:", user?.email);
  console.log(
    "Role:",
    getUserRoleName(user)
  );
  console.log(
    "Database permissions:",
    backendPermissions
  );
  console.log("Required:", target);
  console.log(
    "Is admin:",
    isAdminUser(user)
  );
  console.log(
    "RESULT:",
    allowed
      ? "ALLOWED - DATABASE ROLE PERMISSION"
      : "DENIED - DATABASE ROLE PERMISSION"
  );
  console.log("================================");

  return allowed;
};

/* ============================================================
   GET EFFECTIVE PERMISSIONS
============================================================ */

export const getEffectivePermissions = (user) => {
  if (!user) {
    return [];
  }

  /* Admin */

  if (isAdminUser(user)) {
    return ["*"];
  }

  /* Database */

  return getBackendPermissions(user);
};

/* ============================================================
   GET USER ROLE NAME
============================================================ */

export const getUserRoleName = (user) => {
  const candidates =
    getRoleCandidates(user);

  return candidates[0] || "";
};

/* ============================================================
   PERMISSION DEBUG INFORMATION
============================================================ */

export const getPermissionDebugInfo = (user) => {
  const backendPermissions =
    getBackendPermissions(user);

  return {
    user:
      user?.name ||
      user?.email ||
      "",

    isAdmin:
      isAdminUser(user),

    roleCandidates:
      getRoleCandidates(user),

    savedRoleFound:
      getRoleCandidates(user).length > 0,

    savedRoleName:
      getUserRoleName(user),

    savedRolePermissions:
      backendPermissions,

    backendPermissions,

    effectivePermissions:
      getEffectivePermissions(user),
  };
};

/* ============================================================
   PERMISSION SUBSCRIPTION
   ------------------------------------------------------------
   This can remain so existing components that listen for
   permission changes continue to work.
============================================================ */

export const subscribeToPermissionChanges = (
  callback
) => {
  const handleChange = () => {
    if (typeof callback === "function") {
      callback();
    }
  };

  window.addEventListener(
    "ems:roles-changed",
    handleChange
  );

  window.addEventListener(
    "ems:permissions-changed",
    handleChange
  );

  window.addEventListener(
    "storage",
    handleChange
  );

  return () => {
    window.removeEventListener(
      "ems:roles-changed",
      handleChange
    );

    window.removeEventListener(
      "ems:permissions-changed",
      handleChange
    );

    window.removeEventListener(
      "storage",
      handleChange
    );
  };
};