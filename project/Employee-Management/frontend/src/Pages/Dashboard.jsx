import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
   
  ResponsiveContainer,
  
} from "recharts";


import {
  isAdminUser,
  PERMISSION_GROUPS,
} from "../permissions";

import { canUser } from "../rolePermissionResolver";



// Material UI Core Imports
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  TextField,
  IconButton,
  Badge,
  Divider,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

// Material UI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VideocamIcon from "@mui/icons-material/Videocam";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";

import axios from "axios";
import { useEffect } from "react";


const GRAPH_DATA = {
  "3 Months": {
    pathArea:
      "M0 160 C60 150 120 120 180 100 S300 70 360 90 S450 60 500 70 L500 200 L0 200 Z",

    pathLine:
      "M0 160 C60 150 120 120 180 100 S300 70 360 90 S450 60 500 70",

    pts: [
      { cx: 0, cy: 160 },
      { cx: 90, cy: 135 },
      { cx: 180, cy: 100 },
      { cx: 270, cy: 75 },
      { cx: 360, cy: 90 },
      { cx: 500, cy: 70 },
    ],

    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  },

  "6 Months": {
    pathArea:
      "M0 165 C70 145 140 130 210 95 S340 70 410 85 S470 60 500 50 L500 200 L0 200 Z",

    pathLine:
      "M0 165 C70 145 140 130 210 95 S340 70 410 85 S470 60 500 50",

    pts: [
      { cx: 0, cy: 165 },
      { cx: 100, cy: 145 },
      { cx: 200, cy: 95 },
      { cx: 300, cy: 70 },
      { cx: 400, cy: 85 },
      { cx: 500, cy: 50 },
    ],

    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  },

  "1 Year": {
    pathArea:
      "M0 170 C70 160 140 145 210 120 S340 90 410 70 S470 55 500 40 L500 200 L0 200 Z",

    pathLine:
      "M0 170 C70 160 140 145 210 120 S340 90 410 70 S470 55 500 40",

    pts: [
      { cx: 0, cy: 170 },
      { cx: 100, cy: 155 },
      { cx: 200, cy: 120 },
      { cx: 300, cy: 90 },
      { cx: 400, cy: 70 },
      { cx: 500, cy: 40 },
    ],

    labels: ["Jan", "Mar", "May", "Jul", "Sep", "Dec"],
  },
};


const PERMISSION_DEFINITIONS =
PERMISSION_GROUPS.flatMap((group) => group.permissions);

/*
 * Replacement for meeting participants whose employee
 * record was deleted.
 */


function Dashboard() {
  const navigate = useNavigate();

  // THEME STATE (DARK & LIGHT MODE)
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode(!darkMode);

  // Search & Table State
  const [searchQuery, setSearchQuery] = useState("");
const [employees, setEmployees] = useState([]);

const [dashboardStats, setDashboardStats] = useState({
  totalEmployees: 0,
  totalDepartments: 0,
  presentEmployees: 0,
  absentEmployees: 0,
});
  const [statusFilter, setStatusFilter] = useState("All");
  // Active Sidebar Nav State
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Notification, Profile & Row Action Menu State
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [user, setUser] = useState(null);
  const [permissionVersion, setPermissionVersion] = useState(0);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionEmployee, setPermissionEmployee] = useState(null);
  const [permissionForm, setPermissionForm] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

const [meeting, setMeeting] = useState({});
const [chartData, setChartData] = useState([]);

  const [activities, setActivities] = useState([]);

const [notifications, setNotifications] = useState([]);
const [notificationLoading, setNotificationLoading] = useState(false);
const [currentTime, setCurrentTime] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000);

  return () => clearInterval(timer);
}, []);

const unreadCount = notifications.filter(
  (item) => Number(item.is_read) === 0
).length;


  // Modals & Toast state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("");
  const [newEmpJoiningDate, setNewEmpJoiningDate] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Quick Admin Notes State
  const [quickNote, setQuickNote] = useState("");
  const [notes, setNotes] = useState([]);
const [editModalOpen, setEditModalOpen] = useState(false);
const [editEmployee, setEditEmployee] = useState({
  id: "",
  name: "",
  email: "",
  department: "",
  designation: "",
  attendance: "",
  joining_date: "",
});

  // MOVEMENT GRAPH INTERACTIVE TIMEFRAME STATE
  const [graphTimeframe, setGraphTimeframe] = useState("6 Months");

  const [performanceData, setPerformanceData] = useState([]);
const performance =
  performanceData.find(
    (item) => item.timeframe === graphTimeframe
  ) || {};

const currentGraphData = {
  ...GRAPH_DATA[graphTimeframe],
  ...performance,
};
  console.log(currentGraphData);
  const fetchDashboardStats = async () => {
  try {
    const res = await axios.get(
      "https://website-vltl.onrender.com/dashboard/stats"
    );

    if (res.data.status === 1) {
      setDashboardStats(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};
const fetchEmployees = async () => {
  try {
    const res = await axios.post(
      "https://website-vltl.onrender.com/webservices/users/get-all-users"
    );

    if (res.data.status === 1) {
      setEmployees(res.data.data);
    }
  } catch (err) {
    console.log("Employee Fetch Error:", err);
  }
};

const fetchEmployeeRoles = async () => {
  try {
    setRolesLoading(true);

    const res = await axios.post(
      "https://website-vltl.onrender.com/webservices/roles/get-roles",
      {},
      {
        withCredentials: true,
      }
    );

    if (res.data.status === 1) {
      const roles = Array.isArray(res.data.data)
        ? res.data.data
        : [];

      const usableRoles = roles.filter(
        (role) =>
          role &&
          role.name &&
          String(role.name).trim().toLowerCase() !== "admin" &&
          String(role.name).trim().toLowerCase() !== "administrator" &&
          role.system !== true
      );

      setEmployeeRoles(usableRoles);

      console.log(
        "EMPLOYEE ROLES AVAILABLE IN DASHBOARD:",
        usableRoles.map((role) => role.name)
      );
    } else {
      setEmployeeRoles([]);
    }
  } catch (err) {
    console.error(
      "Employee Roles Fetch Error:",
      err?.response?.data || err?.message || err
    );
    setEmployeeRoles([]);
  } finally {
    setRolesLoading(false);
  }
};

const searchEmployees = async (searchText) => {
  if (!can("dashboard.roster.view")) return;
  try {
    // If search box is empty, load all employees
    if (searchText.trim() === "") {
      fetchEmployees();
      return;
    }

    const res = await axios.post(
      "https://website-vltl.onrender.com/webservices/users/search-users",
      {
        search: searchText,
      }
    );

    if (res.data.status === 1) {
      setEmployees(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};



const fetchMeeting = async () => {
  try {
    const res = await axios.get(
      "https://website-vltl.onrender.com/meetings"
    );

    if (res.data.status === 1 && res.data.data.length > 0) {
      const data = res.data.data[0];

      setMeeting({
        id: data.id,
        title: data.title,
        time: data.meeting_time,
        platform: data.platform,
        link: data.meeting_link,
        button: "Join Video Call",
      });
    }
  } catch (err) {
    console.log("Meeting Fetch Error:", err);
  }
};



const fetchDepartmentChart = async () => {
  try {
    const res = await axios.get(
      "https://website-vltl.onrender.com/dashboard/department-chart"
    );

    if (res.data.status === 1) {
      setChartData(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};

const fetchPerformance = async () => {
  try {
    const res = await axios.get(
      "https://website-vltl.onrender.com/dashboard/performance"
    );

    if (res.data.status === 1) {
      setPerformanceData(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};


const fetchNotes = async () => {
  try {
    const res = await axios.get("https://website-vltl.onrender.com/admin-notes");

    if (res.data.status === 1) {
      setNotes(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};

const fetchAuditLogs = async () => {
  try {
    const res = await axios.get("https://website-vltl.onrender.com/audit-logs");

    if (res.data.status === 1) {
      setActivities(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};


const fetchNotifications = async () => {
  setNotificationLoading(true);
  try {
    const res = await axios.get(
      "https://website-vltl.onrender.com/notifications"
    );

    if (res.data.status === 1 && Array.isArray(res.data.data)) {
      setNotifications(res.data.data);
    } else {
      setNotifications([]);
    }
  } catch (err) {
    console.log("Notification error:", err);
    setNotifications([]);
  } finally {
    setNotificationLoading(false);
  }
};

  // Add Employee Handler
  
const handleAddEmployee = async () => {
  if (!can("dashboard.roster.add")) {
    setToastMessage(
      "You do not have permission to add employees"
    );
    return;
  }

  try {
    if (!newEmpName.trim() || !newEmpEmail.trim()) {
      setToastMessage("Please fill all fields");
      return;
    }

    if (!newEmpJoiningDate) {
      setToastMessage("Please select a joining date");
      return;
    }

    if (!newEmpRole) {
      setToastMessage("Please select a job position / access role");
      return;
    }

    const selectedRole = employeeRoles.find(
      (role) => role.name === newEmpRole
    );

    if (!selectedRole) {
      setToastMessage(
        "Please select a valid saved employee role"
      );
      return;
    }

    const res = await axios.post(
      "https://website-vltl.onrender.com/webservices/users/add-users",
      {
        name: newEmpName.trim(),
        email: newEmpEmail.trim(),
        password: "123456",

        // Saved employee access profile.
        // The backend uses this role to obtain the saved permissions.
        role: selectedRole.name,

        user_type: 2,

        department: newEmpDept || null,
        joining_date: newEmpJoiningDate || null,
        joined_date: newEmpJoiningDate || null,

        // Keep designation compatible with your existing users table.
        designation: selectedRole.name,

        attendance: "Present",
        status: 1,
      },
      {
        withCredentials: true,
      }
    );

    if (res.data.status === 1) {
      setToastMessage("Employee Added Successfully");

      setAddModalOpen(false);

      setNewEmpName("");
      setNewEmpEmail("");
      setNewEmpDept("");
      setNewEmpRole("");

      fetchEmployees();
      fetchDashboardStats();
    } else {
      setToastMessage(
        res.data.message || "Employee creation failed"
      );
    }
  } catch (err) {
    console.error("Add Employee Error:", err);

    setToastMessage(
      err?.response?.data?.message ||
      "Something went wrong"
    );
  }
};

const handleUpdateEmployee = async () => {
  if (!can("dashboard.roster.edit")) { setToastMessage("You do not have permission to edit employees"); return; }
  try {
    const res = await axios.post(
      "https://website-vltl.onrender.com/webservices/users/update-user",
      {
        id: editEmployee.id,
        name: editEmployee.name,
        email: editEmployee.email,

        role: editEmployee.designation,
        user_type: 2,

        department: editEmployee.department || null,
        joining_date: editEmployee.joining_date || null,
        joined_date: editEmployee.joining_date || null,
        designation: editEmployee.designation,
        attendance: editEmployee.attendance,

        status: 1,
        added_by: 1,
      }
    );

    if (res.data.status === 1) {
      setToastMessage("Employee Updated Successfully");

      setEditModalOpen(false);

      fetchEmployees(); // Reload table
    } else {
      setToastMessage(res.data.message);
    }
  } catch (err) {
    console.log(err);
    setToastMessage("Update Failed");
  }
};



  // Delete Employee Row
  const handleDeleteEmpRow = async () => {
  if (!can("dashboard.roster.delete")) { setToastMessage("You do not have permission to delete employees"); return; }
  try {
    const res = await axios.post(
      "https://website-vltl.onrender.com/webservices/users/delete-user",
      {
        id: selectedEmp.id,
      }
    );

    if (res.data.status === 1) {
      setToastMessage("Employee Deleted Successfully");

      setRowMenuAnchorEl(null);

      fetchEmployees(); // Refresh table
    } else {
      setToastMessage(res.data.message);
    }
  } catch (err) {
    console.log(err);
    setToastMessage("Delete Failed");
  }
};


  

  const togglePermission = (key) => {
    if (
      !adminUser ||
      !can("permissions.manage") ||
      isAdminUser(permissionEmployee)
    ) {
      return;
    }

    setPermissionForm((prev) =>
      prev.includes(key)
        ? prev.filter((p) => p !== key)
        : [...prev, key]
    );
  };

  const handleSavePermissions = async () => {
    if (
      !permissionEmployee ||
      !adminUser ||
      !can("permissions.manage")
    ) {
      setToastMessage("You do not have permission to manage user permissions");
      return;
    }

    if (isAdminUser(permissionEmployee)) {
      setToastMessage("Administrator permissions cannot be changed.");
      return;
    }
    try {
      setSavingPermissions(true);
      const res = await axios.post("https://website-vltl.onrender.com/webservices/users/update-user", {
        id: permissionEmployee.id ?? permissionEmployee.user_id,
        user_id: permissionEmployee.id ?? permissionEmployee.user_id,
        name: permissionEmployee.name,
        email: permissionEmployee.email,
        role: permissionEmployee.designation || permissionEmployee.role,
        user_type: permissionEmployee.user_type || 2,
        department: permissionEmployee.department || null,
        joining_date: permissionEmployee.joining_date || permissionEmployee.joined_date || permissionEmployee.joinedDate || null,
        joined_date: permissionEmployee.joining_date || permissionEmployee.joined_date || permissionEmployee.joinedDate || null,
        designation: permissionEmployee.designation,
        attendance: permissionEmployee.attendance,
        status: permissionEmployee.status ?? 1,
        added_by: user?.id || 1,
        permissions: [...new Set(permissionForm)],
      });
      if (res.data.status === 1) {
        setToastMessage("Permissions updated successfully");
        setPermissionModalOpen(false);
        setPermissionEmployee(null);
        setPermissionForm([]);
        fetchEmployees();
      } else {
        setToastMessage(res.data.message || "Permission update failed");
      }
    } catch (err) {
      console.error("Permission update error:", err);
      setToastMessage("Permission update failed");
    } finally {
      setSavingPermissions(false);
    }
  };

  // Export Data Download Trigger
const handleExportData = async () => {
  if (!can("reports.export")) { setToastMessage("You do not have permission to export reports"); return; }
  try {
    const res = await axios.get("https://website-vltl.onrender.com/dashboard/report");

    console.log(res.data);

    if (res.data.status === 1) {
      const link = document.createElement("a");
      link.href = res.data.file;
      link.setAttribute("download", "employee-report.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setReportModalOpen(false);
      setToastMessage("Report downloaded successfully!");
    } else {
      alert("Report generation failed.");
    }
  } catch (err) {
    console.error(err);
  }
};


const saveNote = async () => {
  if (!can("notes.create")) { setToastMessage("You do not have permission to create notes"); return; }
  if (!quickNote.trim()) return;

  try {
    const res = await axios.post(
      "https://website-vltl.onrender.com/admin-notes/add",
      {
        note: quickNote,
      }
    );

    if (res.data.status === 1) {
      setQuickNote("");
      fetchNotes();
      setToastMessage("Note added successfully!");
    }
  } catch (err) {
    console.log(err);
  }
};



const markNotificationAsRead = async (id) => {
  if (!id || !can("notifications.read")) return;

  try {
    const res = await axios.post(
      "https://website-vltl.onrender.com/notifications/read",
      { id }
    );

    if (res.data.status === 1) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: 1 }
            : notification
        )
      );
    }
  } catch (err) {
    console.log("Mark notification error:", err);
  }
};

const handleNotificationClick = async (notification) => {
  if (!notification) return;

  await markNotificationAsRead(notification.id);
  setNotifAnchorEl(null);

  const target =
    notification.link ||
    notification.url ||
    notification.path ||
    notification.route;

  if (target && typeof target === "string") {
    if (/^https?:\/\//i.test(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
    } else {
      navigate(target);
    }
  }
};

const getNotificationSubtitle = (notification, now = currentTime) => {
  if (!notification) return "Notification";

  const rawDate =
    notification.created_at ||
    notification.createdAt ||
    notification.timestamp ||
    notification.date ||
    notification.time;

  if (!rawDate) return "Notification";

  const notificationDate = new Date(rawDate);
  if (Number.isNaN(notificationDate.getTime())) {
    return String(rawDate);
  }

  const diffMs = Math.max(0, now.getTime() - notificationDate.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return notificationDate.toLocaleDateString();
};

  // Filtered employees for real-time search & status tabs
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      String(emp.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(emp.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(emp.designation || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
  statusFilter === "All" ||
  emp.attendance === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // THEME COLOR TOKENS
  // Modern SaaS / real-website color system.
  const bgPageGradient = darkMode
    ? "linear-gradient(135deg, #020617 0%, #0B1220 55%, #111827 100%)"
    : "radial-gradient(circle at 88% 8%, rgba(147,197,253,0.28) 0%, rgba(147,197,253,0.10) 18%, transparent 42%), radial-gradient(circle at 14% 82%, rgba(186,230,253,0.24) 0%, transparent 34%), linear-gradient(135deg, #DBE8F7 0%, #E8F1FB 42%, #DCE9F8 72%, #EDF4FC 100%)";

  const bgSidebarGradient = darkMode
    ? "linear-gradient(180deg, #0B1220 0%, #111827 55%, #020617 100%)"
    : "linear-gradient(180deg, #0F172A 0%, #172554 55%, #0F172A 100%)";

  const textPrimary = darkMode ? "#F8FAFC" : "#0F172A";
  const textSecondary = darkMode ? "#94A3B8" : "#475569";
  const lineDivider = darkMode
    ? "rgba(148,163,184,0.14)"
    : "rgba(15,23,42,0.10)";

  // Reusable interaction style for a polished, real-world dashboard.
  const interactiveCardSx = {
    transition:
      "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease, border-color 0.28s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: darkMode
        ? "0 18px 45px rgba(0,0,0,0.32)"
        : "0 18px 45px rgba(37,99,235,0.14)",
    },
  };

const adminUser = isAdminUser(user);

/*
 * Central permission check.
 *
 * User Roles permissions are authoritative when the logged-in
 * user's role exists in employee_management_roles.
 */
const can = (permission) => canUser(user, permission);


  // Sidebar Menu Configuration
 const sidebarItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    permission: "dashboard.view",
  },
  {
    text: "Employees",
    icon: <PeopleIcon />,
    path: "/employees",
    permission: "employees.view",
  },
  {
    text: "Profile",
    icon: <PersonIcon />,
    path: "/profile",
    permission: "profile.view",
  },
  {
    text: "Edit Profile",
    icon: <EditIcon />,
    path: "/edit-profile",
    permission: "profile.edit",
  },
  {
    text: "Change Password",
    icon: <LockIcon />,
    path: "/change-password",
    permission: "password.change",
  },
  {
    text: "User Roles",
    icon: <PeopleIcon />,
    path: "/user-roles",
    permission: "permissions.manage",
  },
];

const visibleSidebarItems = sidebarItems.filter(
  (item) => can(item.permission)
);


  // Key Performance Stats Data
 const stats = [
  {
    title: "Total Employees",
    value: dashboardStats.totalEmployees,
    change: "Live",
    color: "#2563EB",
  },
  {
    title: "Departments",
    value: dashboardStats.totalDepartments,
    change: "Live",
    color: "#14B8A6",
  },
  {
    title: "Present Today",
    value: dashboardStats.presentEmployees,
    change: "Attendance",
    color: "#F59E0B",
  },
  {
    title: "Absent Today",
    value: dashboardStats.absentEmployees,
    change: "Attendance",
    color: "#EF4444",
  },
];

// Load the authenticated user first.
useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "https://website-vltl.onrender.com/auth/me",
        {
          withCredentials: true,
        }
      );

      console.log("AUTH USER:", response.data.user);
      setUser(response.data.user);
    } catch (err) {
      console.error("Auth error:", err);
      navigate("/");
    }
  };

  fetchUser();
}, [navigate]);

// Keep role/permission changes made in User Roles live on this page.
useEffect(() => {
  const refreshPermissions = () => {
    setPermissionVersion((current) => current + 1);
  };

  window.addEventListener("ems:roles-changed", refreshPermissions);
  window.addEventListener("ems:permissions-changed", refreshPermissions);
  window.addEventListener("storage", refreshPermissions);

  return () => {
    window.removeEventListener("ems:roles-changed", refreshPermissions);
    window.removeEventListener("ems:permissions-changed", refreshPermissions);
    window.removeEventListener("storage", refreshPermissions);
  };
}, []);

// Load dashboard data only after the authenticated user's permissions are known.
useEffect(() => {
  if (!user) return;
  if (!can("dashboard.view")) return;

  // Load saved Employee Roles from the database.
  // These roles are reused when adding employees.
  fetchEmployeeRoles();

  const admin = isAdminUser(user);

  console.log("CURRENT USER:", user);
  console.log("IS ADMIN:", admin);
  console.log("PERMISSIONS:", user?.permissions);

  // Dashboard Statistics
  if (can("dashboard.stats")) {
    fetchDashboardStats();
  }

  // Department chart
  if (can("dashboard.department")) {
    fetchDepartmentChart();
  }

  // Performance
  if (can("dashboard.performance")) {
    fetchPerformance();
  }

  // Dashboard employee roster
  if (can("dashboard.roster.view")) {
    fetchEmployees();
  }

  // Meetings
  if (can("meetings.view")) {
    fetchMeeting();
  }

  // Admin Notes
  if (can("notes.view")) {
    fetchNotes();
  }

  // Audit Logs
  if (can("audit.view")) {
    fetchAuditLogs();
  }

  // Notifications
  if (can("notifications.view")) {
    fetchNotifications();
  }
}, [user, permissionVersion]);

// PAGE-MATCHING BLUE & CYAN THEME COLORS FOR PIE CHART
const COLORS = [
  "#3B82F6", // Blue
  "#14B8A6", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#2563EB", // Cyan
  "#EC4899", // Pink
  "#84CC16", // Lime
];


const departmentChartData = chartData.filter((item) => {
  const department = String(item?.department || "").trim().toLowerCase();
  return department && department !== "total";
});

const departmentTotal = departmentChartData.reduce(
  (sum, item) => sum + Number(item.total || 0),
  0
);


 
  if (user && !can("dashboard.view")) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          background: bgPageGradient,
          color: textPrimary,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Box sx={{
          maxWidth: 520, width: "100%", p: 5, borderRadius: "28px",
          textAlign: "center",
          backgroundColor: darkMode ? "rgba(15,23,42,.86)" : "rgba(255,255,255,.88)",
          border: `1px solid ${lineDivider}`,
          boxShadow: darkMode ? "0 24px 60px rgba(0,0,0,.28)" : "0 24px 60px rgba(37,99,235,.12)",
          backdropFilter: "blur(16px)",
        }}>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>Access Denied</Typography>
          <Typography sx={{ color: textSecondary, mb: 3 }}>
            You do not have permission to view the Dashboard.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")} sx={{
            borderRadius: "14px", textTransform: "none", fontWeight: 800, px: 3
          }}>
            Return to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (

    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        background: bgPageGradient,
        backgroundAttachment: "fixed",
        color: textPrimary,
        transition: "background 0.4s ease, color 0.4s ease",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* LEFT SIDEBAR NAVIGATION */}
      <Box
        sx={{
          width: 250,
          background: bgSidebarGradient,
          borderRight: `1px solid ${lineDivider}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2.5,
          position: "fixed",
          height: "100vh",
          boxSizing: "border-box",
          zIndex: 10,
          boxShadow: "10px 0 35px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box>
                  {/* BRAND LOGO */}
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
                        boxShadow: "0 8px 24px rgba(37, 99, 235, 0.45)",
                      }}
                    >
                      E
                    </Box>
                    <Typography variant="h6" fontWeight="800" letterSpacing={0.5} sx={{ color: "#FFFFFF" }}>
                      EMS Portal
                    </Typography>
                  </Box>
          {/* SIDEBAR MENU ITEMS */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {visibleSidebarItems.map((item) => {
              const isActive = activeTab === item.text;
              return (
                <Button
                  key={item.text}
                  fullWidth
                  startIcon={React.cloneElement(item.icon, {
                    style: { color: isActive ? "#FFFFFF" : "#CBD5E1", fontSize: "20px" },
                  })}
                  onClick={() => {
                    setActiveTab(item.text);
                    if (item.path !== "/dashboard") navigate(item.path);
                  }}
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
                    boxShadow: isActive ? "0 6px 18px rgba(2, 132, 199, 0.45)" : "none",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: isActive ? "#1E40AF" : "rgba(255, 255, 255, 0.12)",
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

        {/* LOGOUT BUTTON */}
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
            backgroundColor: "rgba(239, 68, 68, 0.18)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(239, 68, 68, 0.3)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Logout Session
        </Button>
      </Box>

      {/* MAIN OPEN CONTENT AREA */}
      <Box
        sx={{
          flex: 1,
          ml: "250px",
          p: { xs: 3, md: 5 },
          boxSizing: "border-box",
                }}
      >
        {/* TOP NAVIGATION HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
            width: "100%",
            mb: 5,
          }}
        >
          {/* SEARCH BAR */}
          <Box
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              maxWidth: 480,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search team members, departments, or roles..."
              size="small"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                searchEmployees(value);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  borderRadius: "24px",
                  backgroundColor: darkMode
                    ? "rgba(15, 23, 42, 0.6)"
                    : "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  color: textPrimary,
                  fontSize: "14px",
                  boxShadow: "0 4px 20px rgba(37, 99, 235, 0.08)",
                  transition: "all 0.3s ease",
                  "& fieldset": {
                    borderColor: lineDivider,
                  },
                  "&:hover fieldset": {
                    borderColor: "#2563EB",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2563EB",
                    boxShadow: "0 0 16px rgba(37, 99, 235, 0.35)",
                  },
                },
                "& .MuiInputBase-input": {
                  color: textPrimary,
                },
                "& .MuiInputBase-input::placeholder": {
                  color: darkMode ? "#94A3B8" : "#64748B",
                  opacity: 1,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: textSecondary, fontSize: "20px" }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* TOP RIGHT ACTIONS: DARK MODE + NOTIFICATIONS + AVATAR */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1.25,
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            {/* DARK / LIGHT MODE */}
            <Tooltip
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <IconButton
                onClick={toggleTheme}
                sx={{
                  width: 44,
                  height: 44,
                  p: 0,
                  borderRadius: "14px",
                  backgroundColor: darkMode
                    ? "rgba(30, 41, 59, 0.9)"
                    : "rgba(224, 242, 254, 0.9)",
                  color: textPrimary,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: darkMode
                      ? "rgba(51, 65, 85, 1)"
                      : "rgba(186, 230, 253, 1)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                {darkMode ? (
                  <LightModeIcon sx={{ fontSize: 21, color: textPrimary }} />
                ) : (
                  <DarkModeIcon sx={{ fontSize: 21, color: textPrimary }} />
                )}
              </IconButton>
            </Tooltip>

            {/* NOTIFICATIONS */}
            {can("notifications.view") && (
              <>
                <Tooltip title="Notifications">
                  <IconButton
                    onClick={(e) => {
                      setNotifAnchorEl(e.currentTarget);
                      fetchNotifications();
                    }}
                    sx={{
                      width: 44,
                      height: 44,
                      p: 0,
                      borderRadius: "14px",
                      backgroundColor: darkMode
                        ? "rgba(30, 41, 59, 0.9)"
                        : "rgba(224, 242, 254, 0.9)",
                      color: textPrimary,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: darkMode
                          ? "rgba(51, 65, 85, 1)"
                          : "rgba(186, 230, 253, 1)",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      invisible={unreadCount === 0}
                      sx={{
                        "& .MuiBadge-badge": {
                          minWidth: 18,
                          height: 18,
                          fontSize: 10,
                          fontWeight: 800,
                          top: 1,
                          right: 1,
                        },
                      }}
                    >
                      <NotificationsNoneIcon
                        sx={{ color: textPrimary, fontSize: 21 }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* NOTIFICATION MENU */}
                <Menu
                  anchorEl={notifAnchorEl}
                  open={Boolean(notifAnchorEl)}
                  onClose={() => setNotifAnchorEl(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: "20px",
                      width: 360,
                      maxWidth: "calc(100vw - 24px)",
                      maxHeight: 520,
                      p: 1,
                      backgroundColor: darkMode
                        ? "#0B1220 !important"
                        : "#FFFFFF !important",
                      color: textPrimary,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="800"
                    sx={{ p: 1.5, fontSize: "16px" }}
                  >
                    Notifications & Alerts
                  </Typography>

                  <Divider sx={{ my: 1, borderColor: lineDivider }} />

                  {notificationLoading ? (
                    <MenuItem disabled>
                      <Typography variant="body2">
                        Loading notifications...
                      </Typography>
                    </MenuItem>
                  ) : notifications.length === 0 ? (
                    <MenuItem disabled>
                      <Typography variant="body2">
                        No notifications
                      </Typography>
                    </MenuItem>
                  ) : (
                    notifications.map((notification, index) => (
                      <MenuItem
                        key={notification.id || index}
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          borderRadius: 0,
                          p: 1.8,
                          mb: 0,
                          alignItems: "flex-start",
                          borderBottom: `1px solid ${lineDivider}`,
                          backgroundColor:
                            Number(notification.is_read) === 0
                              ? darkMode
                                ? "rgba(30,41,59,0.95)"
                                : "#F8FAFC"
                              : "transparent",
                        }}
                      >
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              lineHeight: 1.35,
                              fontWeight: 800,
                              color: darkMode ? "#F8FAFC" : "#172033",
                              mb: 0.4,
                            }}
                          >
                            {notification.title ||
                              notification.message ||
                              notification.type ||
                              "Notification"}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.55,
                              color: "#1D4ED8",
                              fontWeight: 600,
                              fontSize: "12px",
                            }}
                          >
                            {getNotificationSubtitle(notification, currentTime)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Menu>
              </>
            )}

            {/* USER PROFILE AVATAR + NAME */}
            <Box
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                cursor: "pointer",
                flexShrink: 0,
                minWidth: "fit-content",
              }}
            >
              <Avatar
                src={user?.profile_pic}
                alt={user?.name}
                sx={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  border: "2px solid #2563EB",
                  boxShadow: "0 0 12px rgba(37,99,235,0.4)",
                  backgroundColor: darkMode ? "#475569" : "#BDBDBD",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>

              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  minWidth: 80,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    
                    color: textPrimary,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: textSecondary,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.role}
                </Typography>
              </Box>
            </Box>

            {/* PROFILE MENU */}
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={() => setProfileAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: "18px",
                  width: 190,
                  p: 1,
                  backgroundColor: darkMode
                    ? "#0B1220 !important"
                    : "#FFFFFF !important",
                  color: textPrimary,
                },
              }}
            >
              {can("profile.view") && (
                <MenuItem
                  onClick={() => {
                    setProfileAnchorEl(null);
                    navigate("/profile");
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  My Profile
                </MenuItem>
              )}

              {can("profile.edit") && (
                <MenuItem
                  onClick={() => {
                    setProfileAnchorEl(null);
                    navigate("/edit-profile");
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  Edit Profile
                </MenuItem>
              )}

              {can("password.change") && (
                <MenuItem
                  onClick={() => {
                    setProfileAnchorEl(null);
                    navigate("/change-password");
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  Change Password
                </MenuItem>
              )}

              <Divider sx={{ my: 1, borderColor: lineDivider }} />

              <MenuItem
                onClick={() => navigate("/")}
                sx={{ color: "#FF4D4D !important", fontWeight: 800 }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* ITEM 1: OPEN HERO SHOWCASE */}
        <Box
          sx={{
            p: { xs: 4, md: 5 },
            mb: 6,
            borderRadius: "36px",
            background: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 52%, #0F172A 100%)",
            color: "#FFFFFF",
            boxShadow: "0 20px 50px rgba(15,23,42,0.20)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Chip label="Real-Time Performance Engine" size="small" sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#FFFFFF", fontWeight: 800 }} />
                <Typography variant="caption" sx={{  ml:4,color: "#031119", fontWeight: 600 }}>
                  Friday, July 31, 2026
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="900" sx={{ mb: 2, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
               Welcome Back, {user?.name || "User"} 👋
              </Typography>
              <Typography sx={{ color: "#EFF6FF", fontSize: "16px", mb: 4, maxWidth: "620px", lineHeight: 1.6 }}>
                Track real-time engineering velocity movement, manage cross-department team members, and review daily audit logs in your workspace.
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap">
                {can("dashboard.roster.add") && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={async () => {
                    setNewEmpRole("");
                    await fetchEmployeeRoles();
                    setAddModalOpen(true);
                  }}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    color: "#1E40AF",
                    borderRadius: "18px",
                    px: 3.5,
                    py: 1.4,
                    fontWeight: 800,
                    fontSize: "14px",
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    "&:hover": {
                      backgroundColor: "#F8FAFC",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                    },
                  }}
                >
                  Add Employee
                </Button>
                )}
                {can("reports.view") && (
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => setReportModalOpen(true)}
                  sx={{
                    ml:6,
                    color: "#FFFFFF",
                    borderColor: "rgba(255, 255, 255, 0.45)",
                    borderRadius: "18px",
                    px: 3.5,
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "none",
                    "&:hover": { borderColor: "#FFFFFF", backgroundColor: "rgba(255, 255, 255, 0.15)" },
                  }}
                >
                  Generate Report
                </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {can("dashboard.stats") && (
        <>
        {/* ITEM 2: ORGANIC KPI STRIP */}
        <Grid
          container
          spacing={{ xs: 2, md: 2.5 }}
          sx={{
            mb: 6,
            position: "relative",
          }}
        >
          {stats.map((st, statIndex) => {
            const statIcons = [PeopleIcon, DashboardIcon, ElectricBoltIcon, CloseIcon];
            const StatIcon = statIcons[statIndex] || DashboardIcon;

            return (
              <Grid item xs={12} sm={6} lg={3} key={st.title}>
                <Box
                  sx={{
                    minHeight: 148,
                    p: { xs: 2.5, md: 3 },
                    position: "relative",
                    overflow: "hidden",
                    borderRadius:
                      statIndex % 2 === 0
                        ? "28px 44px 30px 48px"
                        : "42px 28px 46px 30px",
                    background:
                      darkMode
                        ? statIndex === 0
                          ? "linear-gradient(135deg, rgba(37,99,235,.24), rgba(15,23,42,.75))"
                          : statIndex === 1
                          ? "linear-gradient(135deg, rgba(20,184,166,.22), rgba(15,23,42,.75))"
                          : statIndex === 2
                          ? "linear-gradient(135deg, rgba(245,158,11,.18), rgba(15,23,42,.75))"
                          : "linear-gradient(135deg, rgba(239,68,68,.18), rgba(15,23,42,.75))"
                        : statIndex === 0
                        ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
                        : statIndex === 1
                        ? "linear-gradient(135deg, #ECFDF5 0%, #CCFBF1 100%)"
                        : statIndex === 2
                        ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
                        : "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
                    boxShadow: darkMode
                      ? "0 16px 35px rgba(0,0,0,.18)"
                      : "0 16px 35px rgba(15,23,42,.07)",
                    transition:
                      "transform .28s ease, box-shadow .28s ease, border-radius .28s ease",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      right: -42,
                      top: -42,
                      background: `${st.color}22`,
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: 90,
                      height: 12,
                      borderRadius: "50%",
                      left: 28,
                      bottom: -7,
                      background: `${st.color}20`,
                      filter: "blur(5px)",
                    },
                    "&:hover": {
                      transform: "translateY(-7px)",
                      borderRadius:
                        statIndex % 2 === 0
                          ? "42px 30px 46px 28px"
                          : "30px 44px 28px 46px",
                      boxShadow: darkMode
                        ? `0 22px 45px ${st.color}25`
                        : `0 22px 45px ${st.color}22`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: darkMode ? "#CBD5E1" : "#475569",
                          fontSize: "12px",
                          fontWeight: 800,
                          letterSpacing: ".04em",
                          textTransform: "uppercase",
                          mb: 1,
                        }}
                      >
                        {st.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: textPrimary,
                          fontSize: { xs: 32, md: 36 },
                          lineHeight: 1,
                          fontWeight: 900,
                          letterSpacing: "-.04em",
                        }}
                      >
                        {st.value}
                      </Typography>

                      <Box sx={{ mt: 1.7, display: "flex", alignItems: "center", gap: .8 }}>
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: st.color,
                            boxShadow: `0 0 0 5px ${st.color}18`,
                          }}
                        />
                        <Typography
                          sx={{
                            color: st.color,
                            fontSize: "11px",
                            fontWeight: 900,
                          }}
                        >
                          {st.change}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        borderRadius: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: darkMode
                          ? `${st.color}20`
                          : `${st.color}18`,
                        color: st.color,
                        transition: "transform .25s ease",
                        ".MuiBox-root:hover &": {
                          transform: "rotate(-6deg) scale(1.08)",
                        },
                      }}
                    >
                      <StatIcon sx={{ fontSize: 23 }} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        </>
        )}

        {can("dashboard.department") && (
          <Box
            sx={{
              mt: 2,
              mb: 6,
              position: "relative",
              overflow: "hidden",
              px: { xs: 2.5, md: 4.5 },
              py: { xs: 3, md: 4 },
              borderRadius: "34px",
              background: darkMode
                ? "linear-gradient(135deg, rgba(15,23,42,.92), rgba(30,41,59,.78))"
                : "linear-gradient(135deg, rgba(255,255,255,.72), rgba(232,242,255,.62))",
              border: `1px solid ${
                darkMode ? "rgba(148,163,184,.12)" : "rgba(37,99,235,.08)"
              }`,
              boxShadow: darkMode
                ? "0 22px 55px rgba(0,0,0,.20)"
                : "0 22px 55px rgba(15,23,42,.07)",
              backdropFilter: "blur(16px)",
              transition: "transform .3s ease, box-shadow .3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: darkMode
                  ? "0 28px 65px rgba(0,0,0,.25)"
                  : "0 28px 65px rgba(15,23,42,.09)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                width: 330,
                height: 330,
                right: -130,
                bottom: -190,
                borderRadius: "50%",
                background: darkMode
                  ? "rgba(37,99,235,.07)"
                  : "rgba(37,99,235,.06)",
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                width: 210,
                height: 210,
                left: -130,
                bottom: -130,
                borderRadius: "50%",
                background: darkMode
                  ? "rgba(20,184,166,.05)"
                  : "rgba(20,184,166,.07)",
                pointerEvents: "none",
              },
            }}
          >
            <Grid container spacing={{ xs: 3, md: 1 }} alignItems="center">
              <Grid item xs={12} md={5}>
                <Box sx={{ position: "relative", zIndex: 2, pr: { md: 4 } }}>
                  <Typography
                    sx={{
                      color: "#2563EB",
                      fontSize: "11px",
                      fontWeight: 900,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                      mb: 1.2,
                    }}
                  >
                    Workforce Overview
                  </Typography>

                  <Typography
                    sx={{
                      color: textPrimary,
                      fontSize: { xs: 27, md: 34 },
                      lineHeight: 1.08,
                      fontWeight: 900,
                      letterSpacing: "-.045em",
                      mb: 1.5,
                    }}
                  >
                    Employees by Department
                  </Typography>

                  <Typography
                    sx={{
                      color: textSecondary,
                      fontSize: 14,
                      lineHeight: 1.7,
                      maxWidth: 430,
                    }}
                  >
                    Understand how your workforce is distributed across teams
                    and departments at a glance.
                  </Typography>

                  <Box
                    sx={{
                      mt: 3,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1.1,
                      borderRadius: "999px",
                      backgroundColor: darkMode
                        ? "rgba(37,99,235,.13)"
                        : "rgba(37,99,235,.08)",
                      color: "#2563EB",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 17 }} />
                    {departmentTotal || dashboardStats.totalEmployees} Employees
                  </Box>

                  <Box
                    sx={{
                      mt: 4,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {departmentChartData.slice(0, 4).map((entry, index) => (
                      <Box
                        key={`mini-${entry.department}-${index}`}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: .7,
                          px: 1.2,
                          py: .7,
                          borderRadius: "12px",
                          backgroundColor: darkMode
                            ? "rgba(255,255,255,.04)"
                            : "rgba(15,23,42,.035)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <Typography
                          sx={{
                            color: textSecondary,
                            fontSize: 10.5,
                            fontWeight: 800,
                          }}
                        >
                          {entry.department}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "minmax(280px, 1fr) 220px",
                    },
                    alignItems: "center",
                    gap: { xs: 2, sm: 3 },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 300, sm: 330 },
                      minWidth: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 270, sm: 310 },
                        height: { xs: 270, sm: 310 },
                        maxWidth: "100%",
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentChartData}
                            dataKey="total"
                            nameKey="department"
                            cx="50%"
                            cy="50%"
                            innerRadius={76}
                            outerRadius={125}
                            paddingAngle={4}
                            cornerRadius={7}
                            stroke="none"
                            isAnimationActive
                          >
                            {departmentChartData.map((entry, index) => (
                              <Cell
                                key={`${entry.department}-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} employees`,
                              name,
                            ]}
                            contentStyle={{
                              borderRadius: 14,
                              border: "none",
                              boxShadow: "0 14px 35px rgba(15,23,42,.15)",
                              backgroundColor: darkMode ? "#111827" : "#FFFFFF",
                              color: textPrimary,
                              fontWeight: 700,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <Box
                        sx={{
                          position: "relative",
                          mt: { xs: -184, sm: -204 },
                          textAlign: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <Typography
                          sx={{
                            color: textPrimary,
                            fontSize: { xs: 29, sm: 33 },
                            lineHeight: 1,
                            fontWeight: 900,
                            letterSpacing: "-.04em",
                          }}
                        >
                          {departmentTotal || dashboardStats.totalEmployees}
                        </Typography>
                        <Typography
                          sx={{
                            color: textSecondary,
                            fontSize: 10,
                            fontWeight: 900,
                            letterSpacing: ".08em",
                            mt: .7,
                          }}
                        >
                          EMPLOYEES
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 220,
                      justifySelf: "center",
                      display: "flex",
                      flexDirection: "column",
                      gap: .8,
                    }}
                  >
                    {departmentChartData.map((entry, index) => {
                      const total = departmentTotal || 1;
                      const percentage = Math.round(
                        (Number(entry.total || 0) / total) * 100
                      );

                      return (
                        <Box
                          key={`legend-${entry.department}-${index}`}
                          sx={{
                            py: 1.05,
                            px: 1.3,
                            borderRadius: "14px",
                            backgroundColor: darkMode
                              ? "rgba(255,255,255,.035)"
                              : "rgba(248,252,255,.68)",
                            border: `1px solid ${
                              darkMode
                                ? "rgba(148,163,184,.07)"
                                : "rgba(15,23,42,.06)"
                            }`,
                            transition:
                              "transform .2s ease, background-color .2s ease",
                            "&:hover": {
                              transform: "translateX(5px)",
                              backgroundColor: darkMode
                                ? "rgba(37,99,235,.10)"
                                : "rgba(239,246,255,.90)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: .9,
                                minWidth: 0,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 9,
                                  height: 9,
                                  flexShrink: 0,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              />
                              <Typography
                                sx={{
                                  color: textPrimary,
                                  fontSize: 11.5,
                                  fontWeight: 800,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {entry.department}
                              </Typography>
                            </Box>

                            <Typography
                              sx={{
                                color: textPrimary,
                                fontSize: 12,
                                fontWeight: 900,
                                flexShrink: 0,
                              }}
                            >
                              {entry.total}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              mt: .8,
                              height: 4,
                              borderRadius: 999,
                              backgroundColor: darkMode
                                ? "rgba(148,163,184,.10)"
                                : "rgba(15,23,42,.06)",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${percentage}%`,
                                height: "100%",
                                borderRadius: 999,
                                backgroundColor:
                                  COLORS[index % COLORS.length],
                                transition: "width .6s ease",
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {can("dashboard.performance") && (
        <>
        {/* ITEM 3: TEAM PERFORMANCE MOVEMENT GRAPH */}
        <Box
          sx={{
            mt: 2,
            mb: 7,
            py: 4,
            px: { xs: 2, md: 3 },
            position: "relative",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.45)",
                }}
              >
                <ElectricBoltIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="900" sx={{ color: textPrimary, fontSize: "24px" }}>
                  Team Performance Movement & Velocity
                </Typography>
                <Typography variant="body2" sx={{mb:4, color: textSecondary, mt: 0.3, fontSize: "14px" }}>
                  Live electric wave curve • Currently viewing <strong>{graphTimeframe}</strong>
                </Typography>
              </Box>
            </Box>

            {/* ELECTRIC CYAN TIMEFRAME BUTTONS */}
            <Box display="flex" gap={1.5}>
              {["3 Months", "6 Months", "1 Year"].map((tf) => (
                <Chip
                  key={tf}
                  label={tf}
                  clickable
                  onClick={() => {
                    setGraphTimeframe(tf);
                    setToastMessage(`Switched movement graph to ${tf}!`);
                  }}
                  sx={{
                    fontWeight: 800,
                    fontSize: "13px",
                    px: 2.2,
                    py: 2.3,
                    borderRadius: "16px",
                    backgroundColor: graphTimeframe === tf ? "#2563EB" : darkMode ? "rgba(30,41,59,0.7)" : "rgba(224,242,254,0.8)",
                    color: graphTimeframe === tf ? "#FFFFFF" : textPrimary,
                    boxShadow: graphTimeframe === tf ? "0 6px 20px rgba(37,99,235,0.45)" : "none",
                    transition: "all 0.25s ease",
                    "&:hover": { backgroundColor: "#1D4ED8", color: "#FFFFFF", transform: "translateY(-2px)" },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* DYNAMIC ELECTRIC CYAN SVG WAVE CANVAS WITH GENEROUS HEIGHT & SPACING */}
          <Box
            sx={{
              width: "100%",
              height: { xs: 220, md: 250 },
              position: "relative",
              my: 3,
              borderRadius: "28px",
              background: darkMode
                ? "linear-gradient(180deg, rgba(15,23,42,.40), rgba(15,23,42,.12))"
                : "linear-gradient(180deg, rgba(255,255,255,.48), rgba(239,246,255,.20))",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="electricWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* GRID LINES */}
              <line x1="0" y1="40" x2="500" y2="40" stroke={lineDivider} strokeDasharray="6 6" />
              <line x1="0" y1="95" x2="500" y2="95" stroke={lineDivider} strokeDasharray="6 6" />
              <line x1="0" y1="150" x2="500" y2="150" stroke={lineDivider} strokeDasharray="6 6" />

              {/* ELECTRIC AREA WAVE */}
              <path
                d={currentGraphData.pathArea}
                fill="url(#electricWaveGrad)"
                style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />

              {/* ELECTRIC CYAN STROKE CURVE */}
              <path
                d={currentGraphData.pathLine}
                fill="none"
                stroke="#2563EB"
                strokeWidth="5"
                style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", filter: "drop-shadow(0 6px 16px rgba(37,99,235,0.6))" }}
              />

              {/* EMERALD GREEN MOVEMENT PULSE POINTS */}
{currentGraphData?.pts?.map((pt, idx) => (                <g key={idx}>
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r={idx === currentGraphData.pts.length - 1 ? 8.5 : 6}
                    fill={idx === currentGraphData.pts.length - 1 ? "#14B8A6" : "#2563EB"}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    style={{ transition: "all 0.6s ease" }}
                  />
                </g>
              ))}
            </svg>

            {/* MONTH TIMELINE LABELS */}
            <Box display="flex" justifyContent="space-between" px={1} mt={2}>
{currentGraphData?.labels?.map((lbl) => (
                <Typography key={lbl} variant="caption" fontWeight="800" sx={{ color: textSecondary, fontSize: "14px" }}>
                  {lbl}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* DYNAMIC METRIC PILLS */}
          <Grid container spacing={3.5} mt={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 3, borderRadius: "24px 38px 24px 38px", borderLeft: "4px solid #14B8A6", backgroundColor: darkMode ? "rgba(15,23,42,0.50)" : "rgba(236,253,245,0.62)", transition: "transform .22s ease, box-shadow .22s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 30px rgba(20,184,166,.10)" } }}>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, fontSize: "13px" }}>Sprint Velocity Score</Typography>
                <Typography variant="h6" fontWeight="900" sx={{ color: "#14B8A6", mt: 0.5, fontSize: "20px" }}>{currentGraphData?.velocity}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 3, borderRadius: "38px 24px 38px 24px", borderLeft: "4px solid #2563EB", backgroundColor: darkMode ? "rgba(15,23,42,0.50)" : "rgba(239,246,255,0.68)", transition: "transform .22s ease, box-shadow .22s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 30px rgba(37,99,235,.10)" } }}>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, fontSize: "13px" }}>Code Quality Index</Typography>
                <Typography variant="h6" fontWeight="900" sx={{ color: "#2563EB", mt: 0.5, fontSize: "20px" }}>{currentGraphData?.quality}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 3, borderRadius: "24px 38px 24px 38px", borderLeft: "4px solid #F59E0B", backgroundColor: darkMode ? "rgba(15,23,42,0.50)" : "rgba(255,251,235,0.72)", transition: "transform .22s ease, box-shadow .22s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 30px rgba(245,158,11,.10)" } }}>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, fontSize: "13px" }}>Completed Tasks</Typography>
                <Typography variant="h6" fontWeight="900" sx={{ color: "#F59E0B", mt: 0.5, fontSize: "20px" }}>{currentGraphData?.tasks}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
  <Box
    sx={{
      p: 3,
      borderRadius: "22px",
      borderLeft: "5px solid #8B5CF6",
      backgroundColor: darkMode
        ? "rgba(15,23,42,0.6)"
        : "rgba(243,232,255,0.8)",
    }}
  >
    <Typography
      variant="caption"
      fontWeight="700"
      sx={{ color: textSecondary, fontSize: "13px" }}
    >
      Performance Trend
    </Typography>

    <Typography
      variant="h6"
      fontWeight="900"
      sx={{ color: "#8B5CF6", mt: 0.5, fontSize: "20px" }}
    >
      {currentGraphData?.trend}
    </Typography>
  </Box>
</Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 7, borderColor: lineDivider }} />
        </>
        )}

        {/* ASYMMETRIC OPEN GRID LAYOUT WITH GENEROUS COLUMN HORIZONTAL SPACING */}
   {/* =========================================================
    EMPLOYEE ROSTER + ADMIN SCRATCHPAD + RIGHT SIDEBAR
    ========================================================= */}

<Grid
  container
  spacing={4}
  alignItems="flex-start"
  sx={{
    width: "100%",
    margin: 0,
    position: "relative",
  }}
>

  {/* =====================================================
      LEFT COLUMN
      Employee Roster + Admin Scratchpad
      ===================================================== */}

  <Grid
    item
    xs={12}
    lg={7}
    sx={{
      minWidth: 0,
      flexBasis: { lg: "58%" },
      maxWidth: { lg: "58%" },
    }}
  >

    {/* ================= EMPLOYEE ROSTER ================= */}

    {can("dashboard.roster.view") && (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        position: "relative",
        mb: 0,
      }}
    >

      {/* ---------- HEADER ---------- */}

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={2}
      >

        <Box>
          <Typography
            variant="h6"
            fontWeight="900"
            sx={{
              color: textPrimary,
              fontSize: "22px",
            }}
          >
            Employee Roster Directory
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: textSecondary,
              fontWeight: 600,
              fontSize: "13px",
              
            }}
          >
            {filteredEmployees.length} active team members registered
          </Typography>
        </Box>


        {/* ---------- FILTER BUTTONS ---------- */}

        <Box
          display="flex"
          gap={1}
          flexWrap="wrap"
        >
          {["All", "Present", "Absent", "On Leave"].map((st) => (
            <Chip
              key={st}
              label={st}
              clickable
              onClick={() => setStatusFilter(st)}
              sx={{
                mt:2,
                ml:2,
                mb:2,
                fontWeight: 800,
                fontSize: "12px",
                borderRadius: "12px",

                backgroundColor:
                  statusFilter === st
                    ? "#2563EB"
                    : darkMode
                    ? "rgba(30,41,59,0.6)"
                    : "rgba(224,242,254,0.7)",

                color:
                  statusFilter === st
                    ? "#FFFFFF"
                    : textPrimary,

                transition: "all 0.2s ease",
              }}
            />
          ))}
        </Box>

      </Box>


      {/* =================================================
          EMPLOYEE TABLE

          IMPORTANT:
          DO NOT USE height: 500 HERE.

          maxHeight only limits the table when there
          are many employees. When there are zero
          employees, the table becomes small naturally.
          ================================================= */}

      <TableContainer
        sx={{
          width: "100%",

          // IMPORTANT:
          // No fixed height here
          height: "auto",

          maxHeight: 500,

          overflowY: "auto",
          overflowX: "auto",

          backgroundColor: darkMode
            ? "rgba(15,23,42,0.52)"
            : "rgba(255,255,255,0.58)",
          borderRadius: "22px",
          border: `1px solid ${lineDivider}`,
          boxShadow: darkMode
            ? "0 10px 30px rgba(0,0,0,0.18)"
            : "0 8px 28px rgba(37,99,235,0.07)",
          backdropFilter: "blur(12px)",
          ...interactiveCardSx,

          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#2563EB",
            borderRadius: "10px",
          },
        }}
      >

        <Table
          size="medium"
          stickyHeader={false}
          sx={{
            minWidth: 700,
          }}
        >

          {/* ---------- TABLE HEADER ---------- */}

          <TableHead>
            <TableRow>

              <TableCell
                sx={{
                  color: textPrimary,
                  fontWeight: 800,
                  borderColor: lineDivider,
                  fontSize: "14px",
                }}
              >
                Employee
              </TableCell>

              <TableCell
                sx={{
                  color: textPrimary,
                  fontWeight: 800,
                  borderColor: lineDivider,
                  fontSize: "14px",
                }}
              >
                Department
              </TableCell>

              <TableCell
                sx={{
                  color: textPrimary,
                  fontWeight: 800,
                  borderColor: lineDivider,
                  fontSize: "14px",
                }}
              >
                Joined Date
              </TableCell>

              <TableCell
                sx={{
                  color: textPrimary,
                  fontWeight: 800,
                  borderColor: lineDivider,
                  fontSize: "14px",
                }}
              >
                Status
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  color: textPrimary,
                  fontWeight: 800,
                  borderColor: lineDivider,
                  fontSize: "14px",
                }}
              >
                Actions
              </TableCell>

            </TableRow>
          </TableHead>


          {/* ---------- TABLE BODY ---------- */}

          <TableBody>

            {filteredEmployees.length > 0 ? (

              filteredEmployees.map((emp) => (

                <TableRow
                  key={emp.id}
                  hover
                  sx={{
                    cursor: "default",
                    transition:
                      "background-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease",
                    "&:hover": {
                      backgroundColor: darkMode
                        ? "rgba(37,99,235,0.10)"
                        : "rgba(224,242,254,0.72)",
                      transform: "translateX(4px)",
                      boxShadow: "inset 4px 0 0 #2563EB",
                    },
                  }}
                >

                  {/* EMPLOYEE */}

                  <TableCell
                    sx={{
                      borderColor: lineDivider,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{
                        color: textPrimary,
                      }}
                    >
                      {emp.name}
                    </Typography>
                  </TableCell>


                  {/* DEPARTMENT */}

                  <TableCell
                    sx={{
                      borderColor: lineDivider,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: textPrimary,
                      }}
                    >
                      {emp.department || "Not Assigned"}
                    </Typography>
                  </TableCell>


                  {/* JOINED DATE */}

                  <TableCell
                    sx={{
                      borderColor: lineDivider,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: textSecondary,
                      }}
                    >
                      {emp.joining_date ||
                        emp.joined_date ||
                        emp.joinedDate ||
                        "Not Available"}
                    </Typography>
                  </TableCell>


                  {/* STATUS */}

                  <TableCell
                    sx={{
                      borderColor: lineDivider,
                    }}
                  >

                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{
                        color:
                          String(
                            emp.attendance || ""
                          ).toLowerCase() === "present"
                            ? "#14B8A6"
                            : String(
                                emp.attendance || ""
                              ).toLowerCase() === "absent"
                            ? "#F59E0B"
                            : "#2563EB",
                      }}
                    >
                      {emp.attendance || "-"}
                    </Typography>

                  </TableCell>


                  {/* ACTIONS */}



<TableCell
  align="right"
  sx={{
    borderColor: lineDivider,
  }}
>
  {(
    can("dashboard.roster.viewProfile") ||
    can("dashboard.roster.edit") ||
    can("dashboard.roster.delete")
  ) && (
    <IconButton
      size="small"
      onClick={(e) => {
        setRowMenuAnchorEl(e.currentTarget);
        setSelectedEmp(emp);
      }}
      sx={{
        color: textSecondary,
      }}
    >
      <MoreVertIcon fontSize="small" />
    </IconButton>
  )}
</TableCell>

                </TableRow>

              ))

            ) : (

              /* =================================================
                 EMPTY STATE

                 Only a small amount of vertical space.
                 This is what removes the huge gap.
                 ================================================= */

              <TableRow>

                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    color: textSecondary,
                    borderColor: lineDivider,

                    // Small empty-state height
                    py: 4,

                    fontSize: "14px",
                  }}
                >
                  No employees found
                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </TableContainer>


      {/* =================================================
          EMPLOYEE MENU
          ================================================= */}

      <Menu
        anchorEl={rowMenuAnchorEl}
        open={Boolean(rowMenuAnchorEl)}
        onClose={() => setRowMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: "18px",
            width: 180,
            p: 1,
            backgroundColor: darkMode
              ? "#0B1220 !important"
              : "#FFFFFF !important",
            color: textPrimary,
          },
        }}
      >

        {can("dashboard.roster.viewProfile") && (
  <MenuItem
    onClick={() => {
      setRowMenuAnchorEl(null);

      if (!selectedEmp) return;

      navigate(`/profile/${selectedEmp.id}`);
    }}
    sx={{
      borderRadius: "10px",
      fontWeight: 700,
      transition: "all 0.18s ease",
      "&:hover": {
        backgroundColor: darkMode
          ? "rgba(37,99,235,0.14)"
          : "rgba(224,242,254,0.9)",
        transform: "translateX(3px)",
      },
    }}
  >
    View Profile
  </MenuItem>
)}


        {can("dashboard.roster.edit") && (
        <MenuItem
          onClick={() => {

            if (!selectedEmp) return;

            setEditEmployee({
              id: selectedEmp.id,
              name: selectedEmp.name,
              email: selectedEmp.email,
              department: selectedEmp.department || "",
              joining_date: selectedEmp.joining_date || selectedEmp.joined_date || selectedEmp.joinedDate || "",
              designation: selectedEmp.designation,
              attendance: selectedEmp.attendance,
            });

            setEditModalOpen(true);
            setRowMenuAnchorEl(null);

          }}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          Edit Details
        </MenuItem>
        )}


      
        {(can("dashboard.roster.edit") || can("dashboard.roster.delete")) && (
          <Divider
            sx={{
              my: 1,
              borderColor: lineDivider,
            }}
          />
        )}

        {can("dashboard.roster.delete") && (
        <MenuItem
          onClick={handleDeleteEmpRow}
          sx={{
            borderRadius: "10px",
            color: "#FF4D4D !important",
            fontWeight: 800,
          }}
        >
          <DeleteIcon
            sx={{
              mr: 1,
              fontSize: 18,
            }}
          />

          Remove

        </MenuItem>
        )}

      </Menu>

    </Box>
    )}


    {/* =====================================================
        ADMIN SCRATCHPAD

        IMPORTANT:
        No ml:30
        No ml:46
        No huge artificial margin
        ===================================================== */}

    {can("notes.view") && (
    <Box
      sx={{
        width: "100%",
        mt: 4,
        pr: { lg: 2 },
      }}
    >

      {/* ---------- TITLE ---------- */}

      <Typography
        variant="h6"
        fontWeight="900"
        sx={{
          color: textPrimary,
          mb: 0.5,
          fontSize: "19px",
        }}
      >
        Admin Scratchpad & Notes
      </Typography>


      <Typography
        variant="caption"
        sx={{
          color: textSecondary,
          display: "block",
          mb: 2,
          fontWeight: 600,
        }}
      >
        Pin session notes & reminders
      </Typography>


      {/* ---------- NOTE INPUT ---------- */}

      {can("notes.create") && (
      <TextField
        placeholder="Type quick reminder..."
        multiline
        rows={3}
        fullWidth
        value={quickNote}
        onChange={(e) => setQuickNote(e.target.value)}
        sx={{
          mb: 2,

          "& .MuiOutlinedInput-root": {
            borderRadius: "18px",

            backgroundColor:
              darkMode
                ? "rgba(15,23,42,0.6)"
                : "rgba(240,249,255,0.8)",

            color: textPrimary,
            fontSize: "14px",

            "& fieldset": {
              borderColor: lineDivider,
            },

            "&:hover fieldset": {
              borderColor: "#2563EB",
            },
          },
        }}
      />
      )}


      {/* ---------- SAVED NOTES ---------- */}

      <Box
        sx={{
          mt: 2,
        }}
      >

        {notes.map((item) => (

          <Paper
            key={item.id}
            sx={{
              p: 2,
              mb: 1,
              borderRadius: "16px",
              backgroundColor: darkMode
                ? "rgba(15,23,42,0.62)"
                : "rgba(248,252,255,0.78)",
              border: `1px solid ${lineDivider}`,
              boxShadow: darkMode
                ? "0 6px 18px rgba(0,0,0,0.16)"
                : "0 6px 18px rgba(37,99,235,0.06)",
              transition:
                "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                borderColor: "#2563EB",
                boxShadow: darkMode
                  ? "0 12px 28px rgba(37,99,235,0.14)"
                  : "0 12px 28px rgba(37,99,235,0.12)",
              },
            }}
          >
            <Typography>
              {item.note}
            </Typography>
          </Paper>

        ))}

      </Box>


      {/* ---------- SAVE BUTTON ---------- */}

      {can("notes.create") && (
  <Button
    fullWidth
    variant="contained"
    onClick={saveNote}
    sx={{
      borderRadius: "14px",
      backgroundColor: "#2563EB",
      fontWeight: 800,
      textTransform: "none",
      py: 1.2,
    }}
  >
    Pin Session Note
  </Button>
)}
</Box>
)}

  </Grid>


  {/* =====================================================
      RIGHT COLUMN
      Live Standups + Recent Audit Timeline

      IMPORTANT:
      No negative margin.
      No ml:126.
      ===================================================== */}

  <Grid
    item
    xs={12}
    lg={5}
    sx={{
      minWidth: 0,

      alignSelf: "flex-start",

      position: "sticky",
      top: 30,

      width: "auto",
      maxWidth: "100%",

      pl: { lg: 2 },

      height: "fit-content",
    }}
  >


   {can("meetings.view") && (
  <>
    {/* =================================================
        LIVE STANDUPS & CALLS
        ================================================= */}
    <Box mb={6}>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
      >

        <Typography
          variant="h6"
          fontWeight="900"
          sx={{
            mb:1,
            color: textPrimary,
            fontSize: "19px",
          }}
        >
          Live Standups & Calls
        </Typography>


        <Chip
          label="Live Now"
          size="small"
          color="error"
          sx={{
            mb:2,
            fontWeight: 800,
            height: 22,
            px: 0.5,
          }}
        />

      </Box>


      <Box
        sx={{
          width:"200%",
          p: 3,
          borderRadius: "22px",
          borderLeft: "5px solid #2563EB",

          backgroundColor:
            darkMode
              ? "rgba(15,23,42,0.6)"
              : "rgba(224,242,254,0.7)",
          boxShadow: darkMode
            ? "0 10px 28px rgba(0,0,0,0.20)"
            : "0 10px 28px rgba(37,99,235,0.08)",
          ...interactiveCardSx,
        }}
      >

        <Box
          display="flex"
          alignItems="center"
          gap={1.8}
          mb={2}
        >

          <Avatar
            sx={{
              
              backgroundColor:
                "rgba(37,99,235,0.2)",

              color: "#2563EB",
              width: 44,
              height: 44,
            }}
          >
            <VideocamIcon />
          </Avatar>


          <Box>

            <Typography
              variant="subtitle2"
              fontWeight="800"
              sx={{
                color: textPrimary,
                fontSize: "15px",
              }}
            >
              {meeting.title}
            </Typography>


            <Typography
              variant="caption"
              sx={{
                color: textSecondary,
                fontWeight: 600,
              }}
            >
              {meeting.time} • {meeting.platform}
            </Typography>

          </Box>

        </Box>


        <Button
          fullWidth
          variant="contained"
          startIcon={<VideocamIcon />}
          onClick={() => {
            if (meeting.link) {
              window.open(
                meeting.link,
                "_blank"
              );
            }
          }}
          sx={{
            borderRadius: "14px",
            backgroundColor: "#2563EB",
            textTransform: "none",
            fontWeight: 800,
            py: 1.2,
          }}
        >
          {meeting.button || "Join Video Call"}
        </Button>

      </Box>

    </Box>
  </>
)}

    {can("audit.view") && (
  <>
    {/* =================================================
        RECENT AUDIT TIMELINE
        ================================================= */}
    <Box>

      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        mb={3}
      >

        <Avatar
          sx={{
            mt:8,
            bgcolor:
              "rgba(37,99,235,0.15)",
            color: "#2563EB",
            width: 42,
            height: 42,
          }}
        >
          <HistoryIcon />
        </Avatar>


        <Box>

          <Typography
            variant="h6"
            fontWeight="900"
            sx={{
              color: textPrimary,
              fontSize: "19px",
            }}
          >
            Recent Audit Timeline
          </Typography>


          <Typography
            variant="caption"
            sx={{
              color: textSecondary,
              fontWeight: 600,
              
            }}
          >
            Real-time compliance activity
          </Typography>

        </Box>

      </Box>


      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{
          pl: 1,
          mt:2,
        }}
      >

        {activities.slice(0, 3).map(
          (activity) => (

            <Box
              key={activity.id}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
              }}
            >

              <Avatar
                sx={{
                  bgcolor: activity.color,
                  width: 36,
                  height: 36,
                  mr: 2,
                }}
              >
                {activity.user.charAt(0)}
              </Avatar>


              <Box>

                <Typography
                  fontWeight={700}
                >
                  {activity.action}
                </Typography>


                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {activity.user}
                </Typography>

              </Box>

            </Box>

          )
        )}

      </Box>

    </Box>

  </>
)}

  </Grid>

</Grid>

      {/* MODAL 1: ADD NEW EMPLOYEE MODAL (WITH GENEROUS SPACING BETWEEN INPUT BOXES) */}
      <Dialog
  open={addModalOpen && can("dashboard.roster.add")}
        onClose={() => setAddModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 2.5,
            backgroundColor: darkMode ? "#0B1220" : "#FFFFFF",
            color: textPrimary,
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: "22px", display: "flex", justifyContent: "space-between", color: textPrimary, pb: 1 }}>
          Add New Employee
          <IconButton onClick={() => setAddModalOpen(false)} sx={{ color: textSecondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: "28px !important", pb: 3, px: 3.5 }}>
          <Box display="flex" flexDirection="column" gap={3.5} sx={{ pt: 1 }}>
            {/* FIELD 1: FULL NAME */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, color: textPrimary, fontSize: "13px", letterSpacing: "0.5px" }}>
                FULL NAME *
              </Typography>
              <TextField
                placeholder="e.g. Anju Sharma"
                fullWidth
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: darkMode ? "#111827" : "#F8FAFC",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#2563EB" },
                  },
                }}
              />
            </Box>

            {/* FIELD 2: EMAIL ADDRESS */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mt: 2, mb: 1, color: textPrimary, fontSize: "13px", letterSpacing: "0.5px" }}>
                EMAIL ADDRESS *
              </Typography>
              <TextField
                placeholder="e.g. anju@enterprise.com"
                fullWidth
                type="email"
                value={newEmpEmail}
                onChange={(e) => setNewEmpEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: darkMode ? "#111827" : "#F8FAFC",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#2563EB" },
                  },
                }}
              />
            </Box>

            {/* FIELD 3: DEPARTMENT */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mt: 2, mb: 1, color: textPrimary, fontSize: "13px", letterSpacing: "0.5px" }}>
                DEPARTMENT
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={newEmpDept}
                  displayEmpty
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  sx={{
                    borderRadius: "16px",
                    backgroundColor: darkMode ? "#111827" : "#F8FAFC",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#2563EB" },
                  }}
                >
<MenuItem value="">-- Select Department --</MenuItem>
<MenuItem value="Engineering">Engineering</MenuItem>
<MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
<MenuItem value="Operations">Operations</MenuItem>
<MenuItem value="Human Resources">Human Resources</MenuItem>
<MenuItem value="Web Development">Web Development</MenuItem>

                </Select>
              </FormControl>
            </Box>

            {/* FIELD 4: JOINING DATE */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="800"
                sx={{
                  mt: 2,
                  mb: 1,
                  color: textPrimary,
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                }}
              >
                JOINING DATE *
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={newEmpJoiningDate}
                onChange={(e) => setNewEmpJoiningDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: darkMode ? "#111827" : "#F8FAFC",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#2563EB" },
                  },
                }}
              />
            </Box>

            {/* FIELD 5: JOB POSITION / ACCESS ROLE */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="800"
                sx={{
                  mt: 2,
                  mb: 1,
                  color: textPrimary,
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                }}
              >
                JOB POSITION / ACCESS ROLE *
              </Typography>

              <FormControl fullWidth>
                <Select
                  value={newEmpRole}
                  displayEmpty
                  onChange={(e) =>
                    setNewEmpRole(e.target.value)
                  }
                  disabled={rolesLoading}
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <span
                          style={{
                            color: darkMode
                              ? "#94A3B8"
                              : "#64748B",
                          }}
                        >
                          {rolesLoading
                            ? "Loading saved roles..."
                            : "Select Job Position / Access Role"}
                        </span>
                      );
                    }

                    return selected;
                  }}
                  sx={{
                    borderRadius: "16px",
                    backgroundColor: darkMode
                      ? "#111827"
                      : "#F8FAFC",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": {
                      borderColor: lineDivider,
                    },
                    "&:hover fieldset": {
                      borderColor: "#2563EB",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {rolesLoading
                      ? "Loading saved roles..."
                      : "Select Job Position / Access Role"}
                  </MenuItem>

                  {employeeRoles.length > 0 ? (
                    employeeRoles.map((role) => (
                      <MenuItem
                        key={role.id}
                        value={role.name}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "14px",
                              }}
                            >
                              {role.name}
                            </Typography>

                            {role.description && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: darkMode
                                    ? "#94A3B8"
                                    : "#64748B",
                                }}
                              >
                                {role.description}
                              </Typography>
                            )}
                          </Box>

                          <Chip
                            size="small"
                            label={`${Array.isArray(role.permissions)
                              ? role.permissions.length
                              : 0} permissions`}
                            sx={{
                              fontWeight: 800,
                              fontSize: "10px",
                              backgroundColor: darkMode
                                ? "rgba(37,99,235,.15)"
                                : "#E0F7FA",
                              color: "#1D4ED8",
                            }}
                          />
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No saved employee roles found
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setAddModalOpen(false)} sx={{ color: textSecondary }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddEmployee}
            disabled={
              rolesLoading ||
              !newEmpRole ||
              !newEmpName.trim() ||
              !newEmpEmail.trim()
            }
            sx={{
              borderRadius: "14px",
              background: "#2563EB",
              textTransform: "none",
              fontWeight: 800,
              px: 3.5,
              py: 1.2,
              "&.Mui-disabled": {
                backgroundColor: darkMode
                  ? "#334155"
                  : "#B9DDE6",
                color: darkMode
                  ? "#94A3B8"
                  : "#FFFFFF",
              },
            }}
          >
            {rolesLoading
              ? "Loading Roles..."
              : "Create Employee Record"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: GENERATE REPORT MODAL WITH REAL DOWNLOAD */}
      <Dialog
        open={reportModalOpen && can("reports.view")}
        onClose={() => setReportModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 2.5,
            backgroundColor: darkMode ? "#0B1220" : "#FFFFFF",
            color: textPrimary,
            maxWidth: "460px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: "20px", display: "flex", justifyContent: "space-between", color: textPrimary, pb: 1 }}>
          Export Organization Report
          <IconButton onClick={() => setReportModalOpen(false)} sx={{ color: textSecondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: "20px !important" }}>
          <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
            Select export format for the current month's payroll and attendance summary.
          </Typography>
          <FormControl fullWidth>
            <InputLabel shrink style={{ color: "#2563EB", fontWeight: 800, fontSize: "13px" }}>EXPORT FORMAT</InputLabel>
            <Select
              defaultValue="JSON"
              id="export-format-select"
              label="EXPORT FORMAT"
              sx={{
                borderRadius: "14px",
                backgroundColor: darkMode ? "#111827" : "#F8FAFC",
                color: textPrimary,
                height: "50px",
                "& fieldset": { borderColor: lineDivider },
              }}
            >
              <MenuItem value="JSON">JSON Data (.json)</MenuItem>
              <MenuItem value="CSV">Excel CSV (.csv)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setReportModalOpen(false)} sx={{ color: textSecondary }}>
            Cancel
          </Button>
       <Button
  variant="contained"
    onClick={handleExportData}
>
  Download Export
</Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={permissionModalOpen && adminUser && can("permissions.manage")}
        onClose={() => { if (!savingPermissions) setPermissionModalOpen(false); }}
        PaperProps={{ sx: { borderRadius: "24px", width: 620, maxWidth: "95vw", p: 1, backgroundColor: darkMode ? "#0B1220" : "#FFFFFF" } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: textPrimary }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography fontWeight={900} fontSize="22px">User Permissions</Typography>
              <Typography variant="body2" sx={{ color: textSecondary, mt: 0.5 }}>
                {permissionEmployee?.name || "Select user"}
                {permissionEmployee?.department ? ` • ${permissionEmployee.department}` : ""}
              </Typography>
            </Box>
            <IconButton onClick={() => setPermissionModalOpen(false)} disabled={savingPermissions}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2.5, p: 2, borderRadius: "16px", backgroundColor: darkMode ? "rgba(37,99,235,.08)" : "rgba(224,242,254,.7)", border: `1px solid ${lineDivider}` }}>
            <Typography fontWeight={800} sx={{ color: textPrimary }}>Admin controls this user's access</Typography>
            <Typography variant="body2" sx={{ color: textSecondary, mt: 0.5 }}>
              Select exactly what this individual user can see or use.
            </Typography>
          </Box>

          <Grid container spacing={1.5}>
            {PERMISSION_DEFINITIONS.map((permission) => {
              const checked = permissionForm.includes(permission.id);
              return (
                <Grid item xs={12} sm={6} key={permission.id}>
                  <Box onClick={() => togglePermission(permission.id)} sx={{ cursor: isAdminUser(permissionEmployee) ? "default" : "pointer", p: 1.7, borderRadius: "16px", border: checked ? "1px solid #2563EB" : `1px solid ${lineDivider}`, backgroundColor: checked ? (darkMode ? "rgba(37,99,235,.12)" : "rgba(224,242,254,.9)") : (darkMode ? "rgba(15,23,42,.65)" : "rgba(255,255,255,.75)"), transition: "all .2s ease" }}>
                    <Box display="flex" alignItems="flex-start" gap={1.2}>
                      <Box sx={{ width: 22, height: 22, minWidth: 22, borderRadius: "7px", border: checked ? "2px solid #2563EB" : `2px solid ${textSecondary}`, backgroundColor: checked ? "#2563EB" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>{checked ? "✓" : ""}</Box>
                      <Box>
                        <Typography fontWeight={800} sx={{ color: textPrimary, fontSize: "14px" }}>{permission.label}</Typography>
                        <Typography variant="caption" sx={{ color: textSecondary }}>{permission.description}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPermissionModalOpen(false)} disabled={savingPermissions}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePermissions}
            disabled={
              savingPermissions ||
              !permissionEmployee ||
              isAdminUser(permissionEmployee)
            }
          >
            {savingPermissions ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
  open={editModalOpen && can("dashboard.roster.edit")}
  onClose={() => setEditModalOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: "20px",
      width: 500,
      p: 2,
    },
  }}
>
  <DialogTitle>Edit Employee</DialogTitle>

  <DialogContent>

    <TextField
      fullWidth
      margin="normal"
      label="Name"
      value={editEmployee.name}
      onChange={(e) =>
        setEditEmployee({
          ...editEmployee,
          name: e.target.value,
        })
      }
    />

    <TextField
      fullWidth
      margin="normal"
      label="Email"
      value={editEmployee.email}
      onChange={(e) =>
        setEditEmployee({
          ...editEmployee,
          email: e.target.value,
        })
      }
    />

    <TextField
      fullWidth
      margin="normal"
      label="Department"
      value={editEmployee.department}
      onChange={(e) =>
        setEditEmployee({
          ...editEmployee,
          department: e.target.value,
        })
      }
    />

    <TextField
      fullWidth
      margin="normal"
      label="Joining Date"
      type="date"
      value={editEmployee.joining_date || ""}
      onChange={(e) =>
        setEditEmployee({
          ...editEmployee,
          joining_date: e.target.value,
        })
      }
      InputLabelProps={{ shrink: true }}
    />

    <TextField
      fullWidth
      margin="normal"
      label="Designation"
      value={editEmployee.designation}
      onChange={(e) =>
        setEditEmployee({
          ...editEmployee,
          designation: e.target.value,
        })
      }
    />

    <FormControl fullWidth margin="normal">
      <InputLabel>Attendance</InputLabel>

      <Select
        value={editEmployee.attendance}
        label="Attendance"
        onChange={(e) =>
          setEditEmployee({
            ...editEmployee,
            attendance: e.target.value,
          })
        }
      >
        <MenuItem value="Present">Present</MenuItem>
        <MenuItem value="Absent">Absent</MenuItem>
        <MenuItem value="On Leave">On Leave</MenuItem>
      </Select>
    </FormControl>

  </DialogContent>

  <DialogActions>
    <Button onClick={() => setEditModalOpen(false)}>
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleUpdateEmployee}
    >
      Update
    </Button>
  </DialogActions>
</Dialog>

      {/* SNACKBAR NOTIFICATION TOAST */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3500}
        onClose={() => setToastMessage("")}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  </Box>
  );
}

export default Dashboard;
