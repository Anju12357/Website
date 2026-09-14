// ============================================================
// src/permissions.js
// CENTRAL PERMISSION SYSTEM
// ============================================================

export const PERMISSION_GROUPS = [
  {
    id: "dashboard",
    title: "Dashboard",
    permissions: [
      "dashboard.view",
      "dashboard.stats",
      "dashboard.department",
      "dashboard.performance",

      "dashboard.roster.view",
      "dashboard.roster.add",
      "dashboard.roster.viewProfile",
      "dashboard.roster.edit",
      "dashboard.roster.delete",

      "notes.view",
      "notes.create",
      "notes.delete",

      "timeline.view",

      "meetings.view",
      "meetings.create",
      "meetings.edit",
      "meetings.delete",

      "audit.view",

      "reports.view",
      "reports.export",

      "notifications.view",
      "notifications.read",
    ],
  },

  {
    id: "employees",
    title: "Employees",
    permissions: [
      "employees.view",
      "employees.search",
      "employees.viewProfile",
      "employees.create",
      "employees.edit",
      "employees.delete",
      "employees.select",
      "employees.email",

      "employees.meeting.view",
      "employees.meeting.create",

      "employees.performance.view",
      "employees.attendance.view",
    ],
  },

  {
    id: "profile",
    title: "Profile",
    permissions: [
      "profile.view",
      "profile.contact.view",
      "profile.department.view",
      "profile.skills.view",
      "profile.projects.view",
    ],
  },

  {
    id: "edit_profile",
    title: "Edit Profile",
    permissions: [
      "profile.edit",
      "edit_profile.basic",
      "edit_profile.contact",
      "edit_profile.department",
      "edit_profile.photo",
      "edit_profile.cover",
      "edit_profile.skills.add",
      "edit_profile.skills.remove",
      "edit_profile.save",
    ],
  },

  {
    id: "password",
    title: "Change Password",
    permissions: [
      "password.view",
      "password.change",
    ],
  },

  {
    id: "notifications",
    title: "Notifications",
    permissions: [
      "notifications.view",
      "notifications.read",
    ],
  },

  {
    id: "user_roles",
    title: "User Roles",
    permissions: [
      "permissions.view",
      "permissions.manage",
    ],
  },
];

// ============================================================
// ALL PERMISSIONS
// ============================================================

export const ALL_PERMISSIONS =
  PERMISSION_GROUPS.flatMap(
    (group) => group.permissions
  );

// ============================================================
// NORMALIZE PERMISSIONS
// ============================================================

export const normalisePermissions = (value) => {
  let permissions = [];

  // Array
  if (Array.isArray(value)) {
    permissions = value;
  }

  // Object
  else if (
    value &&
    typeof value === "object"
  ) {
    permissions = Object.keys(value).filter(
      (key) => Boolean(value[key])
    );
  }

  // String
  else if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      return normalisePermissions(parsed);
    } catch {
      permissions = trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  // Only allow permissions that actually exist
  // in PERMISSION_GROUPS.
  return [
    ...new Set(
      permissions
        .filter(Boolean)
        .map((permission) =>
          String(permission).trim()
        )
        .filter((permission) =>
          ALL_PERMISSIONS.includes(permission)
        )
    ),
  ];
};

// ============================================================
// AMERICAN SPELLING ALIAS
// ============================================================

export const normalizePermissions =
  normalisePermissions;

// ============================================================
// ADMIN CHECK
// ============================================================

export const isAdminUser = (user) => {
  if (!user) {
    return false;
  }

  const role = String(
    user.role ||
      user.user_role ||
      user.userRole ||
      ""
  )
    .trim()
    .toLowerCase();

  return (
    user.is_admin === true ||
    user.isAdmin === true ||
    Number(user.is_admin) === 1 ||
    role === "admin" ||
    role === "administrator"
  );
};

// ============================================================
// GET USER PERMISSIONS
// ============================================================

export const getUserPermissions = (user) => {
  if (!user) {
    return [];
  }

  // Admin automatically gets everything
  if (isAdminUser(user)) {
    return [...ALL_PERMISSIONS];
  }

  return normalisePermissions(
    user.permissions
  );
};

// ============================================================
// SINGLE PERMISSION
// ============================================================

export const hasPermission = (
  user,
  permission
) => {
  if (!user || !permission) {
    return false;
  }

  // Admin gets everything
  if (isAdminUser(user)) {
    return true;
  }

  const permissions =
    getUserPermissions(user);

  return permissions.includes(
    permission
  );
};

// ============================================================
// ANY PERMISSION
// ============================================================

export const hasAnyPermission = (
  user,
  permissions
) => {
  if (!Array.isArray(permissions)) {
    return false;
  }

  return permissions.some(
    (permission) =>
      hasPermission(
        user,
        permission
      )
  );
};

// ============================================================
// ALL PERMISSIONS
// ============================================================

export const hasAllPermissions = (
  user,
  permissions
) => {
  if (!Array.isArray(permissions)) {
    return false;
  }

  return permissions.every(
    (permission) =>
      hasPermission(
        user,
        permission
      )
  );
};