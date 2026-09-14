import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
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
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoginIcon from "@mui/icons-material/Login";


import {
  hasPermission,
  isAdminUser,
} from "../permissions";


const API = "https://website-vltl.onrender.com";

const ENDPOINTS = {
  me: "/auth/me",
  searchEmployees: "/webservices/users/search-users",
  notifications: "/notifications",
  readNotification: "/notifications/read",
  attendanceToday: "/attendance/my-today",
  clockIn: "/attendance/clock-in",
  clockOut: "/attendance/clock-out",
};

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

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(
    typeof value === "number" && value < 1000000000000 ? value * 1000 : value
  );
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// IMPORTANT: todayMs comes from React state. This prevents Date.now()/new Date()
// from being called during render, which caused your React "impure function"
// error.
const calculateExperience = (joiningDate, todayMs) => {
  if (!joiningDate || !todayMs) return joiningDate ? "Calculating..." : "Not provided";
  const start = new Date(joiningDate);
  const now = new Date(todayMs);
  if (Number.isNaN(start.getTime())) return "Not provided";

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0 && months <= 0) return "Less than 1 month";
  if (years <= 0) return `${months} month${months === 1 ? "" : "s"}`;
  if (months === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years}y ${months}m`;
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(/[,|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const normalizeProjects = (user) => {
  const raw = user?.projects ?? user?.featured_projects ?? user?.employee_projects ?? [];
  return toArray(raw).map((project, index) => ({
    id: project?.id ?? index,
    title: project?.title ?? project?.name ?? "Untitled Project",
    description: project?.description ?? "No project description provided.",
    technologies:
      project?.technologies ?? project?.tech_stack ?? project?.technology ?? "Not provided",
    features: toArray(project?.features ?? project?.key_features ?? []),
    status: project?.status ?? "Not provided",
  }));
};

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const can = (permission) => {
    if (!user) return false;

    return (
      isAdminUser(user) ||
      hasPermission(user, permission)
    );
  };
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [todayMs, setTodayMs] = useState(null);
  const [skillsList, setSkillsList] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // Attendance is stored in the backend database and is always tied
  // to the authenticated employee. No employee ID is sent from the UI.
  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("ems-dark-mode") === "true");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setTodayMs(Date.now());
    const interval = window.setInterval(() => setTodayMs(Date.now()), 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("ems-dark-mode", String(darkMode));
  }, [darkMode]);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const fetchUser = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await api.get(ENDPOINTS.me);
      const data = response.data;
      const currentUser = data?.user ?? data?.data?.user ?? data?.data;
      if (data?.status === 0 || !currentUser) {
        throw new Error(data?.message || "Unable to load profile");
      }
      setUser(currentUser);
      fetchSkills(currentUser.id);
    } catch (error) {
      console.error("PROFILE FETCH ERROR:", error.response?.data || error);
      setUser(null);
      setErrorMessage(
        error.response?.data?.message || error.message || "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async (userId) => {
    if (!userId) {
      setSkillsList([]);
      return;
    }

    try {
      setSkillsLoading(true);
      const response = await api.post("/webservices/users/get-skills", {
        user_id: userId,
      });

      console.log("PROFILE SKILLS RESPONSE:", response.data);

      if (response.data?.status === 1) {
        setSkillsList(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setSkillsList([]);
      }
    } catch (error) {
      console.error("PROFILE FETCH SKILLS ERROR:", error.response?.data || error);
      setSkillsList([]);
    } finally {
      setSkillsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const response = await api.get(ENDPOINTS.attendanceToday);

      if (response.data?.status === 1) {
        setAttendance(response.data.data || null);
      } else {
        setAttendance(null);
      }
    } catch (error) {
      console.error("PROFILE ATTENDANCE ERROR:", error.response?.data || error);
      setAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setAttendanceActionLoading(true);
      const response = await api.post(ENDPOINTS.clockIn);

      if (response.data?.status === 1) {
        showToast(response.data.message || "Clocked in successfully.");
        await fetchAttendance();
      } else {
        showToast(response.data?.message || "Unable to clock in.", "error");
      }
    } catch (error) {
      console.error("CLOCK IN ERROR:", error.response?.data || error);
      showToast(
        error.response?.data?.message || "Unable to clock in.",
        "error"
      );
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setAttendanceActionLoading(true);
      const response = await api.post(ENDPOINTS.clockOut);

      if (response.data?.status === 1) {
        showToast(response.data.message || "Clocked out successfully.");
        await fetchAttendance();
      } else {
        showToast(response.data?.message || "Unable to clock out.", "error");
      }
    } catch (error) {
      console.error("CLOCK OUT ERROR:", error.response?.data || error);
      showToast(
        error.response?.data?.message || "Unable to clock out.",
        "error"
      );
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get(ENDPOINTS.notifications);
      const data = response.data;
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.notifications)
          ? data.notifications
          : [];
      setNotifications(data?.status === 0 ? [] : list);
    } catch (error) {
      console.error("PROFILE NOTIFICATIONS ERROR:", error.response?.data || error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Every logged-in employee can use their own Staff's Time Management.
  // The backend identifies the employee from the authenticated session.
  useEffect(() => {
    if (!user) return;
    fetchAttendance();
  }, [user]);

  useEffect(() => {
  if (user && can("notifications.view")) {
    fetchNotifications();
  } else {
    setNotifications([]);
  }
}, [user]);

  useEffect(() => {
    if (!user || !can("employees.search")) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);

        const response = await api.post(
          ENDPOINTS.searchEmployees,
          { search: query }
        );

        const data = response.data;

        setSearchResults(
          data?.status === 1
            ? data.data || []
            : []
        );
      } catch (error) {
        console.error(
          "PROFILE SEARCH ERROR:",
          error.response?.data || error
        );

        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [user, searchQuery]);

  const handleNotificationClick = async (notification) => {
    if (Number(notification.is_read) === 1) {
      setNotifAnchorEl(null);
      return;
    }
    try {
      const response = await api.post(ENDPOINTS.readNotification, { id: notification.id });
      if (response.data?.status === 1) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: 1 } : item
          )
        );
      }
    } catch (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error.response?.data || error);
      showToast("Unable to mark notification as read.", "error");
    } finally {
      setNotifAnchorEl(null);
    }
  };

const projects = normalizeProjects(user);  const unreadCount = notifications.filter((item) => Number(item.is_read) === 0).length;

  // SHARED EMPLOYEE PAGE THEME — keep Profile visually consistent with Employees
  const colors = {
    page: darkMode
      ? "radial-gradient(circle at 12% 0%, rgba(37,99,235,.16), transparent 30%), linear-gradient(135deg, #070B14 0%, #0F172A 52%, #111827 100%)"
      : "radial-gradient(circle at 85% 0%, rgba(96,165,250,.18), transparent 26%), linear-gradient(135deg, #DCEBFA 0%, #EAF2FA 45%, #E4ECF8 100%)",
    sidebar: darkMode
      ? "linear-gradient(180deg, #0B1220 0%, #111C33 55%, #070B14 100%)"
      : "linear-gradient(180deg, #111D3A 0%, #172554 58%, #0F172A 100%)",
    card: darkMode ? "rgba(15, 23, 42, 0.78)" : "rgba(255, 255, 255, 0.75)",
    inner: darkMode ? "rgba(30, 41, 59, 0.65)" : "rgba(224, 242, 254, 0.70)",
    primary: darkMode ? "#F8FAFC" : "#172033",
    secondary: darkMode ? "#A8B4C7" : "#64748B",
    border: darkMode ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.08)",
  };

  const interactiveCardSx = {
    transition: "transform .28s ease, box-shadow .28s ease, border-color .28s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: darkMode
        ? "0 24px 45px rgba(0,0,0,.28)"
        : "0 20px 38px rgba(37,99,235,.12)",
    },
  };

  const infoFields = [
    {
      label: "Employee ID",
      value: user?.id ? `#${user.id}` : "Not provided",
      icon: <AssignmentIndIcon />,
      color: "#06B6D4",
      permission: "profile.view",
    },
    {
      label: "Email Address",
      value: user?.email || "Not provided",
      icon: <EmailIcon />,
      color: "#10B981",
      permission: "profile.contact.view",
    },
    {
      label: "Phone Number",
      value: user?.phone || user?.phone_number || "Not provided",
      icon: <PhoneIcon />,
      color: "#F59E0B",
      permission: "profile.contact.view",
    },
    {
      label: "Department",
      value: user?.department || "Not provided",
      icon: <BusinessIcon />,
      color: "#0284C7",
      permission: "profile.department.view",
    },
    {
      label: "Designation",
      value: user?.designation || user?.role || "Not provided",
      icon: <WorkspacePremiumIcon />,
      color: "#3B82F6",
      permission: "profile.view",
    },
    {
      label: "Joining Date",
      value: formatDate(user?.joining_date),
      icon: <CalendarTodayIcon />,
      color: "#10B981",
      permission: "profile.view",
    },
    {
      label: "Address",
      value: user?.address || "Not provided",
      icon: <LocationOnIcon />,
      color: "#8B5CF6",
      permission: "profile.contact.view",
    },
    {
      label: "Attendance",
      value: user?.attendance || "Not provided",
      icon: <CheckCircleIcon />,
      color: "#06B6D4",
      permission: "profile.view",
    },
  ];



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
    permission: "password.view",
  },
    {
      text: "User Roles",
      icon: <PeopleIcon />,
      path: "/user-roles",
      permission: "permissions.manage",
    },
];

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", background: colors.page }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#0284C7", mb: 2 }} />
          <Typography fontWeight={800} sx={{ color: "#0284C7" }}>Loading your profile...</Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    if (!can("profile.view")) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3,
        background: colors.page,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 520,
          width: "100%",
          p: 4,
          borderRadius: "24px",
          textAlign: "center",
          border: `1px solid ${colors.border}`,
          background: colors.card,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={900}
          sx={{
            color: colors.primary,
            mb: 1,
          }}
        >
          Access Denied
        </Typography>

        <Typography
          sx={{
            color: colors.secondary,
            mb: 3,
          }}
        >
          Your administrator has not granted permission
          to access your profile.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/dashboard")}
          sx={{
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, background: colors.page }}>
        <Paper elevation={0} sx={{ maxWidth: 520, width: "100%", p: 4, borderRadius: "24px", textAlign: "center", border: `1px solid ${colors.border}`, background: colors.card }}>
          <Typography variant="h5" fontWeight={900} sx={{ color: colors.primary, mb: 1 }}>Profile unavailable</Typography>
          <Typography sx={{ color: colors.secondary, mb: 3 }}>{errorMessage || "Your session may have expired."}</Typography>
          <Button variant="contained" onClick={() => navigate("/")} sx={{ borderRadius: "14px", textTransform: "none", fontWeight: 800 }}>Go to Login</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: colors.page, backgroundAttachment: "fixed", color: colors.primary, fontFamily: "'Inter', sans-serif",
        transition: "background 0.4s ease, color 0.4s ease",
      }}>
      <Box
        sx={{
          width: 250,
          background: colors.sidebar,
          borderRight: `1px solid ${colors.border}`,
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
            <Typography
              variant="h6"
              fontWeight="800"
              letterSpacing={0.5}
              sx={{ color: "#FFFFFF" }}
            >
              EMS Portal
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sidebarItems.filter((item) => can(item.permission)).map((item) => {
              const isActive = item.path === "/profile";

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
                    boxShadow: isActive ? "0 6px 18px rgba(2, 132, 199, 0.45)" : "none",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "#1D4ED8"
                        : "rgba(255, 255, 255, 0.12)",
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

      <Box
        sx={{
          flex: 1,
          ml: { xs: "0px", md: "250px" },
          p: { xs: 2, sm: 2.5, md: 3 },
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: { xs: "100%", md: "calc(100% - 250px)" },
          maxWidth: { xs: "100%", md: "calc(100vw - 250px)" },
          minWidth: 0,
        }}
      >
        <Box
  sx={{
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    mb: 3.5,
    gap: 2,
  }}
>
          <Box
            sx={{
              position: "relative",
              display: can("employees.search")
                ? "block"
                : "none",
            }}
          >
            <TextField
              placeholder="Search team members, departments, or roles..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: 240, sm: 360, md: 355 },
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  borderRadius: "24px",
                  backgroundColor: colors.card,
                  backdropFilter: "blur(12px)",
                  color: colors.primary,
                  fontSize: "14px",
                  boxShadow: "0 4px 20px rgba(37, 99, 235, 0.08)",
                  transition: "all 0.3s ease",
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: "#2563EB" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2563EB",
                    boxShadow: "0 0 16px rgba(37, 99, 235, 0.35)",
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchIcon
                      sx={{
                        color: colors.secondary,
                        mr: 1,
                      }}
                    />
                  ),
                  endAdornment: searchLoading ? (
                    <CircularProgress
                      size={18}
                      sx={{ color: "#06B6D4" }}
                    />
                  ) : null,
                },
              }}
            />
            {can("employees.search") &&
              searchQuery.trim() && (
              <Paper elevation={0} sx={{ position: "absolute", top: 56, left: 0, width: "100%", zIndex: 30, maxHeight: 360, overflowY: "auto", borderRadius: "18px", border: `1px solid ${colors.border}`, background: darkMode ? "#0B1220" : "#FFFFFF", p: 1, boxShadow: "0 15px 40px rgba(0,0,0,.18)" }}>
                {searchLoading ? <Box sx={{ p: 2, textAlign: "center" }}><CircularProgress size={22} /></Box> : searchResults.length === 0 ? <Typography sx={{ p: 2, color: colors.secondary, textAlign: "center" }}>No employees found</Typography> 
                
:searchResults.map((employee) => (
  <Box
    key={employee.id}
    onClick={() => {
      setSearchQuery("");
      setSearchResults([]);

      if (Number(employee.id) === Number(user.id)) {
        navigate("/profile");
      } else {
        navigate("/employees");
      }
    }}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      p: 1.2,
      borderRadius: "12px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: darkMode
          ? "rgba(255,255,255,0.08)"
          : "rgba(2,132,199,0.08)",
      },
    }}
  >
    <Avatar
      src={getImageUrl(employee.profile_pic)}
      sx={{
        width: 36,
        height: 36,
        mr: 0.5,
      }}
    />

    <Box sx={{ minWidth: 0 }}>
      <Typography
        fontWeight={800}
        sx={{ color: colors.primary }}
      >
        {employee.name}
      </Typography>

      <Typography
        variant="caption"
        sx={{ color: colors.secondary }}
      >
        {employee.designation || employee.role || "Employee"} •{" "}
        {employee.department || "No department"}
      </Typography>
    </Box>
  </Box>
))}








              </Paper>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0, marginLeft: "auto" }}>
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                onClick={() => setDarkMode((prev) => !prev)}
                sx={{
                  width: 44,
                  height: 44,
                  p: 0,
                  borderRadius: "14px",
                  backgroundColor: darkMode
                    ? "rgba(30, 41, 59, 0.9)"
                    : "rgba(224, 242, 254, 0.9)",
                  color: colors.primary,
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
                  <LightModeIcon sx={{ fontSize: 21, color: colors.primary }} />
                ) : (
                  <DarkModeIcon sx={{ fontSize: 21, color: colors.primary }} />
                )}
              </IconButton>
            </Tooltip>

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
      color: colors.primary,
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
    >
      <NotificationsNoneIcon
        sx={{ color: colors.primary }}
      />
    </Badge>
      </IconButton>
    </Tooltip>
  </>
)}

{can("notifications.view") && (
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
        backgroundColor: darkMode
          ? "#0B1220 !important"
          : "#FFFFFF !important",
        color: colors.primary,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      },
    }}
  >
    <Typography
      sx={{
        p: 1.2,
        color: colors.primary,
        fontWeight: 800,
        fontSize: 16,
      }}
    >
      Notifications & Alerts
    </Typography>

    <Divider sx={{ borderColor: colors.border }} />

    {notifications.length === 0 ? (
      <Typography
        sx={{
          p: 3,
          color: colors.secondary,
          textAlign: "center",
        }}
      >
        No notifications
      </Typography>
    ) : (
      notifications.map((notification) => (
        <MenuItem
          key={notification.id}
          onClick={() =>
            handleNotificationClick(notification)
          }
          sx={{
            display: "block",
            p: 1.6,
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor:
              Number(notification.is_read) === 0
                ? darkMode
                  ? "#1E293B"
                  : "#F0F9FF"
                : "transparent",
          }}
        >
          <Typography
            sx={{
              color: colors.primary,
              fontWeight:
                Number(notification.is_read) === 0
                  ? 800
                  : 600,
              fontSize: 14,
            }}
          >
            {notification.title ||
              notification.message ||
              "Notification"}
          </Typography>

          {(notification.subtitle ||
            notification.description ||
            notification.department ||
            notification.created_at) && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.7,
                color: "#0284C7",
                fontWeight: 700,
              }}
            >
              {notification.subtitle ||
                notification.description ||
                [
                  notification.department,
                  formatDate(notification.created_at),
                ]
                  .filter(Boolean)
                  .join(" • ")}
            </Typography>
          )}
        </MenuItem>
      ))
    )}
  </Menu>
)}

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
                    color: colors.primary,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.secondary,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.role}
                </Typography>
              </Box>
            </Box>
            <Menu anchorEl={profileAnchorEl} open={Boolean(profileAnchorEl)} onClose={() => setProfileAnchorEl(null)} PaperProps={{
              sx: {
                mt: 1,
                borderRadius: "18px",
                width: 190,
                p: 1,
                backgroundColor: darkMode
                  ? "#0B1220 !important"
                  : "#FFFFFF !important",
                color: colors.primary,
              },
            }}>

{can("profile.view") && (
  <MenuItem sx={{ fontWeight: 700, color: colors.primary }}
    onClick={() => {
      setProfileAnchorEl(null);
      navigate("/profile");
    }}
  >
    My Profile
  </MenuItem>
)}

{can("profile.edit") && (
  <MenuItem sx={{ fontWeight: 700, color: colors.primary }}
    onClick={() => {
      setProfileAnchorEl(null);
      navigate("/edit-profile");
    }}
  >
    Edit Profile
  </MenuItem>
)}

{can("password.view") && (
  <MenuItem sx={{ fontWeight: 700, color: colors.primary }}
    onClick={() => {
      setProfileAnchorEl(null);
      navigate("/change-password");
    }}
  >
    Change Password
  </MenuItem>
)}


              <Divider />
              <MenuItem onClick={() => navigate("/")} sx={{ color: "#EF4444", fontWeight: 800 }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box
          sx={{
            mb: 5,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: "28px",
            background: darkMode
              ? "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #075985 100%)"
              : "linear-gradient(135deg, #D9E8FF 0%, #C6DCF6 52%, #BFD9F4 100%)",
            border: darkMode
              ? "1px solid rgba(148,163,184,.16)"
              : "1px solid rgba(255,255,255,.85)",
            boxShadow: darkMode
              ? "0 24px 55px rgba(0,0,0,.24)"
              : "0 24px 55px rgba(48,75,130,.18)",
            transition: "transform .28s ease, box-shadow .28s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: darkMode
                ? "0 28px 60px rgba(0,0,0,.30)"
                : "0 28px 60px rgba(48,75,130,.22)",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 1.75,
            }}
          >
            <Avatar
                src={getImageUrl(user.profile_pic)}
                alt={user.name}
                sx={{
                  width: { xs: 82, md: 104 },
                  height: { xs: 82, md: 104 },
                  border: "4px solid rgba(37,99,235,.85)",
                  boxShadow: "0 10px 28px rgba(37,99,235,.28)",
                  backgroundColor: darkMode ? "#475569" : "#BDBDBD",
                  color: "#FFFFFF",
                  fontSize: { xs: 28, md: 34 },
                  fontWeight: 800,
                }}
              >
                {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h3"
                  fontWeight="900"
                  sx={{
                    color: darkMode ? "#FFFFFF" : "#0F172A",
                    letterSpacing: "-0.045em",
                    fontSize: { xs: 29, md: 40 },
                  }}
                >
                  {user.name || "Employee"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: darkMode ? "rgba(255,255,255,.78)" : "#3B5B82",
                    mt: 1,
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  {user.designation || user.role || "Employee"}{" "}
                  {user.department ? `• ${user.department}` : ""}
              </Typography>
            </Box>

            <Chip
              icon={<CheckCircleIcon sx={{ color: "#FFFFFF !important" }} />}
              label={Number(user.status) === 1 ? "Active Employee" : "Inactive Employee"}
              sx={{
                background: Number(user.status) === 1
                  ? "linear-gradient(135deg, #16A34A 0%, #15803D 100%)"
                  : "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)",
                color: "#FFFFFF",
                fontWeight: 800,
                px: 1,
                boxShadow: Number(user.status) === 1
                  ? "0 8px 22px rgba(22,163,74,.25)"
                  : "0 8px 22px rgba(239,68,68,.25)",
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            mb: 6,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.75,
          }}
        >
          {[
            {
              title: "TOTAL EXPERIENCE",
              value: calculateExperience(user.joining_date, todayMs),
              sub: user.joining_date
                ? `Joined ${formatDate(user.joining_date)}`
                : "Joining date not provided",
              color: "#2563EB",
              icon: <WorkspacePremiumIcon sx={{ fontSize: 26 }} />,
            },
            {
              title: "PROJECTS COMPLETED",
              value: projects.length.toString(),
              sub: projects.length
                ? "Loaded from profile API"
                : "No projects returned by API",
              color: "#10B981",
              icon: <FolderSpecialIcon sx={{ fontSize: 26 }} />,
            },
            {
              title: "PROFILE SUMMARY",
              value: user.designation || user.role || "Employee",
              sub: user.department || "Department not provided",
              color: "#F59E0B",
              icon: <StarIcon sx={{ fontSize: 26 }} />,
            },
          ].map((st) => (
            <Box key={st.title}>
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  py: 2.25,
                  px: 2.5,
                  minHeight: 154,
                  borderRadius: "22px",
                  border: `1px solid ${st.color}35`,
                  background: darkMode
                    ? "linear-gradient(145deg, rgba(15,23,42,.92), rgba(30,41,59,.72))"
                    : st.color === "#2563EB"
                    ? "linear-gradient(135deg, #F5F9FF 0%, #E6F0FF 100%)"
                    : st.color === "#10B981"
                    ? "linear-gradient(135deg, #F2FFFA 0%, #DDF8EE 100%)"
                    : "linear-gradient(135deg, #FFFCF4 0%, #FFF0D4 100%)",
                  backdropFilter: "blur(16px)",
                  boxShadow: darkMode
                    ? "0 18px 35px rgba(0,0,0,.20)"
                    : "0 14px 30px rgba(30,64,175,.09)",
                  transition: "transform .28s ease, box-shadow .28s ease, border-color .28s ease",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    width: 110,
                    height: 110,
                    right: -32,
                    bottom: -48,
                    borderRadius: "50%",
                    background: `${st.color}18`,
                    pointerEvents: "none",
                  },
                  "&:hover": {
                    transform: "translateY(-5px)",
                    borderColor: `${st.color}70`,
                    boxShadow: darkMode
                      ? "0 24px 45px rgba(0,0,0,.28)"
                      : `0 20px 38px ${st.color}22`,
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography
                    variant="body2"
                    fontWeight="800"
                    sx={{ color: colors.secondary, fontSize: "13px" }}
                  >
                    {st.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: st.color,
                      backgroundColor: `${st.color}18`,
                      boxShadow: `0 8px 18px ${st.color}18`,
                    }}
                  >
                    {st.icon}
                  </Box>
                </Box>
                <Typography
                  variant={st.title === "PROFILE SUMMARY" ? "h6" : "h4"}
                  fontWeight="900"
                  sx={{ color: colors.primary, my: 1 }}
                >
                  {st.value}
                </Typography>
                <Chip
                  label={st.sub}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: "11px",
                    backgroundColor: `${st.color}20`,
                    color: st.color,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Grid container spacing={3} mb={4}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: can("profile.skills.view") ? "block" : "none",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                height: "100%",
                background: colors.card,
                borderRadius: "24px",
                border: `1px solid ${colors.border}`,
                backdropFilter: "blur(16px)",
                boxShadow: darkMode
                  ? "0 18px 35px rgba(0,0,0,.20)"
                  : "0 14px 30px rgba(30,64,175,.07)",
                ...interactiveCardSx,
              }}
            >
            <SectionHeader icon={<PersonIcon />} title="Employee Information" subtitle="Official record & personal contact details" color="#2563EB" colors={colors} />
            <Grid container spacing={2}>
              {infoFields
                .filter((item) => can(item.permission))
                .map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "18px",
                        background: colors.inner,
                        border: `1px solid ${colors.border}`,
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          backgroundColor: `${item.color}20`,
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{
                            color: colors.secondary,
                            display: "block",
                          }}
                        >
                          {item.label}
                        </Typography>

                        <Typography
                          variant="subtitle2"
                          fontWeight={800}
                          sx={{
                            color: colors.primary,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </Paper></Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                height: "100%",
                background: colors.card,
                borderRadius: "24px",
                border: `1px solid ${colors.border}`,
                backdropFilter: "blur(16px)",
                boxShadow: darkMode
                  ? "0 18px 35px rgba(0,0,0,.20)"
                  : "0 14px 30px rgba(30,64,175,.07)",
                ...interactiveCardSx,
              }}
            >
            <SectionHeader icon={<StarIcon />} title="Technical Skills & Stack" subtitle="Skills returned by the authenticated profile API" color="#10B981" colors={colors} />
            {skillsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} sx={{ color: "#10B981" }} />
              </Box>
            ) : skillsList.length ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {skillsList.map((skill, index) => {
                  const skillName = typeof skill === "string"
                    ? skill
                    : skill?.skill || skill?.name || skill?.skill_name || skill?.title || "Skill";
                  const skillLevel = typeof skill === "object"
                    ? skill?.level || skill?.proficiency || skill?.experience_level || ""
                    : "";
                  const skillColors = ["#06B6D4", "#0284C7", "#10B981", "#F59E0B"];
                  const skillColor = skill?.color || skillColors[index % skillColors.length];

                  return (
                    <Paper
                      key={skill?.id || `${skillName}-${index}`}
                      elevation={0}
                      sx={{
                        px: 2,
                        py: 1.2,
                        borderRadius: "14px",
                        background: colors.inner,
                        color: colors.primary,
                        border: `1px solid ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography fontWeight={800}>{skillName}</Typography>
                      {skillLevel && (
                        <Chip
                          label={skillLevel}
                          size="small"
                          sx={{
                            
                            height: 20,
                            fontSize: 10,
                            fontWeight: 800,
                            backgroundColor: `${skillColor}20`,
                            color: skillColor,
                          }}
                        />
                      )}
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <Typography sx={{ color: colors.secondary, fontWeight: 700 }}>
                No skills have been added yet. Add skills from Edit Profile.
              </Typography>
            )}
          </Paper></Grid>
        </Grid>


        {/* STAFF TIME MANAGEMENT - available to every logged-in employee */}
        <Paper
          elevation={0}
          sx={{
            mt:6,
            mb: 4,
            p: { xs: 2.5, md: 3.5 },
            background: colors.card,
            borderRadius: "24px",
            border: `1px solid ${colors.border}`,
            backdropFilter: "blur(16px)",
            boxShadow: darkMode
              ? "0 18px 35px rgba(0,0,0,.20)"
              : "0 14px 30px rgba(30,64,175,.07)",
            ...interactiveCardSx,
          }}
        >
          <SectionHeader
            icon={<AccessTimeIcon />}
            title="Staff's Time Management"
            subtitle="Your attendance for today"
            color="#06B6D4"
            colors={colors}
          />

          {attendanceLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#06B6D4" }} />
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {[
                  {
                    label: "Status",
                    value: attendance?.status || "Not clocked in",
                    icon: <CheckCircleIcon />,
                    color:
                      attendance?.status === "Completed"
                        ? "#10B981"
                        : attendance?.status === "Working"
                          ? "#F59E0B"
                          : "#64748B",
                  },
                  {
                    label: "Clock In",
                    value: attendance?.clock_in
                      ? new Date(attendance.clock_in).toLocaleTimeString(
                          "en-IN",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "--",
                    icon: <LoginIcon />,
                    color: "#2563EB",
                  },
                  {
                    label: "Clock Out",
                    value: attendance?.clock_out
                      ? new Date(attendance.clock_out).toLocaleTimeString(
                          "en-IN",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "--",
                    icon: <LogoutIcon />,
                    color: "#EF4444",
                  },
                  {
                    label: "Total Hours",
                    value: attendance?.total_minutes
                      ? `${Math.floor(Number(attendance.total_minutes) / 60)}h ${Number(attendance.total_minutes) % 60}m`
                      : "--",
                    icon: <AccessTimeIcon />,
                    color: "#8B5CF6",
                  },
                ].map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.label}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        minHeight: 112,
                        borderRadius: "18px",
                        background: colors.inner,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                          mb: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "12px",
                            backgroundColor: `${item.color}20`,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </Avatar>
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ color: colors.secondary }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        sx={{ color: colors.primary }}
                      >
                        {item.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1.5,
                  mt: 2.5,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={handleClockIn}
                  disabled={
                    attendanceActionLoading ||
                    Boolean(attendance?.clock_in)
                  }
                  sx={{
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  }}
                >
                  {attendanceActionLoading ? "Please wait..." : "Clock In"}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleClockOut}
                  disabled={
                    attendanceActionLoading ||
                    !attendance?.clock_in ||
                    Boolean(attendance?.clock_out)
                  }
                  sx={{
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  {attendanceActionLoading ? "Please wait..." : "Clock Out"}
                </Button>
              </Box>
            </>
          )}
        </Paper>

        {can("profile.contact.view") && (user.bio || user.address) && (
  <Paper
    elevation={0}
    sx={{
      mt: { xs: 4, md: 6 },
      p: { xs: 3, md: 3.5 },
      mb: 4,
      background: colors.card,
      borderRadius: "24px",
      border: `1px solid ${colors.border}`,
      backdropFilter: "blur(16px)",
      boxShadow: darkMode
        ? "0 18px 35px rgba(0,0,0,.20)"
        : "0 14px 30px rgba(30,64,175,.07)",
      ...interactiveCardSx,
    }}
  >
    <SectionHeader
      icon={<InfoOutlinedIcon />}
      title="About Me"
      subtitle="Information stored in your employee profile"
      color="#2563EB"
      colors={colors}
    />

    {user.bio && (
      <Typography
        sx={{
          color: colors.primary,
          lineHeight: 1.8,
          mb: 2,
        }}
      >
        {user.bio}
      </Typography>
    )}

    {user.address && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          mt: user.bio ? 1 : 0,
        }}
      >
        <LocationOnIcon
          sx={{ color: "#2563EB", fontSize: 21 }}
        />

        <Typography
          sx={{
            color: colors.primary,
            fontWeight: 700,
          }}
        >
          {user.address}
        </Typography>
      </Box>
    )}
  </Paper>
)}

        {can("profile.projects.view") && (
          <Box>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                mt: 7,
                color: colors.primary,
                mb: 3,
              }}
            >
              My Featured Projects
            </Typography>

            {projects.length ? (
              <Grid container spacing={3} mb={5}>
                {projects.map((project) => (
                  <Grid item xs={12} md={4} key={project.id}>
                    <Card
                      sx={{
                        height: "100%",
                        background: colors.card,
                        borderRadius: "24px",
                        border: `1px solid ${colors.border}`,
                        backdropFilter: "blur(16px)",
                        boxShadow: darkMode
                          ? "0 18px 35px rgba(0,0,0,.20)"
                          : "0 14px 30px rgba(30,64,175,.07)",
                        ...interactiveCardSx,
                      }}
                    >
                      <CardContent sx={{ p: 3.5 }}>
                        <Typography
                          variant="h6"
                          fontWeight={900}
                          sx={{ color: colors.primary }}
                        >
                          {project.title}
                        </Typography>

                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            color: colors.secondary,
                            display: "block",
                            mb: 2,
                          }}
                        >
                          {project.technologies}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.primary,
                            mb: 2,
                          }}
                        >
                          {project.description}
                        </Typography>

                        <Chip
                          label={`Status: ${project.status}`}
                          size="small"
                          sx={{
                            color: "#10B981",
                            backgroundColor:
                              "rgba(16,185,129,.15)",
                            fontWeight: 800,
                            mb: 2,
                          }}
                        />

                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => {
                            setSelectedProject(project);
                            setOpenProjectDialog(true);
                          }}
                          sx={{
                            borderRadius: "16px",
                            textTransform: "none",
                            fontWeight: 800,
                            background:
                              "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                            boxShadow: "0 8px 22px rgba(37,99,235,.28)",
                            transition: "all .25s ease",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 5,
                  background: colors.card,
                  borderRadius: "24px",
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Typography
                  sx={{
                    color: colors.secondary,
                    fontWeight: 700,
                  }}
                >
                  No featured projects
                </Typography>
              </Paper>
            )}
          </Box>
        )}

<Box
  sx={{
    display: "flex",
    gap: 2,
    justifyContent: "center",
    mb: 5,
    flexWrap: "wrap",
  }}
>
  {can("profile.edit") && (
    <Button
      variant="contained"
      onClick={() => navigate("/edit-profile")}
      sx={{
        borderRadius: "14px",
        background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        color: "#FFFFFF",
        textTransform: "none",
        fontWeight: 800,
        px: 3,
        py: 1.2,
        boxShadow: "0 8px 22px rgba(37,99,235,.24)",
        transition: "all .25s ease",
        "&:hover": {
          background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
          transform: "translateY(-2px)",
        },
      }}
    >
      Edit Profile
    </Button>
  )}

  {can("password.view") && (
    <Button
      variant="outlined"
      onClick={() => navigate("/change-password")}
      sx={{
        borderRadius: "14px",
        borderColor: "#2563EB",
        color: "#2563EB",
        textTransform: "none",
        fontWeight: 800,
        px: 3,
        py: 1.2,
        transition: "all .25s ease",
        "&:hover": {
          borderColor: "#1D4ED8",
          backgroundColor: "rgba(37,99,235,.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      Change Password
    </Button>
  )}
</Box>
        <Typography align="center" variant="body2" sx={{ color: colors.secondary, fontWeight: 600, mb: 3 }}>© 2026 Employee Management System • Enterprise Workspace</Typography>
      </Box>

      <Dialog
        open={Boolean(selectedProject) && openProjectDialog}
        onClose={() => setOpenProjectDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 1,
            backgroundColor: darkMode ? "#0B1220" : "#FFFFFF",
            color: colors.primary,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: colors.primary,
          }}
        >
          {selectedProject?.title}
          <IconButton
            onClick={() => setOpenProjectDialog(false)}
            sx={{ color: colors.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: colors.primary, lineHeight: 1.7 }}>
            {selectedProject?.description}
          </Typography>
          <Typography fontWeight={800} sx={{ color: "#2563EB" }}>
            Technologies Used
          </Typography>
          <Typography sx={{ mb: 2, color: colors.secondary }}>
            {selectedProject?.technologies}
          </Typography>
          <Typography fontWeight={800} sx={{ color: "#2563EB" }}>
            Key Features
          </Typography>
          {selectedProject?.features?.length ? (
            selectedProject.features.map((feature, index) => (
              <Typography key={index} sx={{ color: colors.primary, mt: 0.7 }}>
                • {feature}
              </Typography>
            ))
          ) : (
            <Typography sx={{ color: colors.secondary }}>
              No features returned.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenProjectDialog(false)}
            variant="contained"
            sx={{
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4500} onClose={closeToast} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity={toast.severity} variant="filled" onClose={closeToast}>{toast.message}</Alert></Snackbar>
    </Box>
  );
}

function SectionHeader({ icon, title, subtitle, color, colors }) {
  return <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}><Box sx={{ width: 44, height: 44, borderRadius: "14px", display: "grid", placeItems: "center", background: `linear-gradient(135deg,${color},#2563EB)`, color: "#fff" }}>{icon}</Box><Box><Typography variant="h6" fontWeight={900} sx={{ color: colors.primary }}>{title}</Typography><Typography variant="body2" sx={{ color: colors.secondary, fontWeight: 600 }}>{subtitle}</Typography></Box></Box>;
}

export default Profile;
