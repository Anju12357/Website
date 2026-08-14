import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Material UI Core Imports
import {
  Box,
  Typography,
  Button,
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
  Snackbar,
  Alert,
  LinearProgress,
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
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SecurityIcon from "@mui/icons-material/Security";
import KeyIcon from "@mui/icons-material/Key";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

function ChangePassword() {
  const navigate = useNavigate();

  // THEME STATE (DARK & LIGHT MODE) MATCHING DASHBOARD
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode(!darkMode);

  // SEARCH & NAV STATE


  const [searchQuery, setSearchQuery] = useState("");
const [, setSearchResults] = useState([]);
const [, setSearchLoading] = useState(false);

const [notifications, setNotifications] = useState([]);

const [, setNotificationLoading] = useState(false);






const unreadCount = notifications.filter(
  (item) => Number(item.is_read) === 0
).length;

const [activeTab, setActiveTab] = useState("Change Password");

  // TOPBAR MENUS STATE
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // TOAST SNACKBAR STATE
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // PASSWORD FORM STATE
// PASSWORD FORM STATE
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordUpdating, setPasswordUpdating] = useState(false);


  const [user, setUser] = useState(null);
const [currentTime, setCurrentTime] = useState(0);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
const lineDivider = darkMode
  ? "rgba(255, 255, 255, 0.08)"
  : "rgba(2, 132, 199, 0.18)";


  // Streamlined Sidebar Menu List (MATCHING PORTAL STANDARDS)
  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, path: "/employees" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    { text: "Edit Profile", icon: <EditIcon />, path: "/edit-profile" },
    { text: "Change Password", icon: <LockIcon />, path: "/change-password" },
  ];

  // PASSWORD STRENGTH CALCULATOR
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: "Empty", color: borderCol };
    let score = 0;
    if (pass.length >= 8) score += 30;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score < 40) return { score, label: "Weak Password", color: "#EF4444" };
    if (score < 75) return { score, label: "Medium Strength", color: "#F59E0B" };
    return { score, label: "Strong & Secure", color: "#10B981" };
  };

  const strength = calculateStrength(newPassword);



 const fetchUser = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/auth/me",
      {
        withCredentials: true,
      }
    );

    console.log("AUTH ME RESPONSE:", response.data);

    const backendUser = response.data?.user;

    if (backendUser) {
      // Support whichever field your backend currently returns
      const passwordChangedAt =
        backendUser.password_changed_at ||
        backendUser.passwordChangedAt ||
        backendUser.password_change_date ||
        backendUser.passwordChanged ||
        backendUser.updated_at ||
        backendUser.updatedAt ||
        null;

      setUser({
        ...backendUser,
        password_changed_at: passwordChangedAt,
      });
    }
  } catch (error) {
    console.error("FETCH USER ERROR:", error.response?.data || error);
  }
};

const fetchNotifications = async () => {
  try {
    setNotificationLoading(true);

    const response = await axios.get(
      "http://localhost:4000/notifications",
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setNotifications(response.data.data || []);
    } else {
      setNotifications([]);
    }
  } catch (error) {
    console.error(
      "FETCH NOTIFICATIONS ERROR:",
      error
    );

    setNotifications([]);
  } finally {
    setNotificationLoading(false);
  }
};

useEffect(() => {
  fetchUser();
  fetchNotifications();

  // Set current time after the component has rendered
  setCurrentTime(Date.now());

  // Keep the "Password Last Changed" display updated
  const timer = setInterval(() => {
    setCurrentTime(Date.now());
  }, 60000);

  return () => clearInterval(timer);
}, []);

const searchUsers = async (search) => {
  if (!search.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    setSearchLoading(true);

    const response = await axios.post(
      "http://localhost:4000/webservices/users/search-users",
      {
        search: search.trim(),
      },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setSearchResults(response.data.data || []);
    } else {
      setSearchResults([]);
    }
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    setSearchResults([]);
  } finally {
    setSearchLoading(false);
  }
};




const markNotificationAsRead = async (id) => {
  try {
    await axios.post(
      "http://localhost:4000/notifications/read",
      {
        id: id,
      },
      {
        withCredentials: true,
      }
    );

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, is_read: 1 }
          : item
      )
    );
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  if (passwordUpdating) return;

  if (!currentPassword) {
    setSnackbar({
      open: true,
      message: "Please enter your current password.",
      severity: "error",
    });
    return;
  }

  if (newPassword.length < 8) {
    setSnackbar({
      open: true,
      message: "Password must be at least 8 characters.",
      severity: "error",
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    setSnackbar({
      open: true,
      message: "Passwords do not match.",
      severity: "error",
    });
    return;
  }

  if (!user?.id) {
    setSnackbar({
      open: true,
      message: "User information is not loaded. Please refresh the page.",
      severity: "error",
    });
    return;
  }

  try {
    setPasswordUpdating(true);

    console.log("Changing password for user:", user.id);

    const response = await axios.post(
      "http://localhost:4000/webservices/users/change-password",
      {
        id: user.id,
        password: newPassword,
        currentPassword: currentPassword,
      },
      {
        withCredentials: true,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("CHANGE PASSWORD RESPONSE:", response.data);

    const success =
      Number(response.data?.status) === 1 ||
      response.data?.success === true;

    if (!success) {
      setSnackbar({
        open: true,
        message:
          response.data?.message ||
          response.data?.error ||
          "Password update failed.",
        severity: "error",
      });

      return;
    }

    // Get timestamp returned by backend, if available
    const updatedUser =
      response.data?.user ||
      response.data?.data?.user;

    if (updatedUser) {
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      if (updatedUser.password_changed_at) {
        setCurrentTime(Date.now());
      }
    }

    // Clear form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setSnackbar({
      open: true,
      message: "Password Updated Successfully",
      severity: "success",
    });

    // Go to profile after successful update
    setTimeout(() => {
      navigate("/profile");
    }, 1500);

  } catch (error) {
    console.error("========== CHANGE PASSWORD ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Backend response:", error.response?.data);
    console.error("Error:", error.message);
    console.error("==========================================");

    let errorMessage = "Something went wrong. Please try again.";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.status === 400) {
      errorMessage = "Invalid password details.";
    } else if (error.response?.status === 401) {
      errorMessage = "Current password is incorrect.";
    } else if (error.response?.status === 404) {
      errorMessage = "Password update API was not found.";
    } else if (error.response?.status === 500) {
      errorMessage = "Server error while updating password.";
    } else if (error.request) {
      errorMessage =
        "Cannot connect to backend. Make sure your backend is running on port 4000.";
    }

    setSnackbar({
      open: true,
      message: errorMessage,
      severity: "error",
    });

  } finally {
    setPasswordUpdating(false);
  }
};








const getPasswordChangedText = (date) => {
  if (!date) {
    return "Password Last Changed: Unknown";
  }

  const changedDate = new Date(date);

  if (Number.isNaN(changedDate.getTime())) {
    return "Password Last Changed: Unknown";
  }

  const diffMs = Math.max(
    0,
    currentTime - changedDate.getTime()
  );

  const diffMinutes = Math.floor(
    diffMs / (1000 * 60)
  );

  const diffHours = Math.floor(
    diffMs / (1000 * 60 * 60)
  );

  const diffDays = Math.floor(
    diffMs / (1000 * 60 * 60 * 24)
  );

  if (diffMinutes < 1) {
    return "Password Last Changed: Just Now";
  }

  if (diffMinutes < 60) {
    return `Password Last Changed: ${diffMinutes} ${
      diffMinutes === 1 ? "Minute" : "Minutes"
    } Ago`;
  }

  if (diffHours < 24) {
    return `Password Last Changed: ${diffHours} ${
      diffHours === 1 ? "Hour" : "Hours"
    } Ago`;
  }

  if (diffDays === 1) {
    return "Password Last Changed: Yesterday";
  }

  if (diffDays < 30) {
    return `Password Last Changed: ${diffDays} Days Ago`;
  }

  return `Password Last Changed: ${changedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  )}`;
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
                    if (item.path !== "/change-password") navigate(item.path);
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
        {/* SINGLE TOP NAVIGATION BAR */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            mb: 5,
          }}
        >
          {/* SEARCH BAR */}
          <TextField
            placeholder="Search security settings, passwords, 2FA..."
            size="small"
            value={searchQuery}
           onChange={(e) => {
  const value = e.target.value;
  setSearchQuery(value);

  clearTimeout(window.searchTimer);

  window.searchTimer = setTimeout(() => {
    searchUsers(value);
  }, 400);
}}


            sx={{
              width: { xs: 240, sm: 380, md: 480 },
              "& .MuiOutlinedInput-root": {
                height: 48,
                borderRadius: "24px",
                backgroundColor: darkMode ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                color: textPrimary,
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(6, 182, 212, 0.08)",
                transition: "all 0.3s ease",
                "& fieldset": { borderColor: borderCol },
                "&:hover fieldset": { borderColor: "#06B6D4" },
                "&.Mui-focused fieldset": { borderColor: "#06B6D4", boxShadow: "0 0 16px rgba(6, 182, 212, 0.35)" },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: textSecondary, fontSize: "20px" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

                    
          {/* TOP RIGHT ACTIONS (DARK THEME TOGGLE, NOTIFICATIONS & AVATAR ALIGNED ON SAME HORIZONTAL LINE) */}
                    <Box display="flex" alignItems="center" gap={2} >
                      {/* 1. DARK / LIGHT THEME TOGGLE BUTTON */}
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton
               onClick={toggleTheme}
                          sx={{ml:-12,
                            backgroundColor: darkMode ? "rgba(153, 192, 255, 0.8)" : "rgba(224, 242, 254, 0.8)",
                            p: 1.2,
                            borderRadius: "16px",
                            color: textPrimary,
                            transition: "transform 0.2s ease",
                            "&:hover": { transform: "rotate(15deg)" },
                          }}
                        >
              
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
                      {/* 2. NOTIFICATIONS BELL BUTTON */}
                      <IconButton
                        onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                        sx={{
                          backgroundColor: darkMode ? "rgba(30, 41, 59, 0.8)" : "rgba(224, 242, 254, 0.8)",
                          p: 1.2,
                          borderRadius: "16px",
                          transition: "transform 0.2s ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      >
                        <Badge
            badgeContent={unreadCount}
            color="error"
            invisible={unreadCount === 0}
          >
                          <NotificationsNoneIcon sx={{ color: textPrimary, fontSize: 20 }} />
                        </Badge>
                      </IconButton>
          
                      <Menu
                        anchorEl={notifAnchorEl}
                        open={Boolean(notifAnchorEl)}
                        onClose={() => setNotifAnchorEl(null)}
                        PaperProps={{
                          sx: {
                            borderRadius: "20px",
                            width: 340,
                            p: 2,
                            backgroundColor: darkMode ? "#0F172A !important" : "#FFFFFF !important",
                            color: textPrimary,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                          },
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="800" sx={{ p: 1, fontSize: "16px" }}>
                          Notifications & Alerts
                        </Typography>
                        <Divider sx={{ my: 1.5, borderColor: lineDivider }} />
          {notifications.map((item) => (
            <Box
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              sx={{
                cursor: "pointer",
                p: 2,
                borderBottom: `1px solid ${lineDivider}`,
                backgroundColor:
                  item.is_read === 0
                    ? "rgba(6, 182, 212, 0.08)"
                    : "transparent",
              }}
            >
              <Typography
  sx={{
    fontSize: 15,
    lineHeight: 1.35,
    fontWeight: 800,
    color: darkMode ? "#F8FAFC" : "#172033",
    mb: 0.4,
  }}
>
  {item.title}
</Typography>
              <Typography
  sx={{
    fontSize: 11.5,
    lineHeight: 1.35,
    color: darkMode ? "#38BDF8" : "#0284C7",
    fontWeight: 600,
  }}
              >
                {item.subtitle}
              </Typography>
            </Box>
          ))}
                      </Menu>
          
                      <Divider orientation="vertical" flexItem sx={{ height: 28, borderColor: lineDivider }} />
          
                      {/* 3. USER PROFILE AVATAR & NAME */}
                      <Box
            onClick={(e) => setProfileAnchorEl(e.currentTarget)}
            sx={{mt:-9,
              display: "flex",alignItems: "center", gap: 1.5, cursor: "pointer" }}>
                        <Avatar
                          src={user?.profile_pic}sx={{ width: 42, height: 42, border: "2px solid #06B6D4", boxShadow: "0 0 12px rgba(6,182,212,0.4)" }} />
                        <Box sx={{ display: { xs: "none", md: "block" } }}>
                          <Typography variant="subtitle2" fontWeight="800" sx={{ color: textPrimary, lineHeight: 1.2 }}>{user?.name}</Typography>
                          <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700 }}>{user?.role}</Typography>
                        </Box>
                      </Box>
          

            {/* PROFILE MENU */}
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={() => setProfileAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: "18px",
                  width: 190,
                  p: 1,
                  backgroundColor: darkMode ? "#0F172A !important" : "#FFFFFF !important",
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
              <Divider sx={{ my: 1, borderColor: borderCol }} />
              <MenuItem onClick={() => navigate("/")} sx={{ color: "#FF4D4D !important", fontWeight: 800 }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* HERO SECURITY HEADER BANNER */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 5,
            backgroundColor: bgCard,
            backdropFilter: "blur(12px)",
            border: `1px solid ${borderCol}`,
            borderRadius: "28px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 8px 24px rgba(6, 182, 212, 0.45)",
              }}
            >
              <ShieldIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="900" sx={{ color: textPrimary, letterSpacing: "-0.01em" }}>
                Account Security & Password Settings
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
                Manage your credentials, 2FA status, and authentication security guidelines
              </Typography>
            </Box>
          </Box>

         <Chip
  label={getPasswordChangedText(user?.password_changed_at)}
  sx={{
    background:
      "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
    color: "#FFFFFF",
    fontWeight: 800,
    px: 2,
    py: 2.3,
    borderRadius: "14px",
    boxShadow:
      "0 6px 18px rgba(6, 182, 212, 0.35)",
  }}
/>
        </Paper>

        {/* CENTERED FORM CONTAINER */}
        <Box sx={{ maxWidth: 780, mx: "auto" }}>
          {/* SECURITY GUIDELINE ALERT BANNER */}
          <Alert
            severity="info"
            icon={<SecurityIcon sx={{ color: "#06B6D4 !important", fontSize: "24px" }} />}
            sx={{
              borderRadius: "20px",
              mb: 4,
              backgroundColor: bgInnerCard,
              color: textPrimary,
              border: `1px solid ${borderCol}`,
              p: 2.5,
              fontWeight: 600,
              "& .MuiAlert-icon": { alignItems: "center" },
            }}
          >
            <Typography variant="subtitle2" fontWeight="900" sx={{ color: textPrimary, mb: 0.5 }}>
              Enterprise Security Requirement
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
              Passwords must be at least 8 characters long, containing a mix of uppercase letters, numbers, and special symbols. Passwords automatically expire every 90 days as per corporate policy.
            </Typography>
          </Alert>

          {/* MAIN FORM CARD */}
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 3.5, md: 4.5 },
              borderRadius: "28px",
              backgroundColor: bgCard,
              backdropFilter: "blur(12px)",
              border: `1px solid ${borderCol}`,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 14px 40px rgba(6, 182, 212, 0.18)",
              },
            }}
          >
            {/* CARD TITLE & ICON HEADER */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 4,
                pb: 2.5,
                borderBottom: `1px solid ${borderCol}`,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "16px",
                  backgroundColor: bgInnerCard,
                  color: "#06B6D4",
                  display: "flex",
                  border: `1px solid ${borderCol}`,
                }}
              >
                <KeyIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary }}>
                  Update Password Credentials
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>
                  Enter your current password to verify identity before saving
                </Typography>
              </Box>
            </Box>

            {/* CURRENT PASSWORD FIELD */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, color: textPrimary }}>
                Current Password
              </Typography>
              <TextField
                fullWidth
                type={showCurrent ? "text" : "password"}
                placeholder="Enter your current account password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 52,
                    borderRadius: "16px",
                    backgroundColor: bgInnerCard,
                    color: textPrimary,
                    "& fieldset": { borderColor: borderCol },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
                    "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon sx={{ color: textSecondary, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" sx={{ color: textSecondary }}>
                          {showCurrent ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* NEW PASSWORD FIELD */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, color: textPrimary }}>
                New Password
              </Typography>
              <TextField
                fullWidth
                type={showNew ? "text" : "password"}
                placeholder="Enter a strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 52,
                    borderRadius: "16px",
                    backgroundColor: bgInnerCard,
                    color: textPrimary,
                    "& fieldset": { borderColor: borderCol },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
                    "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: textSecondary, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew(!showNew)} edge="end" sx={{ color: textSecondary }}>
                          {showNew ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* LIVE PASSWORD STRENGTH PROGRESS BAR */}
              {newPassword && (
                <Box sx={{ mt: 1.8 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.8}>
                    <Typography variant="caption" fontWeight="800" sx={{ color: textSecondary }}>
                      Security Strength
                    </Typography>
                    <Typography variant="caption" fontWeight="900" sx={{ color: strength.color }}>
                      {strength.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: bgInnerCard,
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        backgroundColor: strength.color,
                      },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* CONFIRM NEW PASSWORD FIELD */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, color: textPrimary }}>
                Confirm New Password
              </Typography>
              <TextField
                fullWidth
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your new password to verify"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 52,
                    borderRadius: "16px",
                    backgroundColor: bgInnerCard,
                    color: textPrimary,
                    "& fieldset": { borderColor: borderCol },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
                    "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: textSecondary, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={{ color: textSecondary }}>
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* LIVE MATCH FEEDBACK INDICATOR */}
              {confirmPassword && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight="800" sx={{ color: "#10B981" }}>
                        Passwords Match
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ErrorIcon sx={{ color: "#EF4444", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight="800" sx={{ color: "#EF4444" }}>
                        Passwords Do Not Match
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>

            {/* ACTION BUTTONS */}
            <Box sx={{ display: "flex", gap: 2.5, justifyContent: "flex-end", pt: 2.5, borderTop: `1px solid ${borderCol}` }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/profile")}
                sx={{
                  borderRadius: "16px",
                  px: 4,
                  height: 48,
                  borderColor: borderCol,
                  color: textPrimary,
                  fontWeight: 800,
                  textTransform: "none",
                  backgroundColor: bgInnerCard,
                  "&:hover": { borderColor: "#06B6D4", backgroundColor: bgCard },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<CheckCircleIcon />}
                sx={{
                  borderRadius: "16px",
                  px: 5,
                  height: 48,
                  background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "0 8px 24px rgba(6, 182, 212, 0.4)",
                  "&:hover": { background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" },
                }}
              >
                Update Password
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* FOOTER */}
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
            © 2026 Employee Management System • Enterprise Workspace
          </Typography>
        </Box>
      </Box>

      {/* SNACKBAR FEEDBACK */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            borderRadius: "16px",
            fontWeight: 800,
            background: snackbar.severity === "error" ? "#EF4444" : "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(6, 182, 212, 0.4)",
            "& .MuiAlert-icon": { color: "#FFFFFF" },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChangePassword;