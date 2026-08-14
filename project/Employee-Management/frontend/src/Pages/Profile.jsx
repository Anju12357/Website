import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Material UI Core Imports
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  TextField,
  Divider,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
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
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const API = "http://localhost:4000";

const ENDPOINTS = {
  me: "/auth/me",
  logout: "/logout",
  updateUser: "/webservices/users/update-user",
  employees: "/webservices/users/get-all-users",
  searchEmployees: "/webservices/users/search-users",
  notifications: "/notifications",
  readNotification: "/notifications/read",
};

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  return `${API}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const formatDate = (value) => {
  if (!value) return "Not provided";

  const date = new Date(
    typeof value === "number" && value < 1000000000000
      ? value * 1000
      : value
  );

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const calculateExperience = (joiningDate) => {
  if (!joiningDate) return "Not provided";

  const start = new Date(joiningDate);
  if (Number.isNaN(start.getTime())) return "Not provided";

  const now = new Date();

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


function Profile() {
  const navigate = useNavigate();

  // THEME STATE — persisted so every page load keeps the selected mode.
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("ems-dark-mode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ems-dark-mode", String(darkMode));
    } catch {
      // Ignore storage errors.
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  // SEARCH & NAV STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Profile");

  // TOPBAR MENUS STATE
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // PROJECT DIALOG STATE
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState({
    title: "",
    description: "",
    technologies: "",
    features: [],
    status: "",
  });


  const [user, setUser] = useState(null);
const [notifications, setNotifications] = useState([]);

  const showProject = (title, description, technologies, features, status) => {
    setSelectedProject({ title, description, technologies, features, status });
    setOpenProjectDialog(true);
  };


  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get(ENDPOINTS.me);

      if (response.data?.status === 0 || !response.data?.user) {
        throw new Error(response.data?.message || "Unable to load profile");
      }

      setUser(response.data.user);
    } catch (error) {
      console.error("PROFILE FETCH ERROR:", error.response?.data || error);

      setUser(null);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get(ENDPOINTS.notifications);

      if (response.data?.status === 1) {
        setNotifications(response.data.data || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error(
        "PROFILE NOTIFICATIONS ERROR:",
        error.response?.data || error
      );
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, []);

  useEffect(() => {
  const query = searchQuery.trim();

  if (!query) {
    setSearchResults([]);
    setSearchLoading(false);
    return;
  }

  const controller = new AbortController();

  const timer = setTimeout(async () => {
    try {
      setSearchLoading(true);

      console.log("Searching employee:", query);

      const response = await api.post(
        ENDPOINTS.searchEmployees,
        {
          search: query,
        },
        {
          signal: controller.signal,
        }
      );

      console.log("SEARCH API RESPONSE:", response.data);

      const data = response.data;

      if (data?.status === 1) {
        setSearchResults(Array.isArray(data.data) ? data.data : []);
      } else {
        setSearchResults([]);
        console.warn(
          "Search API returned status 0:",
          data?.message || data
        );
      }
    } catch (error) {
      if (error.name !== "CanceledError" && error.name !== "AbortError") {
        console.error(
          "PROFILE SEARCH ERROR:",
          error.response?.data || error.message || error
        );

        setSearchResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setSearchLoading(false);
      }
    }
  }, 300);

  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [searchQuery]);


  // EXACT MATCHING DASHBOARD COLOR THEME TOKENS
  const bgPageGradient = darkMode
    ? "linear-gradient(135deg, #090D16 0%, #0F172A 50%, #080C14 100%)"
    : "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #DBEAFE 100%)";

  const bgSidebarGradient = darkMode
    ? "linear-gradient(180deg, #0F172A 0%, #1E293B 60%, #090D16 100%)"
    : "linear-gradient(180deg, #0284C7 0%, #0369A1 60%, #075985 100%)";

  const bgCard = darkMode ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.85)";
  const bgInnerCard = darkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(224, 242, 254, 0.7)";
  const textPrimary = darkMode ? "#F8FAFC" : "#0F172A";
  const textSecondary = darkMode ? "#94A3B8" : "#0284C7";
  const borderCol = darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(2, 132, 199, 0.18)";

  // Streamlined Sidebar Menu List (MATCHING DASHBOARD & EMPLOYEES)
  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, path: "/employees" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    { text: "Edit Profile", icon: <EditIcon />, path: "/edit-profile" },
    { text: "Change Password", icon: <LockIcon />, path: "/change-password" },
  ];

  // Backend-backed employee fields only.
  // The backend update-user controller supports these fields:
  // name, email, role, user_type, profile_pic, cover_pic,
  // department, designation, phone, joining_date, address, bio,
  // attendance, status and added_by.
  const infoFields = [
    {
      label: "Employee ID",
      value: user?.id ? `#${user.id}` : "Not provided",
      icon: <AssignmentIndIcon />,
      color: "#06B6D4",
    },
    {
      label: "Email Address",
      value: user?.email || "Not provided",
      icon: <EmailIcon />,
      color: "#10B981",
    },
    {
      label: "Phone Number",
      value: user?.phone || "Not provided",
      icon: <PhoneIcon />,
      color: "#F59E0B",
    },
    {
      label: "Department",
      value: user?.department || "Not provided",
      icon: <BusinessIcon />,
      color: "#0284C7",
    },
    {
      label: "Designation",
      value: user?.designation || user?.role || "Not provided",
      icon: <WorkspacePremiumIcon />,
      color: "#3B82F6",
    },
    {
      label: "Joining Date",
      value: formatDate(user?.joining_date),
      icon: <CalendarTodayIcon />,
      color: "#10B981",
    },
    {
      label: "Address",
      value: user?.address || "Not provided",
      icon: <LocationOnIcon />,
      color: "#8B5CF6",
    },
    {
      label: "Attendance",
      value: user?.attendance || "Not provided",
      icon: <CheckCircleIcon />,
      color: "#06B6D4",
    },
  ];


  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #DBEAFE 100%)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#0284C7", mb: 2 }} />
          <Typography fontWeight={700} color="#0284C7">
            Loading your profile...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #DBEAFE 100%)",
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
            border: "1px solid rgba(2,132,199,.18)",
          }}
        >
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
            Profile unavailable
          </Typography>
          <Typography sx={{ mb: 3, color: "#64748B" }}>
            {errorMessage || "Your session may have expired."}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 800,
              background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
            }}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }


const handleLogout = async () => {
    try {
      await api.post(ENDPOINTS.logout, {});
    } catch (error) {
      console.error("LOGOUT ERROR:", error.response?.data || error);
    } finally {
      navigate("/");
    }
  };

const unreadCount = notifications.filter(
  (notification) => Number(notification.is_read) === 0
).length;


const handleNotificationClick = async (notification) => {
    try {
      if (Number(notification.is_read) === 1) {
        setNotifAnchorEl(null);
        return;
      }

      const response = await api.post(ENDPOINTS.readNotification, {
        id: notification.id,
      });

      if (response.data?.status === 1) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: 1 }
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error.response?.data || error
      );
      showToast("Unable to mark notification as read.", "error");
    } finally {
      setNotifAnchorEl(null);
    }
  };


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
          borderRight: `1px solid ${borderCol}`,
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
                background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(6, 182, 212, 0.45)",
              }}
            >
              E
            </Box>
            <Typography variant="h6" fontWeight="800" letterSpacing={0.5} sx={{ color: "#FFFFFF" }}>
              EMS Portal
            </Typography>
          </Box>

          {/* STREAMLINED SIDEBAR MENU ITEMS */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.text;
              return (
                <Button
                  key={item.text}
                  fullWidth
                  startIcon={React.cloneElement(item.icon, {
                    style: { color: isActive ? "#FFFFFF" : "#BAE6FD", fontSize: "20px" },
                  })}
                  onClick={() => {
                    setActiveTab(item.text);
                    if (item.path !== "/profile") navigate(item.path);
                  }}
                  sx={{
                    justifyContent: "flex-start",
                    height: 48,
                    borderRadius: "16px",
                    px: 2,
                    textTransform: "none",
                    fontWeight: isActive ? 700 : 600,
                    fontSize: "14px",
                    color: isActive ? "#FFFFFF" : "#BAE6FD",
                    backgroundColor: isActive ? "#0284C7" : "transparent",
                    boxShadow: isActive ? "0 6px 18px rgba(2, 132, 199, 0.45)" : "none",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: isActive ? "#0369A1" : "rgba(255, 255, 255, 0.12)",
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
          onClick={handleLogout}
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

      {/* MAIN CONTENT AREA */}
      <Box
        sx={{
          flex: 1,
          ml: "250px",
          p: { xs: 3, md: 5 },
          boxSizing: "border-box",
          maxWidth: "calc(100vw - 250px)",
        }}
      >
        {/* TOP BAR — search, dark mode, notifications and backend avatar */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            minHeight: 76,
            px: { xs: 0, md: 0.5 },
            mb: 5,
          }}
        >
          {/* BACKEND EMPLOYEE SEARCH */}
          <Box sx={{ position: "relative", width: { xs: "100%", md: 480 }, zIndex: 40 }}>
            <TextField
              fullWidth
              placeholder="Search employees..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 46,
                  borderRadius: "24px",
                  backgroundColor: darkMode ? "rgba(15,23,42,.82)" : "rgba(255,255,255,.84)",
                  backdropFilter: "blur(12px)",
                  color: textPrimary,
                  fontSize: "14px",
                  boxShadow: "0 4px 18px rgba(6,182,212,.08)",
                  "& fieldset": { borderColor: borderCol },
                  "&:hover fieldset": { borderColor: "#06B6D4" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#06B6D4",
                    boxShadow: "0 0 14px rgba(6,182,212,.25)",
                  },
                },
                "& input::placeholder": {
                  color: darkMode ? "#94A3B8" : "#94A3B8",
                  opacity: 1,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#0284C7", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchLoading ? (
                    <CircularProgress size={17} sx={{ color: "#06B6D4" }} />
                  ) : null,
                },
              }}
            />

        {searchQuery.trim() && (
  <Paper
    elevation={8}
    sx={{
      position: "absolute",
      top: 58,
      left: 0,
      width: { xs: 300, sm: 380, md: 480 },
      zIndex: 9999,
      maxHeight: 380,
      overflowY: "auto",
      borderRadius: "16px",
      border: `1px solid ${borderCol}`,
      backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
      boxShadow: "0 15px 40px rgba(0,0,0,.22)",
      overflow: "hidden",
    }}
  >
    {searchLoading ? (
      <Box
        sx={{
          py: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CircularProgress
          size={22}
          sx={{ color: "#0284C7" }}
        />

        <Typography
          variant="body2"
          sx={{
            color: textSecondary,
            fontWeight: 700,
          }}
        >
          Searching employees...
        </Typography>
      </Box>
    ) : searchResults.length === 0 ? (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <SearchIcon
          sx={{
            fontSize: 30,
            color: textSecondary,
            mb: 1,
          }}
        />

        <Typography
          sx={{
            color: textPrimary,
            fontWeight: 700,
          }}
        >
          No employees found
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: textSecondary }}
        >
          Try another employee name, email or department
        </Typography>
      </Box>
    ) : (
      searchResults.map((employee) => (
        <Box
          key={employee.id}
          onClick={() => {
            setSearchQuery("");
            setSearchResults([]);

            if (Number(employee.id) === Number(user?.id)) {
              navigate("/profile");
            } else {
              navigate("/employees");
            }
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: 2,
            py: 1.5,
            cursor: "pointer",
            borderBottom: `1px solid ${borderCol}`,

            "&:hover": {
              backgroundColor: darkMode
                ? "#1E293B"
                : "#F0F9FF",
            },
          }}
        >
          <Avatar
            src={getImageUrl(employee.profile_pic)}
            alt={employee.name || "Employee"}
            sx={{
              width: 42,
              height: 42,
              mr: 1.5,
              border: "2px solid #06B6D4",
            }}
          >
            {(employee.name || "E")
              .charAt(0)
              .toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: textPrimary,
                fontWeight: 800,
                fontSize: "14px",
              }}
            >
              {employee.name || "Unnamed Employee"}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: textSecondary,
                fontWeight: 600,
                display: "block",
              }}
            >
              {employee.designation ||
                employee.role ||
                "Employee"}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: textSecondary,
                display: "block",
              }}
            >
              {employee.department || "No department"}
              {employee.email
                ? ` • ${employee.email}`
                : ""}
          </Typography>
          </Box>
        </Box>
      ))
    )}
  </Paper>
)}
          </Box>

          {/* RIGHT SIDE — exact compact controls from the reference */}
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1.5 }} sx={{ ml: 2 }}>
            {/* DARK MODE */}
            <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
              <IconButton
                aria-label="toggle dark mode"
                onClick={toggleTheme}
                sx={{
                  ml:-12,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "transparent",
                  color: "#0F172A",
                  p: 0,
                  "&:hover": { backgroundColor: darkMode ? "rgba(255,255,255,.06)" : "rgba(15,23,42,.05)" },
                }}
              >
                {darkMode ? (
  <LightModeIcon
    sx={{
      fontSize: 21,
      color: "#000000",
    }}
  />
) : (
  <DarkModeIcon
    sx={{
      fontSize: 21,
      color: "#000000",
    }}
  />
)}
              </IconButton>
            </Tooltip>

            {/* BACKEND NOTIFICATIONS */}
            <IconButton
              aria-label="notifications"
              onClick={(e) => setNotifAnchorEl(e.currentTarget)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                color: darkMode ? "#F8FAFC" : "#0F172A",
                p: 0,
                "&:hover": { backgroundColor: darkMode ? "rgba(255,255,255,.06)" : "rgba(15,23,42,.05)" },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                invisible={unreadCount === 0}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "10px",
                    fontWeight: 800,
                    minWidth: 19,
                    height: 19,
                    right: -2,
                    top: 1,
                  },
                }}
              >
                <NotificationsNoneIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            {/* REFERENCE-STYLE NOTIFICATION PANEL */}
          {/* REFERENCE-STYLE NOTIFICATION PANEL */}
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
  MenuListProps={{
    disablePadding: true,
  }}
  PaperProps={{
    sx: {
      mt: 1.5,
      p: 0,

      width: 250,
      maxWidth: 250,

      maxHeight: 510,
      overflowY: "auto",

      borderRadius: "4px",

      backgroundColor: darkMode
        ? "#0F172A"
        : "#FFFFFF",

      color: textPrimary,

      border: `1px solid ${
        darkMode
          ? "rgba(255,255,255,.10)"
          : "#E2E8F0"
      }`,

      boxShadow: "0 5px 16px rgba(0,0,0,.20)",

      "& .MuiList-root": {
        p: 0,
      },
    },
  }}
>
  {/* HEADER */}
  <Box
    sx={{
      px: 1.5,
      py: 1.4,

      borderBottom: `1px solid ${
        darkMode
          ? "rgba(255,255,255,.10)"
          : "#E2E8F0"
      }`,

      backgroundColor: darkMode
        ? "#111827"
        : "#FFFFFF",
    }}
  >
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 500,
        color: textPrimary,
      }}
    >
      Notifications & Alerts
    </Typography>
  </Box>

  {notifications.length === 0 ? (
    <Box
      sx={{
        px: 2,
        py: 4,
        textAlign: "center",
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: textSecondary }}
      >
        No notifications
      </Typography>
    </Box>
  ) : (
    notifications.map((notification, index) => {
      const unread =
        Number(notification.is_read) === 0;

      const title =
        notification.title ||
        notification.message ||
        "Notification";

      // Backend already provides this:
      // "Dikha • Engineering"
      const subtitle =
        notification.subtitle ||
        notification.description ||
        notification.department ||
        "";

      // DO NOT use created_at here.
      const time =
        notification.time ||
        notification.time_ago ||
        "";

      return (
        <Box
          key={notification.id || index}
          onClick={() =>
            handleNotificationClick(notification)
          }
          sx={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",

            px: 1.5,
            py: 1.35,

            minHeight: 72,

            cursor: "pointer",

            borderBottom:
              index === notifications.length - 1
                ? "none"
                : `1px solid ${
                    darkMode
                      ? "rgba(255,255,255,.10)"
                      : "#DCEAF3"
                  }`,

            backgroundColor: unread
              ? darkMode
                ? "#172554"
                : "#EEF9FC"
              : darkMode
              ? "#0F172A"
              : "#FFFFFF",

            "&:hover": {
              backgroundColor: darkMode
                ? "#1E293B"
                : "#F1F5F9",
            },
          }}
        >
          {/* TITLE */}
          
        <Typography
  sx={{
    fontSize: 15,
    lineHeight: 1.35,
    fontWeight: 800,
    color: darkMode ? "#F8FAFC" : "#172033",
    mb: 0.4,
  }}
>
  {title}
</Typography>

          {/* SUBTITLE */}
          <Typography
            sx={{
              fontSize: 11.5,
              lineHeight: 1.35,

              color: darkMode
                ? "#38BDF8"
                : "#0284C7",

              fontWeight: 600,
            }}
          >
            {subtitle}
            {subtitle && time ? " • " : ""}
            {time}
          </Typography>
        </Box>
      );
    })
  )}
</Menu>

            <Divider orientation="vertical" flexItem sx={{ height: 28, borderColor: borderCol, mx: 0.25 }} />

            {/* BACKEND AVATAR + NAME */}
            <Box
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer", pl: 0.25 ,mt:-9}}
            >
              <Avatar
                src={getImageUrl(user?.profile_pic)}
                alt={user?.name || "User"}
                onError={(e) => { e.currentTarget.src = ""; }}
                sx={{
                  
                  width: 42,
                  height: 42,
                  border: "2px solid #06B6D4",
                  boxShadow: "0 0 12px rgba(6,182,212,.35)",
                  backgroundColor: darkMode ? "#334155" : "#CBD5E1",
                  color: "#FFFFFF",
                }}
              >
                {(user?.name || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 70 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2, color: textPrimary }}>
                  {user?.name || "User"}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700 }}>
                  {user?.role || user?.designation || "user"}
                </Typography>
              </Box>
            </Box>

            {/* PROFILE MENU */}
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={() => setProfileAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: "10px",
                  width: 190,
                  p: 0.5,
                  backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
                  color: textPrimary,
                  border: `1px solid ${borderCol}`,
                },
              }}
            >
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/profile"); }} sx={{ fontWeight: 700 }}>
                My Profile
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/edit-profile"); }} sx={{ fontWeight: 700 }}>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/change-password"); }} sx={{ fontWeight: 700 }}>
                Change Password
              </MenuItem>
              <Divider sx={{ my: 0.5, borderColor: borderCol }} />
              <MenuItem onClick={handleLogout} sx={{ color: "#EF4444 !important", fontWeight: 800 }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* PROFILE HEADER HERO CARD */}
        <Paper
          elevation={0}
          sx={{
            p: 4.5,
            mb: 5,
            textAlign: "center",
            backgroundColor: bgCard,
            backdropFilter: "blur(12px)",
            border: `1px solid ${borderCol}`,
            borderRadius: "28px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Avatar
  src={getImageUrl(user?.profile_pic)}
  alt={user?.name || "User"}
  onError={(e) => { e.currentTarget.src = ""; }}
  sx={{
    width: 120,
    height: 120,
    margin: "auto",
    mb: 2,
    border: "4px solid #06B6D4",
    boxShadow: "0 8px 24px rgba(6,182,212,.4)",
  }}
/>

          <Typography variant="h4" fontWeight="900" sx={{ color: textPrimary, mb: 0.5, letterSpacing: "-0.02em" }}>
          {user?.name}
          </Typography>

          <Typography variant="subtitle1" fontWeight="700" sx={{ color: textSecondary, mb: 2 }}>
            {user?.role}
          </Typography>

          <Chip
            label={
              user?.status === 1
                ? "Active Employee"
                : "Inactive Employee"
            }
            icon={<CheckCircleIcon sx={{ color: "#FFFFFF !important", fontSize: "16px !important" }} />}
            sx={{
              background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "12px",
              px: 1.5,
              py: 2,
              borderRadius: "14px",
              boxShadow: "0 6px 18px rgba(6, 182, 212, 0.35)",
            }}
          />
        </Paper>

        {/* SPECIAL HIGH-IMPACT VIBRANT 3 STATS KPI CARDS */}
        <Grid container spacing={4} mb={5}>
          {/* STAT CARD 1: EXPERIENCE */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                mb:3,
                p: 3.5,
                borderRadius: "26px",
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                border: `1px solid ${borderCol}`,
                borderTop: "5px solid #06B6D4",
                boxShadow: "0 10px 30px rgba(6, 182, 212, 0.12)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: "0 16px 40px rgba(6, 182, 212, 0.25)",
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(6, 182, 212, 0.4)",
                  }}
                >
                  <WorkspacePremiumIcon sx={{ fontSize: 26 }} />
                </Box>
                <Chip
                  label="+ Full-Time"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(6, 182, 212, 0.15)",
                    color: "#06B6D4",
                    fontWeight: 800,
                    fontSize: "11px",
                  }}
                />
              </Box>

              <Typography variant="body2" fontWeight="800" sx={{ color: textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Experience
              </Typography>
              <Typography variant="h3" fontWeight="900" sx={{ color: textPrimary, my: 0.5, fontSize: "36px" }}>
                {calculateExperience(user?.joining_date)}
              </Typography>
              <Typography variant="caption" fontWeight="600" sx={{ color: textSecondary }}>
                {user?.joining_date
                  ? `Joined ${formatDate(user.joining_date)}`
                  : "Joining date not provided"}
              </Typography>
            </Card>
          </Grid>

          {/* STAT CARD 2: PROJECTS */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: "26px",
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                border: `1px solid ${borderCol}`,
                borderTop: "5px solid #10B981",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.12)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: "0 16px 40px rgba(16, 185, 129, 0.25)",
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)",
                  }}
                >
                  <FolderSpecialIcon sx={{ fontSize: 26 }} />
                </Box>
                <Chip
                  label="100% Delivered"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    color: "#10B981",
                    fontWeight: 800,
                    fontSize: "11px",
                  }}
                />
              </Box>

              <Typography variant="body2" fontWeight="800" sx={{ color: textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Projects Completed
              </Typography>
              <Typography variant="h3" fontWeight="900" sx={{ color: textPrimary, my: 0.5, fontSize: "36px" }}>
                {user?.status === 1 ? "Active" : "Inactive"}
              </Typography>
              <Typography variant="caption" fontWeight="600" sx={{ color: "#10B981" }}>
                {user?.attendance || "Attendance not provided"}
              </Typography>
            </Card>
          </Grid>

          {/* STAT CARD 3: TECH SKILLS */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: "26px",
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                border: `1px solid ${borderCol}`,
                borderTop: "5px solid #F59E0B",
                boxShadow: "0 10px 30px rgba(245, 158, 11, 0.12)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: "0 16px 40px rgba(245, 158, 11, 0.25)",
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(245, 158, 11, 0.4)",
                  }}
                >
                  <StarIcon sx={{ fontSize: 26 }} />
                </Box>
                <Chip
                  label="Multi-Stack"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "#F59E0B",
                    fontWeight: 800,
                    fontSize: "11px",
                  }}
                />
              </Box>

              <Typography variant="body2" fontWeight="800" sx={{ color: textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Backend Profile Summary
              </Typography>
              <Typography variant="h3" fontWeight="900" sx={{ color: textPrimary, my: 0.5, fontSize: "36px" }}>
                {user?.designation || user?.role || "Employee"}
              </Typography>
              <Typography variant="caption" fontWeight="600" sx={{ color: textSecondary }}>
                {user?.department || "Department not provided"}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* SIDE-BY-SIDE: EMPLOYEE INFORMATION (LEFT) & TECHNICAL SKILLS (RIGHT) */}
        <Grid container spacing={4} mb={5}>
          {/* LEFT COLUMN: EMPLOYEE INFORMATION */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 3.5 },
                height: "100%",
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                borderRadius: "28px",
                border: `1px solid ${borderCol}`,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 14px 40px rgba(6, 182, 212, 0.18)",
                },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <Box>
                {/* SECTION HEADER */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      boxShadow: "0 6px 16px rgba(6, 182, 212, 0.4)",
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, fontSize: "19px", letterSpacing: "-0.01em" }}>
                      Employee Information
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, fontSize: "13px", fontWeight: 600 }}>
                      Official record & personal contact details
                    </Typography>
                  </Box>
                </Box>

                {/* 2-COLUMN GRID OF INFO CARDS */}
                <Grid container spacing={2}>
                  {infoFields.map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "18px",
                          backgroundColor: bgInnerCard,
                          border: `1px solid ${borderCol}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 20px ${item.color}35`,
                            borderColor: item.color,
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            backgroundColor: `${item.color}20`,
                            color: item.color,
                            border: `1px solid ${item.color}40`,
                          }}
                        >
                          {item.icon}
                        </Avatar>

                        <Box>
                          <Typography
                            variant="caption"
                            fontWeight="800"
                            sx={{
                              color: textSecondary,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "10px",
                              display: "block",
                              mb: 0.2,
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="800" sx={{ color: textPrimary, fontSize: "13.5px", lineHeight: 1.2 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: TECHNICAL SKILLS & FRAMEWORKS */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 3.5 },
                height: "100%",
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                borderRadius: "28px",
                border: `1px solid ${borderCol}`,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 14px 40px rgba(16, 185, 129, 0.18)",
                },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <Box>
                {/* SECTION HEADER */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    <StarIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, fontSize: "19px", letterSpacing: "-0.01em" }}>
                      Technical Skills & Stack
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, fontSize: "13px", fontWeight: 600 }}>
                      Information returned by the authenticated profile API
                    </Typography>
                  </Box>
                </Box>

                {/* SKILLS BADGE GRID WITH HOVER STYLING */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {[
                    { name: "React 19", level: "Expert", color: "#06B6D4" },
                    { name: "Material UI", level: "Advanced", color: "#0284C7" },
                    { name: "JavaScript ES6+", level: "Expert", color: "#F59E0B" },
                    { name: "Python", level: "Proficient", color: "#10B981" },
                    { name: "Node.js", level: "Advanced", color: "#3B82F6" },
                    { name: "Express.js", level: "Advanced", color: "#06B6D4" },
                    { name: "MongoDB", level: "Proficient", color: "#10B981" },
                    { name: "MySQL", level: "Proficient", color: "#0284C7" },
                    { name: "Angular", level: "Intermediate", color: "#F59E0B" },
                    { name: "SDLC & Agile", level: "Lead Track", color: "#06B6D4" },
                  ].map((skill) => (
                    <Paper
                      key={skill.name}
                      elevation={0}
                      sx={{
                        px: 2,
                        py: 1.2,
                        borderRadius: "14px",
                        backgroundColor: bgInnerCard,
                        color: textPrimary,
                        border: `1px solid ${borderCol}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          backgroundColor: skill.color,
                          color: "#FFFFFF",
                          transform: "translateY(-4px) scale(1.04)",
                          boxShadow: `0 8px 20px ${skill.color}50`,
                          borderColor: skill.color,
                          "& .skill-level": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            color: "#FFFFFF",
                          },
                        },
                      }}
                    >
                      <Typography fontWeight="800" sx={{ fontSize: "14px" }}>
                        {skill.name}
                      </Typography>
                      <Chip
                        className="skill-level"
                        label={skill.level}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "10px",
                          fontWeight: 800,
                          backgroundColor: `${skill.color}20`,
                          color: skill.color,
                          transition: "all 0.2s ease",
                        }}
                      />
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* BACKEND PROFILE BIO / ADDRESS */}
        {(user?.bio || user?.address) && (
          <Paper
            elevation={0}
            sx={{
              mt:3,
              p: { xs: 3, md: 3.5 },
              mb: 5,
              backgroundColor: bgCard,
              backdropFilter: "blur(12px)",
              borderRadius: "28px",
              border: `1px solid ${borderCol}`,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <InfoOutlinedIcon />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="900"
                  sx={{ color: textPrimary }}
                >
                  About Me
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: textSecondary, fontWeight: 600 }}
                >
                  Information stored in your employee profile
                </Typography>
              </Box>
            </Box>

            {user?.bio && (
              <Typography
                variant="body1"
                sx={{ color: textPrimary, lineHeight: 1.8, mb: 2 }}
              >
                {user.bio}
              </Typography>
            )}

            {user?.address && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon sx={{ color: "#8B5CF6" }} />
                <Typography sx={{ color: textPrimary, fontWeight: 700 }}>
                  {user.address}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* PROJECTS
             No project endpoint was present in the supplied backend.
             These cards therefore remain portfolio metadata, not employee DB records.
        */}
        <Typography variant="h5" fontWeight="900" sx={{ mt: 3, color: textPrimary, mb: 3, fontSize: "22px" }}>
          My Featured Projects
        </Typography>

        {/* 3 FEATURED PROJECTS GRID */}
        <Grid container spacing={4} mb={6}>
          {/* PROJECT 1 */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                p: 3.5,
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                borderRadius: "26px",
                border: `1px solid ${borderCol}`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
                boxSizing: "border-box",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 32px rgba(6, 182, 212, 0.22)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <CardContent sx={{ p: "0 !important" }}>
                <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, mb: 0.5 }}>
                  Employee Management
                </Typography>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, display: "block", mb: 2 }}>
                  React • MUI • MongoDB
                </Typography>
                <Typography variant="body2" sx={{ color: textPrimary, mb: 2, fontSize: "14px" }}>
                  Complete enterprise workforce portal with authentication, roster directory, profile setup, and analytics.
                </Typography>
                <Chip label="Status: Completed" size="small" sx={{ fontWeight: 800, bgcolor: "rgba(16, 185, 129, 0.2)", color: "#10B981", mb: 2 }} />
              </CardContent>
              <Button
                variant="contained"
                fullWidth
                onClick={() =>
                  showProject(
                    "Employee Management Portal",
                    "A complete employee management portal developed using React 19, Vite, and Material UI v6.",
                    "React, Material UI, JavaScript, MongoDB",
                    ["Authentication & Security", "Interactive Dashboard", "Workforce Directory", "Profile Management", "Responsive Mobile Layout"],
                    "Completed"
                  )
                }
                sx={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 800,
                  py: 1.2,
                  boxShadow: "0 6px 18px rgba(6, 182, 212, 0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" },
                }}
              >
                View Details
              </Button>
            </Card>
          </Grid>

          {/* PROJECT 2 */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                p: 3.5,
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                borderRadius: "26px",
                border: `1px solid ${borderCol}`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
                boxSizing: "border-box",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 32px rgba(6, 182, 212, 0.22)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <CardContent sx={{ p: "0 !important" }}>
                <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, mb: 0.5 }}>
                  Retinax App
                </Typography>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, display: "block", mb: 2 }}>
                  Android Mobile • Kotlin
                </Typography>
                <Typography variant="body2" sx={{ color: textPrimary, mb: 2, fontSize: "14px" }}>
                  Offline mobile application for medical eye disease diagnosis using TensorFlow Lite model conversion.
                </Typography>
                <Chip label="Status: Completed" size="small" sx={{ fontWeight: 800, bgcolor: "rgba(16, 185, 129, 0.2)", color: "#10B981", mb: 2 }} />
              </CardContent>
              <Button
                variant="contained"
                fullWidth
                onClick={() =>
                  showProject(
                    "Retinax Mobile Diagnosis App",
                    "Offline Android application for real-time eye disease detection and classification.",
                    "Kotlin, TensorFlow Lite, Android SDK",
                    ["Offline Predictions", "Real-Time Image Processing", "Mobile Camera Integration", "TensorFlow Lite Conversion"],
                    "Completed"
                  )
                }
                sx={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 800,
                  py: 1.2,
                  boxShadow: "0 6px 18px rgba(6, 182, 212, 0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" },
                }}
              >
                View Details
              </Button>
            </Card>
          </Grid>

          {/* PROJECT 3 */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                p: 3.5,
                backgroundColor: bgCard,
                backdropFilter: "blur(12px)",
                borderRadius: "26px",
                border: `1px solid ${borderCol}`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
                boxSizing: "border-box",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 32px rgba(6, 182, 212, 0.22)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <CardContent sx={{ p: "0 !important" }}>
                <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, mb: 0.5 }}>
                  Fusion Model
                </Typography>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, display: "block", mb: 2 }}>
                  MobileNetV3 • DenseNet
                </Typography>
                <Typography variant="body2" sx={{ color: textPrimary, mb: 2, fontSize: "14px" }}>
                  Feature-level fusion deep learning architecture for high-accuracy medical diagnosis.
                </Typography>
                <Chip label="Status: Completed" size="small" sx={{ fontWeight: 800, bgcolor: "rgba(16, 185, 129, 0.2)", color: "#10B981", mb: 2 }} />
              </CardContent>
              <Button
                variant="contained"
                fullWidth
                onClick={() =>
                  showProject(
                    "Feature Fusion Deep Learning Model",
                    "Feature level fusion model combining MobileNetV3 and DenseNet for eye disease detection.",
                    "Python, TensorFlow, Keras, MobileNetV3, DenseNet",
                    ["Feature Fusion", "Deep Learning Pipeline", "Medical Dataset Evaluation", "High Accuracy Classification"],
                    "Completed"
                  )
                }
                sx={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 800,
                  py: 1.2,
                  boxShadow: "0 6px 18px rgba(6, 182, 212, 0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" },
                }}
              >
                View Details
              </Button>
            </Card>
          </Grid>
        </Grid>

        {/* ACTION BUTTONS */}
        <Box sx={{ display: "flex", gap: 2.5, justifyContent: "center", mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/edit-profile")}
            sx={{
              borderRadius: "18px",
              background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 800,
              fontSize: "15px",
              px: 4.5,
              py: 1.6,
              boxShadow: "0 8px 25px rgba(6, 182, 212, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Edit Profile
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/change-password")}
            sx={{
              borderRadius: "18px",
              borderColor: borderCol,
              color: textPrimary,
              textTransform: "none",
              fontWeight: 800,
              fontSize: "15px",
              px: 4.5,
              py: 1.6,
              backgroundColor: bgCard,
              "&:hover": { borderColor: "#06B6D4", backgroundColor: bgInnerCard },
            }}
          >
            Change Password
          </Button>
        </Box>

        {/* FOOTER */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
            © 2026 Employee Management System • Enterprise Workspace
          </Typography>
        </Box>
      </Box>

      {/* PROJECT DETAILS MODAL DIALOG */}
      <Dialog
        open={openProjectDialog}
        onClose={() => setOpenProjectDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 2.5,
            backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
            color: textPrimary,
            border: `1px solid ${borderCol}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: "20px", display: "flex", justifyContent: "space-between", color: textPrimary }}>
          {selectedProject.title}
          <IconButton onClick={() => setOpenProjectDialog(false)} sx={{ color: textSecondary }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: textPrimary, mb: 2 }}>
            {selectedProject.description}
          </Typography>

          <Typography variant="subtitle2" fontWeight="800" sx={{ color: textSecondary, mt: 2, mb: 0.5 }}>
            Technologies Used:
          </Typography>
          <Typography variant="body2" sx={{ color: textPrimary, mb: 2 }}>
            {selectedProject.technologies}
          </Typography>

          <Typography variant="subtitle2" fontWeight="800" sx={{ color: textSecondary, mb: 0.5 }}>
            Key Features:
          </Typography>
          {selectedProject.features.map((feat, idx) => (
            <Typography key={idx} variant="body2" sx={{ color: textPrimary, ml: 1, mb: 0.5 }}>
              • {feat}
            </Typography>
          ))}

          <Box mt={3}>
            <Chip label={`Status: ${selectedProject.status}`} sx={{ fontWeight: 800, bgcolor: "rgba(16, 185, 129, 0.2)", color: "#10B981" }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenProjectDialog(false)}
            variant="contained"
            sx={{
              borderRadius: "14px",
              background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
              textTransform: "none",
              fontWeight: 800,
              px: 3,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4500}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={closeToast}
          sx={{ borderRadius: "14px", fontWeight: 700 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Profile;