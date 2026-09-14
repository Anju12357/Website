import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import "./UserRoles.css";

/* -----------------------------------------------------------
   Employee role definitions
   Role definitions and role permission assignments are stored in MySQL.
   Permission definitions are loaded from MySQL.
----------------------------------------------------------- */

const API = "https://website-vltl.onrender.com";

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (/^(https?:\/\/|data:|blob:)/i.test(imagePath)) return imagePath;
  return `${API}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const ROLE_PERMISSION_AREAS = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "▦",
    description: "Access the main employee dashboard",
    permissions: [
      ["dashboard.view", "View Dashboard", "Access the main employee dashboard"],
      ["dashboard.stats", "View Statistics", "View dashboard statistics and analytics"],
      ["dashboard.department", "View Department", "View department information and details"],
      ["dashboard.performance", "View Performance", "View employee performance details"],
      ["dashboard.roster.view", "View Employee Roster", "View the list of all employees"],
      ["dashboard.roster.add", "Add Employee", "Add a new employee to the system"],
      ["dashboard.roster.viewProfile", "View Employee Profile", "View employee profile information"],
      ["dashboard.roster.edit", "Edit Employee", "Edit existing employee information"],
      ["dashboard.roster.delete", "Delete Employee", "Delete an employee from the system"],
      ["notes.view", "View Notes", "View notes added to employee records"],
      ["notes.create", "Create Notes", "Add new notes to employee records"],
      ["notes.delete", "Delete Notes", "Delete notes from employee records"],
      ["timeline.view", "View Timeline", "View employee activity timeline"],
      ["meetings.view", "View Meetings", "View meetings and appointments"],
      ["meetings.create", "Create Meetings", "Schedule new meetings"],
      ["meetings.edit", "Edit Meetings", "Edit existing meetings"],
      ["meetings.delete", "Delete Meetings", "Delete scheduled meetings"],
      ["audit.view", "View Audit", "View audit logs and system history"],
      ["reports.view", "View Reports", "View employee-related reports"],
      ["reports.export", "Export Reports", "Export employee reports"],
    ],
  },
  {
    id: "employees",
    title: "Employees",
    icon: "👥",
    description: "Employee records and actions",
    permissions: [
      ["employees.view", "View Employees", "View the employee directory"],
      ["employees.search", "Search Employees", "Search employee records"],
      ["employees.select", "Select Employee", "Select an employee record"],
      ["employees.viewProfile", "View Employee Profile", "Open employee profile details"],
      ["employees.create", "Add Employee", "Create a new employee"],
      ["employees.edit", "Edit Employee", "Edit employee information"],
      ["employees.delete", "Delete Employee", "Remove an employee"],
      ["employees.email", "Email Employee", "Send email to an employee"],
      ["employees.meeting.view", "View Employee Meetings", "View employee meetings"],
      ["employees.meeting.create", "Create Employee Meetings", "Create employee meetings"],
      ["employees.performance.view", "View Performance", "View employee performance"],
      ["employees.attendance.view", "View Attendance", "View employee attendance"],
    ],
  },
  {
    id: "profile",
    title: "Profile",
    icon: "●",
    description: "View employee profile information",
    permissions: [
      ["profile.view", "View Profile", "View profile information"],
      ["profile.contact.view", "View Contact", "View contact information"],
      ["profile.department.view", "View Department", "View department information"],
      ["profile.skills.view", "View Skills", "View skills and expertise"],
      ["profile.projects.view", "View Projects", "View assigned projects"],
    ],
  },
  {
    id: "edit_profile",
    title: "Edit Profile",
    icon: "✎",
    description: "Edit employee profile information",
    permissions: [
      ["profile.edit", "Edit Profile", "Edit profile information"],
      ["edit_profile.basic", "Edit Basic Information", "Edit basic employee information"],
      ["edit_profile.contact", "Edit Contact", "Edit contact information"],
      ["edit_profile.department", "Edit Department", "Edit department information"],
      ["edit_profile.photo", "Change Photo", "Change profile photo"],
      ["edit_profile.cover", "Change Cover", "Change profile cover"],
      ["edit_profile.skills.add", "Add Skills", "Add employee skills"],
      ["edit_profile.skills.remove", "Remove Skills", "Remove employee skills"],
      ["edit_profile.save", "Save Profile", "Save profile changes"],
    ],
  },
  {
    id: "password",
    title: "Change Password",
    icon: "🔒",
    description: "Update account password",
    permissions: [
      ["password.view", "View Password Page", "Open the change password page"],
      ["password.change", "Change Password", "Change account password"],
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: "🔔",
    description: "Manage notifications",
    permissions: [
      ["notifications.view", "View Notifications", "View system notifications"],
      ["notifications.read", "Read Notifications", "Mark notifications as read"],
    ],
  },
];

const BUILT_IN_PERMISSION_IDS = new Set(
  ROLE_PERMISSION_AREAS.flatMap((area) =>
    area.permissions.map(([id]) => id)
  )
);

const slugifyPermission = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

const getPermissionAreaMeta = (areaId) => {
  const area = ROLE_PERMISSION_AREAS.find(
    (item) => String(item.id).toLowerCase() === String(areaId).toLowerCase()
  );

  return (
    area || {
      id: areaId,
      title: String(areaId)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
      icon: "•",
      description: "Custom access controls",
      permissions: [],
    }
  );
};


function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "R";
}

export default function UserRoles() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("ems-dark-mode") === "true"
  );

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [dbPermissions, setDbPermissions] = useState([]);
  const [, setPermissionsLoading] = useState(false);
  const [showAddPermission, setShowAddPermission] = useState(false);
  const [newPermissionArea, setNewPermissionArea] = useState("employees");
  const [newPermissionLabel, setNewPermissionLabel] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    try {
      const response = await api.post("/webservices/roles/get-roles", {});
      const data = response.data;
      const list = Array.isArray(data?.roles)
        ? data.roles
        : data?.data?.roles ?? data?.data ?? [];

      const normalizedRoles = Array.isArray(list)
        ? list
            .filter((role) => role && role.system !== true && String(role.id) !== "administrator")
            .map((role) => ({
              ...role,
              permissions: Array.isArray(role.permissions) ? role.permissions : [],
            }))
        : [];

      setRoles(normalizedRoles);

      if (selectedRoleId !== null) {
        const stillExists = normalizedRoles.some(
          (role) => String(role.id) === String(selectedRoleId)
        );
        if (!stillExists) {
          setSelectedRoleId(null);
          setSelectedPermissions([]);
          setRoleName("");
          setRoleDescription("");
          setEditing(false);
        }
      }
    } catch (error) {
      console.error("USER ROLES FETCH ERROR:", error.response?.data || error);
      setRoles([]);
      setError(
        error.response?.data?.message ||
          "Unable to load roles from the database."
      );
    }
  };

  useEffect(() => {
    const loadShellData = async () => {
      try {
        const response = await api.get("/auth/me");
        const data = response.data;
        setUser(data?.user ?? data?.data?.user ?? data?.data ?? null);
      } catch (error) {
        console.error("USER ROLES USER FETCH ERROR:", error.response?.data || error);
      }
    };
    loadShellData();
  }, []);

  useEffect(() => {
    localStorage.setItem("ems-dark-mode", String(darkMode));
  }, [darkMode]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      const data = response.data;
      const list =
        data?.notifications ??
        data?.data?.notifications ??
        data?.data ??
        [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("USER ROLES NOTIFICATIONS ERROR:", error.response?.data || error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (Number(notification.is_read) === 1) {
      setNotifAnchorEl(null);
      return;
    }
    try {
      await api.post("/notifications/read", { id: notification.id });
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: 1 } : item
        )
      );
    } catch (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error.response?.data || error);
    } finally {
      setNotifAnchorEl(null);
    }
  };

  const fetchPermissions = async () => {
    try {
      setPermissionsLoading(true);

      const response = await api.post(
        "/webservices/permissions/get-permissions",
        {}
      );

      let permissions = Array.isArray(response.data?.permissions)
        ? response.data.permissions
        : [];

      // Keep the existing permission catalogue working while moving the
      // definitions to MySQL. Missing built-in definitions are created once.
      const existingKeys = new Set(
        permissions.map((permission) =>
          String(permission.permission_key || "").trim().toLowerCase()
        )
      );

      // Migrate any custom permission definitions from the old localStorage
      // registry into MySQL once. After a successful migration, the old
      // permission registry is removed so MySQL becomes the source of truth.
      const legacyCustomRaw = localStorage.getItem(
        "employee_management_custom_permissions"
      );
      const legacyCustomAreas = legacyCustomRaw
        ? JSON.parse(legacyCustomRaw)
        : [];

      const legacyCustomPermissions = Array.isArray(legacyCustomAreas)
        ? legacyCustomAreas.flatMap((area) =>
            Array.isArray(area?.permissions)
              ? area.permissions.map(([id, label, description]) => ({
                  area: area.id,
                  name: label,
                  permission_key: id,
                  description,
                }))
              : []
          )
        : [];

      const missingBuiltIns = ROLE_PERMISSION_AREAS.flatMap((area) =>
        area.permissions
          .filter(([id]) => !existingKeys.has(String(id).toLowerCase()))
          .map(([id, label, description]) => ({
            area: area.id,
            name: label,
            permission_key: id,
            description,
          }))
      );

      const missingLegacyCustom = legacyCustomPermissions.filter(
        (permission) =>
          !existingKeys.has(
            String(permission.permission_key || "").toLowerCase()
          )
      );

      const permissionsToCreate = [
        ...missingBuiltIns,
        ...missingLegacyCustom,
      ];

      if (permissionsToCreate.length) {
        await Promise.all(
          missingBuiltIns.map((permission) =>
            api.post(
              "/webservices/permissions/create-permission",
              permission
            )
          )
        );

        const refreshed = await api.post(
          "/webservices/permissions/get-permissions",
          {}
        );

        permissions = Array.isArray(refreshed.data?.permissions)
          ? refreshed.data.permissions
          : permissions;
      }

      setDbPermissions(permissions);
    } catch (error) {
      console.error(
        "USER ROLES PERMISSIONS FETCH ERROR:",
        error.response?.data || error
      );
      setDbPermissions([]);
      setError("Unable to load permissions from the database.");
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();

    const refreshRoles = () => fetchRoles();
    const refreshPermissions = () => fetchPermissions();

    window.addEventListener("ems:roles-changed", refreshRoles);
    window.addEventListener("ems:permissions-changed", refreshPermissions);

    return () => {
      window.removeEventListener("ems:roles-changed", refreshRoles);
      window.removeEventListener("ems:permissions-changed", refreshPermissions);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await api.get("/webservices/users/search-users", {
          params: { search: searchQuery.trim() },
        });
        const data = response.data;
        const results = data?.users ?? data?.data?.users ?? data?.data ?? [];
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("USER ROLES SEARCH ERROR:", error.response?.data || error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const unreadCount = notifications.filter(
    (item) => Number(item.is_read) === 0
  ).length;

  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, path: "/employees" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    { text: "Edit Profile", icon: <EditIcon />, path: "/edit-profile" },
    { text: "Change Password", icon: <LockIcon />, path: "/change-password" },
    { text: "User Roles", icon: <PeopleIcon />, path: "/user-roles" },
  ];

  const colors = {
    page: darkMode
      ? "radial-gradient(circle at 12% 0%, rgba(37,99,235,.16), transparent 30%), linear-gradient(135deg, #070B14 0%, #0F172A 52%, #111827 100%)"
      : "radial-gradient(circle at 85% 0%, rgba(96,165,250,.18), transparent 26%), linear-gradient(135deg, #DCEBFA 0%, #EAF2FA 45%, #E4ECF8 100%)",
    sidebar: darkMode
      ? "linear-gradient(180deg, #0B1220 0%, #111C33 55%, #070B14 100%)"
      : "linear-gradient(180deg, #111D3A 0%, #172554 58%, #0F172A 100%)",
    primary: darkMode ? "#F8FAFC" : "#172033",
    secondary: darkMode ? "#A8B4C7" : "#64748B",
    border: darkMode ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.08)",
  };

  const selectedRole = useMemo(
    () => roles.find((role) => String(role.id) === String(selectedRoleId)) || null,
    [roles, selectedRoleId]
  );

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) =>
      `${role.name} ${role.description || ""}`.toLowerCase().includes(q)
    );
  }, [roles, search]);

  const permissionAreas = useMemo(() => {
    const grouped = new Map();

    dbPermissions.forEach((permission) => {
      const areaId = String(permission.area || "").trim().toLowerCase();
      const permissionId = String(permission.permission_key || "").trim().toLowerCase();

      if (!areaId || !permissionId) return;

      if (!grouped.has(areaId)) {
        const meta = getPermissionAreaMeta(areaId);
        grouped.set(areaId, {
          id: areaId,
          title: meta.title,
          icon: meta.icon,
          description: meta.description,
          permissions: [],
        });
      }

      grouped.get(areaId).permissions.push([
        permissionId,
        permission.name || permissionId,
        permission.description || "",
        permission.id,
      ]);
    });

    // Keep the standard areas visible even while permissions are loading.
    ROLE_PERMISSION_AREAS.forEach((area) => {
      if (!grouped.has(area.id)) {
        grouped.set(area.id, {
          ...area,
          permissions: [],
        });
      }
    });

    return ROLE_PERMISSION_AREAS
      .map((area) => grouped.get(area.id))
      .concat(
        [...grouped.values()].filter(
          (area) => !ROLE_PERMISSION_AREAS.some(
            (builtInArea) => builtInArea.id === area.id
          )
        )
      )
      .filter((area) => area.permissions.length > 0 || ROLE_PERMISSION_AREAS.some((item) => item.id === area.id));
  }, [dbPermissions]);

  const allPermissionIds = useMemo(
    () => permissionAreas.flatMap((area) => area.permissions.map(([id]) => id)),
    [permissionAreas]
  );

  const visibleAreas = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase();
    if (!q) return permissionAreas;

    return permissionAreas
      .map((area) => ({
        ...area,
        permissions: area.permissions.filter(([, label, description]) =>
          `${label} ${description} ${area.title}`.toLowerCase().includes(q)
        ),
      }))
      .filter((area) => area.permissions.length);
  }, [permissionAreas, permissionSearch]);

  const selectedCount = selectedRole
    ? (selectedRole.permissions || []).filter((id) => allPermissionIds.includes(id)).length
    : selectedPermissions.filter((id) => allPermissionIds.includes(id)).length;

  const deleteCustomPermission = async (permissionId, label, databaseId) => {
    const targetId = String(permissionId || "").trim().toLowerCase();

    if (!targetId) return;

    const confirmed = window.confirm(
      `Delete the "${label || permissionId}" permission?\n\nThis will remove it from the permission database and from all saved roles.`
    );

    if (!confirmed) return;

    try {
      if (!databaseId) {
        setError("This permission does not have a database ID.");
        return;
      }

      await api.post(
        "/webservices/permissions/delete-permission",
        { id: databaseId }
      );

      setSelectedPermissions((current) =>
        current.filter(
          (id) => String(id).trim().toLowerCase() !== targetId
        )
      );

      await fetchPermissions();

      setMessage(`"${label || permissionId}" was deleted successfully.`);
      setError("");
    } catch (error) {
      console.error(
        "DELETE PERMISSION ERROR:",
        error.response?.data || error
      );
      setError(
        error.response?.data?.message ||
          "Failed to delete the permission from the database."
      );
    }
  };

  const addNewPermission = async () => {
    const label = newPermissionLabel.trim();
    const description =
      newPermissionDescription.trim() || `Access ${label.toLowerCase()}`;
    const areaId = newPermissionArea.trim();

    if (!label) {
      setError("Please enter a permission name.");
      return;
    }

    if (!areaId) {
      setError("Please select a permission area.");
      return;
    }

    const area = permissionAreas.find((item) => item.id === areaId);
    if (!area) {
      setError("The selected permission area could not be found.");
      return;
    }

    const permissionId = `${areaId}.${slugifyPermission(label)}`;

    const duplicate = dbPermissions.some(
      (permission) =>
        String(permission.permission_key || "").trim().toLowerCase() === permissionId.toLowerCase() ||
        String(permission.name || "").trim().toLowerCase() === label.toLowerCase()
    );

    if (duplicate) {
      setError(`"${label}" already exists.`);
      return;
    }

    try {
      const response = await api.post(
        "/webservices/permissions/create-permission",
        {
          area: areaId,
          name: label,
          permission_key: permissionId,
          description,
        }
      );

      const createdPermission = response.data?.permission;

      if (!createdPermission) {
        throw new Error("Permission was not returned by the server.");
      }

      await fetchPermissions();

      // Immediately select the newly-created permission for the role being edited.
      setSelectedPermissions((current) => [
        ...new Set([...current, permissionId]),
      ]);

      setPermissionSearch(label);
      setNewPermissionLabel("");
      setNewPermissionDescription("");
      setShowAddPermission(false);
      setMessage(
        `"${label}" was saved to the database under ${area.title}. Select it for this role and save.`
      );
      setError("");
    } catch (error) {
      console.error(
        "ADD PERMISSION ERROR:",
        error.response?.data || error
      );
      setError(
        error.response?.data?.message ||
          "Failed to save the permission to the database."
      );
    }
  };

  const startNewRole = () => {
    setSelectedRoleId(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setPermissionSearch("");
    setEditing(true);
    setMessage("");
    setError("");
  };

  const selectRole = (role) => {
    setSelectedRoleId(role.id);
    setRoleName(role.name || "");
    setRoleDescription(role.description || "");
    setSelectedPermissions(Array.isArray(role.permissions) ? role.permissions : []);
    setPermissionSearch("");
    setEditing(false);
    setMessage("");
    setError("");
  };

  const startEdit = () => {
    if (!selectedRole) return;
    setRoleName(selectedRole.name || "");
    setRoleDescription(selectedRole.description || "");
    setSelectedPermissions(Array.isArray(selectedRole.permissions) ? selectedRole.permissions : []);
    setEditing(true);
    setMessage("");
    setError("");
  };

  const togglePermission = (id) => {
    setSelectedPermissions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleArea = (area) => {
    const ids = area.permissions.map(([id]) => id);
    const allSelected = ids.every((id) => selectedPermissions.includes(id));
    setSelectedPermissions((current) =>
      allSelected
        ? current.filter((id) => !ids.includes(id))
        : [...new Set([...current, ...ids])]
    );
  };

  const saveRole = async () => {
    const name = roleName.trim();
    const description = roleDescription.trim();

    if (!name) {
      setError("Please enter a role name.");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        String(role.id) !== String(selectedRoleId) &&
        role.name?.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setError(`"${name}" already exists.`);
      return;
    }

    const permissions = [...new Set(selectedPermissions)].filter((id) =>
      allPermissionIds.includes(id)
    );

    try {
      if (selectedRoleId) {
        await api.post("/webservices/roles/update-role", {
          id: selectedRoleId,
          name,
          description,
          permissions,
        });

        await fetchRoles();
        setEditing(false);
        setMessage(`"${name}" was updated successfully.`);
        setError("");
        return;
      }

      const response = await api.post("/webservices/roles/create-role", {
        name,
        description,
        permissions,
      });

      const created = response.data?.role;
      if (!created?.id) {
        throw new Error("The server did not return the created role.");
      }

      await fetchRoles();
      setSelectedRoleId(created.id);
      setEditing(false);
      setMessage(`"${name}" was created successfully.`);
      setError("");
    } catch (error) {
      console.error("SAVE ROLE ERROR:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "Failed to save the role to the database."
      );
    }
  };

  const deleteRole = async () => {
    if (!selectedRole) return;
    if (!window.confirm(`Delete the "${selectedRole.name}" role?`)) return;

    try {
      await api.post("/webservices/roles/delete-role", {
        id: selectedRole.id,
      });

      const deletedName = selectedRole.name;
      await fetchRoles();
      setSelectedRoleId(null);
      setSelectedPermissions([]);
      setRoleName("");
      setRoleDescription("");
      setEditing(false);
      setMessage(`"${deletedName}" was deleted.`);
      setError("");
    } catch (error) {
      console.error("DELETE ROLE ERROR:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "Failed to delete the role from the database."
      );
    }
  };

  const cancelEdit = () => {
    if (selectedRole) {
      selectRole(selectedRole);
    } else {
      startNewRole();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: colors.page,
        color: colors.primary,
        transition: "background 0.3s ease",
      }}
    >
      <Box
        sx={{
          width: 250,
          background: colors.sidebar,
          borderRight: `1px solid ${colors.border}`,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2.5,
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
          zIndex: 100,
          boxShadow: "10px 0 35px rgba(0,0,0,0.2)",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4, px: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(37,99,235,0.45)",
              }}
            >
              E
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={0.5} sx={{ color: "#FFFFFF" }}>
              EMS Portal
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sidebarItems.map((item) => {
              const isActive = item.path === "/user-roles";
              return (
                <Button
                  key={item.text}
                  fullWidth
                  startIcon={React.cloneElement(item.icon, {
                    style: {
                      color: isActive ? "#FFFFFF" : "#CBD5E1",
                      fontSize: "20px",
                    },
                  })}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: "flex-start",
                    height: 48,
                    borderRadius: "16px",
                    px: 2,
                    textTransform: "none",
                    fontWeight: isActive ? 700 : 600,
                    fontSize: "14px",
                    color: isActive ? "#FFFFFF" : "#CBD5E1",
                    backgroundColor: isActive ? "#1D4ED8" : "transparent",
                    boxShadow: isActive ? "0 6px 18px rgba(2,132,199,0.45)" : "none",
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    "&:hover": {
                      backgroundColor: isActive ? "#1D4ED8" : "rgba(255,255,255,0.12)",
                      transform: "translateX(4px)",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  {item.text}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={() => navigate("/")}
          sx={{
            borderRadius: "16px",
            height: 48,
            textTransform: "none",
            fontWeight: 700,
            color: "#F87171",
            backgroundColor: "rgba(239,68,68,0.18)",
            border: "1px solid rgba(239,68,68,0.35)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(239,68,68,0.3)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Logout Session
        </Button>
      </Box>

      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, md: "250px" },
          p: { xs: 2, sm: 2.5, md: 3 },
          width: { xs: "100%", md: "calc(100% - 250px)" },
          maxWidth: { xs: "100%", md: "calc(100vw - 250px)" },
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 2.5,
            gap: 2,
          }}
        >
          <Box sx={{ position: "relative", display: { xs: "none", sm: "block" } }}>
            <TextField
              placeholder="Search team members, departments, or roles..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { sm: 300, md: 420 },
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  borderRadius: "24px",
                  backgroundColor: darkMode ? "rgba(15,23,42,.72)" : "rgba(255,255,255,.82)",
                  backdropFilter: "blur(12px)",
                  color: colors.primary,
                  fontSize: "14px",
                  boxShadow: "0 4px 20px rgba(37,99,235,.08)",
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: "#2563EB" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2563EB",
                    boxShadow: "0 0 16px rgba(37,99,235,.35)",
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ color: colors.secondary, mr: 1 }} />,
                },
              }}
            />
            {searchQuery.trim() && (
              <Paper
                elevation={0}
                sx={{
                  position: "absolute",
                  top: 56,
                  left: 0,
                  width: "100%",
                  zIndex: 200,
                  maxHeight: 360,
                  overflowY: "auto",
                  borderRadius: "18px",
                  border: `1px solid ${colors.border}`,
                  background: darkMode ? "#0B1220" : "#FFFFFF",
                  p: 1,
                  boxShadow: "0 15px 40px rgba(0,0,0,.18)",
                }}
              >
                {searchLoading ? (
                  <Typography sx={{ p: 2, color: colors.secondary, textAlign: "center" }}>Searching...</Typography>
                ) : searchResults.length === 0 ? (
                  <Typography sx={{ p: 2, color: colors.secondary, textAlign: "center" }}>No employees found</Typography>
                ) : (
                  searchResults.map((employee) => (
                    <Box
                      key={employee.id}
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        navigate(Number(employee.id) === Number(user?.id) ? "/profile" : "/employees");
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.2,
                        borderRadius: "12px",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: darkMode ? "rgba(255,255,255,.08)" : "rgba(37,99,235,.08)",
                        },
                      }}
                    >
                      <Avatar src={getImageUrl(employee.profile_pic)} sx={{ width: 36, height: 36 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800} sx={{ color: colors.primary }}>
                          {employee.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.secondary }}>
                          {employee.email || employee.department || ""}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, marginLeft: "auto" }}>
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                onClick={() => setDarkMode((prev) => !prev)}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  backgroundColor: darkMode ? "rgba(30,41,59,.9)" : "rgba(224,242,254,.9)",
                  color: colors.primary,
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(51,65,85,1)" : "rgba(186,230,253,1)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                {darkMode ? <LightModeIcon sx={{ fontSize: 21 }} /> : <DarkModeIcon sx={{ fontSize: 21 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => {
                  setNotifAnchorEl(e.currentTarget);
                  fetchNotifications();
                }}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  backgroundColor: darkMode ? "rgba(30,41,59,.9)" : "rgba(224,242,254,.9)",
                  color: colors.primary,
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(51,65,85,1)" : "rgba(186,230,253,1)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={() => setNotifAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: "20px",
                  width: 360,
                  maxWidth: "calc(100vw - 24px)",
                  maxHeight: 520,
                  p: 1,
                  backgroundColor: darkMode ? "#0B1220 !important" : "#FFFFFF !important",
                  color: colors.primary,
                  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
                },
              }}
            >
              <Typography sx={{ px: 1.5, py: 1, fontWeight: 800, color: colors.primary }}>
                Notifications
              </Typography>
              {notifications.length === 0 ? (
                <Typography sx={{ p: 2, color: colors.secondary, textAlign: "center" }}>
                  No notifications
                </Typography>
              ) : (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      display: "block",
                      p: 1.6,
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor:
                        Number(notification.is_read) === 0
                          ? darkMode ? "#1E293B" : "#F0F9FF"
                          : "transparent",
                    }}
                  >
                    <Typography sx={{ color: colors.primary, fontWeight: Number(notification.is_read) === 0 ? 800 : 600 }}>
                      {notification.title || notification.message || "Notification"}
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", mt: .5, color: colors.secondary }}>
                      {notification.subtitle || notification.description || ""}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Menu>

            <Box
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                cursor: "pointer",
                minWidth: "fit-content",
              }}
            >
              <Avatar
                src={getImageUrl(user?.profile_pic)}
                alt={user?.name}
                sx={{
                  width: 42,
                  height: 42,
                  border: "2px solid #2563EB",
                  boxShadow: "0 0 12px rgba(37,99,235,.4)",
                  backgroundColor: darkMode ? "#475569" : "#BDBDBD",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" }, minWidth: 90 }}>
                <Typography sx={{ color: colors.primary, fontWeight: 500, fontSize: 13 }}>
                  {user?.name || "My Profile"}
                </Typography>
                <Typography sx={{ color: colors.secondary, fontSize: 11 }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={() => setProfileAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: "18px",
                  width: 190,
                  p: 1,
                  backgroundColor: darkMode ? "#0B1220 !important" : "#FFFFFF !important",
                  boxShadow: "0 12px 35px rgba(0,0,0,.18)",
                },
              }}
            >
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/profile"); }} sx={{ borderRadius: "12px", fontWeight: 700 }}>
                View Profile
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/edit-profile"); }} sx={{ borderRadius: "12px", fontWeight: 700 }}>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/change-password"); }} sx={{ borderRadius: "12px", fontWeight: 700 }}>
                Change Password
              </MenuItem>
              <MenuItem
                onClick={() => navigate("/")}
                sx={{ borderRadius: "12px", fontWeight: 700, color: "#EF4444" }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <div className={`user-roles-page ${darkMode ? "dark" : ""}`}>
          <header className="roles-header">
        <div className="roles-heading">
          <button className="roles-back-button" type="button" onClick={() => navigate(-1)}>←</button>
          <div>
            <span className="roles-badge">⚙ ACCESS CONTROL</span>
            <h1>Employee Roles</h1>
            <p>Create permissions once and reuse them for employees.</p>
          </div>
        </div>
      </header>

      {(message || error) && (
        <div className={`roles-alert ${error ? "error" : "success"}`}>
          <span>{error || message}</span>
          <button type="button" onClick={() => { setMessage(""); setError(""); }}>×</button>
        </div>
      )}

      <section className="role-stat-grid">
        <div className="role-stat-card">
          <div className="stat-icon blue">⚙</div>
          <div><span>Saved Roles</span><strong>{roles.length}</strong><small>Reusable employee roles</small></div>
        </div>
        <div className="role-stat-card">
          <div className="stat-icon green">👥</div>
          <div><span>Employee Areas</span><strong>{permissionAreas.length}</strong><small>Simple access controls</small></div>
        </div>
        <div className="role-stat-card">
          <div className="stat-icon orange">🔐</div>
          <div><span>Current Permissions</span><strong>{selectedCount}</strong><small>Permissions enabled</small></div>
        </div>
      </section>

      <main className="roles-workspace">
        <aside className="roles-list-panel">
          <div className="roles-panel-header">
            <div>
              <h2>Employee Roles</h2>
              <p>Select a role to view permissions</p>
            </div>
            <span className="roles-count">{roles.length}</span>
          </div>

          <div className="roles-search">
            <span>⌕</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search role..." />
          </div>

          <div className="profiles-list">
            {filteredRoles.map((role) => {
              const active = String(role.id) === String(selectedRoleId) && !editing;
              return (
                <button
                  key={role.id}
                  type="button"
                  className={`profile-list-card ${active ? "selected" : ""}`}
                  onClick={() => selectRole(role)}
                >
                  <span className="profile-avatar">{initials(role.name)}</span>
                  <span className="profile-card-copy">
                    <strong>{role.name}</strong>
                    <small>{role.description || "Employee team access"}</small>
                    <em>{role.permissions?.length || 0} permissions</em>
                  </span>
                  {active && <span className="selected-check">✓</span>}
                </button>
              );
            })}

            {!filteredRoles.length && (
              <div className="empty-profile-list">
                <div className="empty-profile-icon">👥</div>
                <strong>{roles.length ? "No matching roles" : "No roles yet"}</strong>
                <small>{roles.length ? "Try another search term." : "Create your first employee role."}</small>
              </div>
            )}
          </div>

          <button className="create-profile-bottom" type="button" onClick={startNewRole}>
            ＋ Create New Role
          </button>
          <div className="role-list-footer-note">Create a role once and reuse it when adding employees.</div>
        </aside>

        <section className="role-detail-panel">
          {editing ? (
            <div className="role-editor">
              <div className="create-role-heading">
                <div className="create-role-icon">👤</div>
                <div>
                  <h2>{selectedRoleId ? "Edit Employee Role" : "Create an Employee Role"}</h2>
                  <p>Configure the role and choose exactly which permissions it can use.</p>
                </div>
              </div>

              <div className="role-form-row">
                <label>
                  <span>JOB POSITION / ROLE *</span>
                  <input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g. Web Developer" />
                </label>
                <label>
                  <span>DESCRIPTION</span>
                  <input value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} placeholder="e.g. Developer team access" />
                </label>
              </div>

              <div className="permissions-title">
                <div className="permissions-title-icon">🛡</div>
                <div><h3>Permissions</h3><p>Enable an area and select the exact actions inside it.</p></div>
              </div>

              <div className="editor-toolbar">
                <div className="toolbar-search">
                  <span>⌕</span>
                  <input value={permissionSearch} onChange={(e) => setPermissionSearch(e.target.value)} placeholder="Search permissions..." />
                </div>
                <button type="button" onClick={() => setSelectedPermissions(allPermissionIds)}>Select All</button>
                <button type="button" onClick={() => setSelectedPermissions([])}>Clear All</button>
                <button
                  type="button"
                  className="add-permission-button"
                  onClick={() => {
                    setShowAddPermission((current) => !current);
                    setError("");
                    setMessage("");
                  }}
                >
                  ＋ Add Permission
                </button>
              </div>

              {showAddPermission && (
                <div className="add-permission-panel">
                  <div className="add-permission-heading">
                    <div>
                      <h4>Add New Permission</h4>
                      <p>Create it here and it will automatically appear in the selected area.</p>
                    </div>
                    <button
                      type="button"
                      className="add-permission-close"
                      onClick={() => setShowAddPermission(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="add-permission-form">
                    <label>
                      <span>PERMISSION AREA *</span>
                      <select
                        value={newPermissionArea}
                        onChange={(e) => setNewPermissionArea(e.target.value)}
                      >
                        {permissionAreas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>PERMISSION NAME *</span>
                      <input
                        value={newPermissionLabel}
                        onChange={(e) => setNewPermissionLabel(e.target.value)}
                        placeholder="e.g. View Recent Hires"
                      />
                    </label>

                    <label className="add-permission-description">
                      <span>DESCRIPTION</span>
                      <input
                        value={newPermissionDescription}
                        onChange={(e) => setNewPermissionDescription(e.target.value)}
                        placeholder="e.g. View the recent hires section"
                      />
                    </label>

                    <div className="add-permission-actions">
                      <button
                        type="button"
                        className="add-permission-cancel"
                        onClick={() => {
                          setShowAddPermission(false);
                          setNewPermissionLabel("");
                          setNewPermissionDescription("");
                          setError("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="roles-primary-button"
                        onClick={addNewPermission}
                      >
                        Add Permission
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="simple-permissions">
                {visibleAreas.map((area) => {
                  const ids = area.permissions.map(([id]) => id);
                  const count = ids.filter((id) => selectedPermissions.includes(id)).length;
                  const all = ids.length > 0 && count === ids.length;
                  return (
                    <div className="simple-permission-card" key={area.id}>
                      <div className="simple-permission-top">
                        <div className="simple-permission-icon">{area.icon}</div>
                        <div className="simple-permission-info">
                          <strong>{area.title}</strong>
                          <small>{area.description}</small>
                        </div>
                        <span className={`access-level ${count ? "access" : "no-access"}`}>
                          {count ? `${count} selected` : "No Access"}
                        </span>
                        <button type="button" className={`area-toggle ${all ? "on" : ""}`} onClick={() => toggleArea(area)} aria-label={`Toggle ${area.title}`}>
                          <span />
                        </button>
                      </div>

                      <div className="permission-options">
                        <div className="permission-options-header">
                          <span>{count} of {ids.length} selected</span>
                          <button type="button" onClick={() => toggleArea(area)}>{all ? "Clear" : "Select all"}</button>
                        </div>
                        <div className="permission-edit-list">
                          {area.permissions.map(([id, label, description, databaseId]) => {
                            const checked = selectedPermissions.includes(id);
                            return (
                              <label key={id} className={`permission-edit-row ${checked ? "checked" : ""}`}>
                                <input type="checkbox" checked={checked} onChange={() => togglePermission(id)} />
                                <span className="custom-checkbox">{checked ? "✓" : ""}</span>
                                <span className="permission-edit-copy">
                                  <strong>{label}</strong>
                                  <small>{description}</small>
                                </span>
                                <span className={`edit-status ${checked ? "allowed" : "denied"}`}>{checked ? "Allowed" : "Not Allowed"}</span>
                                {!BUILT_IN_PERMISSION_IDS.has(String(id).toLowerCase()) && (
                                  <button
                                    type="button"
                                    className="permission-delete-button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      deleteCustomPermission(id, label, databaseId);
                                    }}
                                    title={`Delete ${label}`}
                                    aria-label={`Delete ${label}`}
                                  >
                                    🗑
                                  </button>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <footer className="role-editor-footer">
                {selectedRoleId && <button type="button" className="cancel-button" onClick={cancelEdit}>Cancel</button>}
                <button type="button" className="roles-primary-button" onClick={saveRole} disabled={!roleName.trim()}>
                  {selectedRoleId ? "Save Changes" : "Save Role"}
                </button>
              </footer>
            </div>
          ) : selectedRole ? (
            <div className="role-view">
              <div className="profile-view-header">
                <div className="profile-view-identity">
                  <div className="large-profile-avatar">{initials(selectedRole.name)}</div>
                  <div>
                    <div className="profile-name-line">
                      <h2>{selectedRole.name}</h2>
                      <span className="role-type-badge">Employee Role</span>
                    </div>
                    <p>{selectedRole.description || "Reusable employee access profile"}</p>
                  </div>
                </div>
                <div className="profile-view-actions">
                  <button type="button" className="delete-profile-button" onClick={deleteRole}>Delete</button>
                  <button type="button" className="roles-primary-button" onClick={startEdit}>✎ Edit Role</button>
                </div>
              </div>

              <div className="profile-summary">
                <div>
                  <strong>{(selectedRole.permissions || []).filter((id) => allPermissionIds.includes(id)).length}</strong>
                  <span>permissions enabled</span>
                </div>
                <div className="summary-progress"><span style={{ width: `${Math.min(100, ((selectedRole.permissions?.length || 0) / allPermissionIds.length) * 100)}%` }} /></div>
                <small>This role can be selected when creating a new employee.</small>
              </div>

              <div className="view-toolbar">
                <div className="toolbar-search">
                  <span>⌕</span>
                  <input value={permissionSearch} onChange={(e) => setPermissionSearch(e.target.value)} placeholder="Search permission list..." />
                </div>

                <button
                  type="button"
                  className="add-permission-button"
                  onClick={() => {
                    setShowAddPermission(true);
                    setError("");
                    setMessage("");
                  }}
                >
                  ＋ Add Permission
                </button>
              </div>

              {showAddPermission && (
                <div className="add-permission-panel">
                  <div className="add-permission-heading">
                    <div>
                      <h4>Add New Permission</h4>
                      <p>Create a permission and place it automatically inside the area you choose.</p>
                    </div>
                    <button
                      type="button"
                      className="add-permission-close"
                      onClick={() => setShowAddPermission(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="add-permission-form">
                    <label>
                      <span>PERMISSION AREA *</span>
                      <select
                        value={newPermissionArea}
                        onChange={(e) => setNewPermissionArea(e.target.value)}
                      >
                        {permissionAreas.map((area) => (
                          <option key={area.id} value={area.id}>{area.title}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>PERMISSION NAME *</span>
                      <input
                        value={newPermissionLabel}
                        onChange={(e) => setNewPermissionLabel(e.target.value)}
                        placeholder="e.g. View Recent Hires"
                      />
                    </label>

                    <label className="add-permission-description">
                      <span>DESCRIPTION</span>
                      <input
                        value={newPermissionDescription}
                        onChange={(e) => setNewPermissionDescription(e.target.value)}
                        placeholder="e.g. View the recent hires section"
                      />
                    </label>

                    <div className="add-permission-actions">
                      <button
                        type="button"
                        className="add-permission-cancel"
                        onClick={() => {
                          setShowAddPermission(false);
                          setNewPermissionLabel("");
                          setNewPermissionDescription("");
                          setError("");
                        }}
                      >
                        Cancel
                      </button>
                      <button type="button" className="roles-primary-button" onClick={addNewPermission}>
                        Add Permission
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="permission-view-list">
                {visibleAreas.map((area) => {
                  const enabled = area.permissions.filter(([id]) => selectedRole.permissions?.includes(id));
                 
                  return (
                    <div className="view-area-card" key={area.id}>
                      <div className="view-area-header">
                        <div className="simple-permission-icon">{area.icon}</div>
                        <div><h3>{area.title}</h3><p>{area.description}</p></div>
                        <span className={`access-level ${enabled.length ? "access" : "no-access"}`}>
                          {enabled.length ? `${enabled.length} selected` : "No Access"}
                        </span>
                      </div>

                      {enabled.length > 0 && (
                        <div className="permission-view-rows saved-only-permissions">
                          {enabled.map(([id, label, description]) => (
                            <div className="permission-view-row allowed-row saved-permission-row" key={id}>
                              <span className="view-check checked">✓</span>

                              <div className="view-permission-copy">
                                <strong>{label}</strong>
                                <small>{description}</small>
                              </div>

                              <span className="edit-status allowed">
                                Allowed
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="reuse-role-box">
                <div className="reuse-role-icon">↻</div>
                <div><strong>Reuse this role</strong><p>When adding an employee, select <b>{selectedRole.name}</b> as the Access Role. Its saved permissions will be applied automatically.</p></div>
              </div>
            </div>
          ) : (
            <div className="empty-role-state">
              <div className="empty-role-icon">👤</div>
              <h2>Create an Employee Role</h2>
              <p>Create a role and configure its permissions once.</p>
              <button type="button" className="roles-primary-button" onClick={startNewRole}>＋ Create Employee Role</button>
            </div>
          )}
        </section>
      </main>

      <footer className="roles-page-footer">
        <div className="footer-line" />
        <div className="footer-shield">🛡</div>
        <strong>Employee access profiles</strong>
        <span>Create once <b>•</b> Reuse whenever needed</span>
      </footer>
        </div>
      </Box>
    </Box>
  );
}
