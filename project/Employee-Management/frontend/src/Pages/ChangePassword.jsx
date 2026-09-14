import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Material UI Core
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Avatar,
  TextField,
  Divider,
  InputAdornment,
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

import { hasPermission } from "../permissions";

function ChangePassword() {
  const navigate = useNavigate();

  // ============================================================
  // THEME
  // ============================================================

  // THEME STATE - shared with Employee/Profile/Edit Profile
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ems-dark-mode") === "true";
  });

  const toggleTheme = () => {
    setDarkMode((previous) => {
      const next = !previous;
      localStorage.setItem("ems-dark-mode", String(next));
      return next;
    });
  };

  // ============================================================
  // USER
  // ============================================================

  const [user, setUser] = useState(null);

  // ============================================================
  // SEARCH
  // ============================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [, setSearchResults] = useState([]);
  const [, setSearchLoading] = useState(false);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] = useState([]);
const [,setNotificationLoading] = useState(false);


  const unreadCount = notifications.filter(
    (item) => Number(item.is_read) === 0
  ).length;

  // ============================================================
  // NAVIGATION
  // ============================================================

  const [activeTab, setActiveTab] =
    useState("Change Password");

  // ============================================================
  // TOP BAR
  // ============================================================

  const [notifAnchorEl, setNotifAnchorEl] =
    useState(null);

  const [profileAnchorEl, setProfileAnchorEl] =
    useState(null);

  // ============================================================
  // SNACKBAR
  // ============================================================

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ============================================================
  // PASSWORD FORM
  // ============================================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordUpdating, setPasswordUpdating] =
    useState(false);

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);
const [currentTime, setCurrentTime] =
  useState(0);

  // ============================================================
  // CENTRAL PERMISSION CHECK
  // ============================================================

  const can = (permission) =>
    hasPermission(user, permission);

  // ============================================================
  // THEME COLORS
  // ============================================================

  const bgPageGradient = darkMode
    ? "radial-gradient(circle at 12% 0%, rgba(37,99,235,.16), transparent 30%), linear-gradient(135deg, #070B14 0%, #0F172A 52%, #111827 100%)"
    : "radial-gradient(circle at 85% 0%, rgba(96,165,250,.18), transparent 26%), linear-gradient(135deg, #DCEBFA 0%, #EAF2FA 45%, #E4ECF8 100%)";

  const bgSidebarGradient = darkMode
    ? "linear-gradient(180deg, #0B1220 0%, #111C33 55%, #070B14 100%)"
    : "linear-gradient(180deg, #111D3A 0%, #172554 58%, #0F172A 100%)";

  const bgCard = darkMode
    ? "rgba(15, 23, 42, 0.78)"
    : "rgba(255, 255, 255, 0.75)";

  const bgInnerCard = darkMode
    ? "rgba(30, 41, 59, 0.65)"
    : "rgba(224, 242, 254, 0.70)";

  const textPrimary = darkMode ? "#F8FAFC" : "#172033";
  const textSecondary = darkMode ? "#A8B4C7" : "#64748B";
  const borderCol = darkMode
    ? "rgba(148,163,184,0.12)"
    : "rgba(15,23,42,0.08)";
  const lineDivider = darkMode
    ? "rgba(148,163,184,0.12)"
    : "rgba(15,23,42,0.08)";

  // ============================================================
  // SIDEBAR
  // IMPORTANT:
  // Each item has its own permission.
  // ============================================================
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
  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  const calculateStrength = (password) => {
    if (!password) {
      return {
        score: 0,
        label: "Empty",
        color: borderCol,
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score += 30;
    }

    if (/[A-Z]/.test(password)) {
      score += 25;
    }

    if (/[0-9]/.test(password)) {
      score += 25;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20;
    }

    if (score < 40) {
      return {
        score,
        label: "Weak Password",
        color: "#EF4444",
      };
    }

    if (score < 75) {
      return {
        score,
        label: "Medium Strength",
        color: "#F59E0B",
      };
    }

    return {
      score,
      label: "Strong & Secure",
      color: "#10B981",
    };
  };

  const strength =
    calculateStrength(newPassword);

  // ============================================================
  // FETCH USER
  // ============================================================

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "https://website-vltl.onrender.com/auth/me",
        {
          withCredentials: true,
        }
      );

      console.log(
        "AUTH ME RESPONSE:",
        response.data
      );

      const backendUser =
        response.data?.user ||
        response.data?.data ||
        null;

      if (!backendUser) {
        setUser(null);
        return;
      }

      const passwordChangedAt =
        backendUser.password_changed_at ||
        backendUser.passwordChangedAt ||
        backendUser.password_change_date ||
        backendUser.passwordChanged ||
        backendUser.updated_at ||
        backendUser.updatedAt ||
        null;

      const finalUser = {
        ...backendUser,
        password_changed_at:
          passwordChangedAt,
      };

      setUser(finalUser);

      console.log(
        "CURRENT USER:",
        finalUser
      );

      console.log(
        "CURRENT USER PERMISSIONS:",
        finalUser.permissions
      );
    } catch (error) {
      console.error(
        "FETCH USER ERROR:",
        error?.response?.data || error
      );

      setUser(null);
    }
  };

  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response = await axios.get(
        "https://website-vltl.onrender.com/notifications",
        {
          withCredentials: true,
        }
      );

      if (response.data?.status === 1) {
        setNotifications(
          response.data.data || []
        );
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

  // ============================================================
  // INITIAL LOAD
  // ============================================================

useEffect(() => {
  fetchUser();

  setCurrentTime(Date.now());

  const timer = setInterval(() => {
    setCurrentTime(Date.now());
  }, 60000);

  return () => {
    clearInterval(timer);
  };
}, []);

useEffect(() => {
  if (user && can("notifications.view")) {
    fetchNotifications();
  } else {
    setNotifications([]);
  }
}, [user]);

  // ============================================================
  // SEARCH USERS
  // ============================================================

  const searchUsers = async (search) => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);

      const response = await axios.post(
        "https://website-vltl.onrender.com/webservices/users/search-users",
        {
          search: search.trim(),
        },
        {
          withCredentials: true,
        }
      );

      if (response.data?.status === 1) {
        setSearchResults(
          response.data.data || []
        );
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error(
        "SEARCH ERROR:",
        error
      );

      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ============================================================
  // SEARCH HANDLER
  // ============================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchQuery(value);

    if (window.searchTimer) {
      clearTimeout(window.searchTimer);
    }

    window.searchTimer = setTimeout(() => {
      searchUsers(value);
    }, 400);
  };

  // ============================================================
  // MARK NOTIFICATION AS READ
  // ============================================================

  const markNotificationAsRead = async (id) => {
    try {
      await axios.post(
        "https://website-vltl.onrender.com/notifications/read",
        {
          id,
        },
        {
          withCredentials: true,
        }
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                is_read: 1,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );
    }
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Page-level permission
    if (!can("password.view")) {
      setSnackbar({
        open: true,
        message:
          "You do not have permission to access Change Password.",
        severity: "error",
      });

      return;
    }

    // Change permission
    if (!can("password.change")) {
      setSnackbar({
        open: true,
        message:
          "You do not have permission to change your password.",
        severity: "error",
      });

      return;
    }

    if (passwordUpdating) {
      return;
    }

    if (!currentPassword) {
      setSnackbar({
        open: true,
        message:
          "Please enter your current password.",
        severity: "error",
      });

      return;
    }

    if (!newPassword) {
      setSnackbar({
        open: true,
        message:
          "Please enter a new password.",
        severity: "error",
      });

      return;
    }


    if (newPassword.length < 8) {
      setSnackbar({
        open: true,
        message:
          "Password must be at least 8 characters.",
        severity: "error",
      });

      return;
    }

    if (!confirmPassword) {
      setSnackbar({
        open: true,
        message:
          "Please confirm your new password.",
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
        message:
          "User information is not loaded. Please refresh the page.",
        severity: "error",
      });

      return;
    }

    try {
      setPasswordUpdating(true);

      console.log(
        "Changing password for user:",
        user.id
      );

      const response = await axios.post(
        "https://website-vltl.onrender.com/webservices/users/change-password",
        {
          id: user.id,
          password: newPassword,
          currentPassword,
        },
        {
          withCredentials: true,
          timeout: 15000,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      console.log(
        "CHANGE PASSWORD RESPONSE:",
        response.data
      );

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

      const updatedUser =
        response.data?.user ||
        response.data?.data?.user;

      if (updatedUser) {
        setUser((previous) => ({
          ...previous,
          ...updatedUser,
        }));

        if (
          updatedUser.password_changed_at
        ) {
          setCurrentTime(
            new Date(
              updatedUser.password_changed_at
            ).getTime()
          );
        }
      } else {
        // Refresh user from backend
        await fetchUser();
      }

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSnackbar({
        open: true,
        message:
          "Password Updated Successfully",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      console.error(
        "========== CHANGE PASSWORD ERROR =========="
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Backend response:",
        error?.response?.data
      );

      console.error(
        "Error:",
        error?.message
      );

      console.error(
        "=========================================="
      );

      let errorMessage =
        "Something went wrong. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage =
          error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage =
          error.response.data.error;
      } else if (
        error?.response?.status === 400
      ) {
        errorMessage =
          "Invalid password details.";
      } else if (
        error?.response?.status === 401
      ) {
        errorMessage =
          "Current password is incorrect.";
      } else if (
        error?.response?.status === 404
      ) {
        errorMessage =
          "Password update API was not found.";
      } else if (
        error?.response?.status === 500
      ) {
        errorMessage =
          "Server error while updating password.";
      } else if (error?.request) {
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

  // ============================================================
  // PASSWORD LAST CHANGED
  // ============================================================

  const getPasswordChangedText = (
    date
  ) => {
    if (!date) {
      return "Password Last Changed: Unknown";
    }

    const changedDate = new Date(date);

    if (
      Number.isNaN(
        changedDate.getTime()
      )
    ) {
      return "Password Last Changed: Unknown";
    }

    const diffMs = Math.max(
      0,
      currentTime -
        changedDate.getTime()
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
        diffMinutes === 1
          ? "Minute"
          : "Minutes"
      } Ago`;
    }

    if (diffHours < 24) {
      return `Password Last Changed: ${diffHours} ${
        diffHours === 1
          ? "Hour"
          : "Hours"
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
      }
    )}`;
  };

  // ============================================================
  // DIRECT ROUTE PROTECTION
  // ============================================================

  if (
    user &&
    !can("password.view")
  ) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bgPageGradient,
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 520,
            p: 4,
            textAlign: "center",
            borderRadius: "24px",
            backgroundColor: bgCard,
            backdropFilter: "blur(14px)",
            border: `1px solid ${borderCol}`,
            boxShadow:
              "0 12px 40px rgba(0,0,0,.08)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              color: textPrimary,
              mb: 1,
            }}
          >
            Access Denied
          </Typography>

          <Typography
            sx={{
              color: textSecondary,
              mb: 3,
            }}
          >
            Your administrator has not
            granted permission to access
            Change Password.
          </Typography>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/dashboard")
            }
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        background: bgPageGradient,
        backgroundAttachment: "fixed",
        color: textPrimary,
        transition:
          "background 0.4s ease, color 0.4s ease",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* =====================================================
          LEFT SIDEBAR
      ====================================================== */}

      <Box
        sx={{
          width: 250,
          background:
            bgSidebarGradient,
          borderRight:
            `1px solid ${borderCol}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2.5,
          position: "fixed",
          height: "100vh",
          boxSizing: "border-box",
          zIndex: 10,
          boxShadow:
            "10px 0 35px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box>
          {/* BRAND */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 4,
              px: 1,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 800,
                boxShadow:
                  "0 8px 24px rgba(37, 99, 235, 0.45)",
              }}
            >
              E
            </Box>

            <Typography
              variant="h6"
              fontWeight="800"
              letterSpacing={0.5}
              sx={{
                color: "#FFFFFF",
              }}
            >
              EMS Portal
            </Typography>
          </Box>

          {/* SIDEBAR MENU */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {sidebarItems
              .filter((item) =>
                can(item.permission)
              )
              .map((item) => {
                const isActive =
                  activeTab === item.text;

                return (
                  <Button
                    key={item.path}
                    fullWidth
                    startIcon={React.cloneElement(
                      item.icon,
                      {
                        style: {
                          color: isActive
                            ? "#FFFFFF"
                            : "#CBD5E1",
                          fontSize: "20px",
                        },
                      }
                    )}
                    onClick={() => {
                      setActiveTab(item.text);
                      navigate(item.path);
                    }}
                    sx={{
                      justifyContent:
                        "flex-start",
                      height: 48,
                      borderRadius: "16px",
                      px: 2,
                      textTransform: "none",
                      fontWeight:
                        isActive
                          ? 700
                          : 600,
                      fontSize: "14px",
                      color: isActive
                        ? "#FFFFFF"
                        : "#CBD5E1",
                      backgroundColor:
                        isActive
                          ? "#1D4ED8"
                          : "transparent",
                      boxShadow: isActive
                        ? "0 6px 18px rgba(2, 132, 199, 0.45)"
                        : "none",
                      transition:
                        "all 0.25s ease",

                      "&:hover": {
                        backgroundColor:
                          isActive
                            ? "#1E40AF"
                            : "rgba(255, 255, 255, 0.12)",
                        transform:
                          "translateX(4px)",
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

        {/* LOGOUT */}

        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={() =>
            navigate("/")
          }
          sx={{
            borderRadius: "16px",
            height: 48,
            textTransform: "none",
            fontWeight: 700,
            color: "#F87171",
            backgroundColor:
              "rgba(239, 68, 68, 0.18)",
            border:
              "1px solid rgba(239, 68, 68, 0.35)",

            "&:hover": {
              backgroundColor:
                "rgba(239, 68, 68, 0.3)",
              transform:
                "translateY(-2px)",
            },
          }}
        >
          Logout Session
        </Button>
      </Box>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

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
        {/* TOP BAR */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            width: "100%",
            mb: 3.5,
          }}
        >
          {/* SEARCH */}

          <TextField
            placeholder="Search security settings, passwords, 2FA..."
            size="small"
            value={searchQuery}
            onChange={
              handleSearchChange
            }
            sx={{
              width: {
              
                xs: 240,
                sm: 360,
                md: 420,
              },

              "& .MuiOutlinedInput-root":
                {
                  height: 48,
                  borderRadius: "24px",
                  backgroundColor:
                    darkMode
                      ? "rgba(15,23,42,.72)"
                      : "rgba(255,255,255,.82)",
                  backdropFilter:
                    "blur(12px)",
                  color: textPrimary,

                  "& fieldset": {
                    borderColor:
                      borderCol,
                  },

                  "&:hover fieldset": {
                    borderColor:
                      "#2563EB",
                  },

                  "&.Mui-focused fieldset":
                    {
                      borderColor:
                        "#2563EB",
                      boxShadow:
                        "0 0 16px rgba(37, 99, 235, 0.35)",
                    },
                },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color:
                          textSecondary,
                        fontSize: 20,
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

         
             

             {/* TOP BAR */}
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    mb: 5,
    minHeight: 55,
  }}
>
  {/* RIGHT ACTIONS */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
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
            <NotificationsNoneIcon sx={{ color: textPrimary }} />
          </Badge>
        </IconButton>
      </Tooltip>
    )}

    {/* PROFILE */}
    <Box
      onClick={(event) =>
        setProfileAnchorEl(event.currentTarget)
      }
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.3,
        cursor: "pointer",
        ml: 0.5,
        px: 0.5,
        py: 0.3,
        borderRadius: "14px",
        "&:hover": {
          backgroundColor: darkMode
            ? "rgba(255,255,255,0.06)"
            : "rgba(37,99,235,0.06)",
        },
      }}
    >
      <Avatar
        src={user?.profile_pic || ""}
        alt={user?.name}
        sx={{
          width: 42,
          height: 42,
          border: "2px solid #2563EB",
          boxShadow: "0 0 12px rgba(37,99,235,0.4)",
          backgroundColor: darkMode ? "#475569" : "#BDBDBD",
          color: "#FFFFFF",
          fontWeight: 700,
        }}
      >
        {!user?.profile_pic &&
          (user?.name || "A").substring(0, 1).toUpperCase()}
      </Avatar>

      <Box
        sx={{
          minWidth: 105,
          display: { xs: "none", sm: "block" },
        }}
      >
        <Typography
          sx={{
            color: textPrimary,
            fontSize: "14px",
            lineHeight: 1.3,
          }}
        >
          {user?.name || "Anju Rajan"}
        </Typography>

        <Typography
          sx={{
            color: textSecondary,
            fontSize: "12px",
            lineHeight: 1.4,
            textTransform: "lowercase",
          }}
        >
          {user?.role || "admin"}
        </Typography>
      </Box>
    </Box>

    {/* PROFILE MENU */}
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
          backgroundColor: darkMode
            ? "#0B1220 !important"
            : "#FFFFFF !important",
          color: textPrimary,
          border: `1px solid ${borderCol}`,
          boxShadow:
            "0 12px 35px rgba(0,0,0,0.15)",
        },
      }}
    >
      {can("profile.view") && (
        <MenuItem
          onClick={() => {
            setProfileAnchorEl(null);
            navigate("/profile");
          }}
          sx={{
            borderRadius: "12px",
            fontWeight: 700,
          }}
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
          sx={{
            borderRadius: "12px",
            fontWeight: 700,
          }}
        >
          Edit Profile
        </MenuItem>
      )}

      {can("password.view") && (
        <MenuItem
          onClick={() => {
            setProfileAnchorEl(null);
            navigate("/change-password");
          }}
          sx={{
            borderRadius: "12px",
            fontWeight: 700,
          }}
        >
          Change Password
        </MenuItem>
      )}

      <Divider
        sx={{
          my: 1,
          borderColor: borderCol,
        }}
      />

      <MenuItem
        onClick={() => navigate("/")}
        sx={{
          borderRadius: "12px",
          color: "#FF4D4D !important",
          fontWeight: 800,
        }}
      >
        Logout
      </MenuItem>
    </Menu>

    {/* NOTIFICATION MENU */}
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
            color: textPrimary,
            border: `1px solid ${borderCol}`,
            boxShadow:
              "0 12px 35px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight="800"
          sx={{
            p: 1,
            fontSize: 16,
          }}
        >
          Notifications & Alerts
        </Typography>

        <Divider
          sx={{
            my: 1.5,
            borderColor: lineDivider,
          }}
        />

        {notifications.length === 0 ? (
          <Typography
            sx={{
              p: 2,
              color: textSecondary,
            }}
          >
            No notifications
          </Typography>
        ) : (
          notifications.map((item) => (
            <Box
              key={item.id}
              onClick={() =>
                markNotificationAsRead(item.id)
              }
              sx={{
                cursor: "pointer",
                p: 2,
                borderBottom:
                  `1px solid ${lineDivider}`,
                backgroundColor:
                  Number(item.is_read) === 0
                    ? "rgba(37, 99, 235, 0.08)"
                    : "transparent",
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: textPrimary,
                  mb: 0.4,
                }}
              >
                {item.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11.5,
                  color: textSecondary,
                  fontWeight: 600,
                }}
              >
                {item.subtitle}
              </Typography>
            </Box>
          ))
        )}
      </Menu>
    )}

    </Box>
  </Box>
</Box>
        {/* =====================================================
            SECURITY HEADER
        ====================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 5,
            backgroundColor:
              bgCard,
            backdropFilter:
              "blur(12px)",
            border:
              `1px solid ${borderCol}`,
            borderRadius: "28px",
            boxShadow:
              "0 10px 30px rgba(0, 0, 0, 0.06)",
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                color: "#FFFFFF",
                boxShadow:
                  "0 8px 24px rgba(37, 99, 235, 0.45)",
              }}
            >
              <ShieldIcon
                sx={{
                  fontSize: 32,
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight="900"
                sx={{
                  color:
                    textPrimary,
                }}
              >
                Account Security &
                Password Settings
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    textSecondary,
                  fontWeight: 600,
                }}
              >
                Manage your credentials,
                password security and
                authentication settings
              </Typography>
            </Box>
          </Box>

          {can("password.view")  && (
            <Chip
              label={getPasswordChangedText(
                user?.password_changed_at
              )}
              sx={{
                background:
                  "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#FFFFFF",
                fontWeight: 800,
                px: 2,
                py: 2.3,
                borderRadius: "14px",
                boxShadow:
                  "0 6px 18px rgba(37, 99, 235, 0.35)",
              }}
            />
          )}
        </Paper>

        {/* =====================================================
            FORM
        ====================================================== */}

        <Box
          sx={{
            maxWidth: 780,
            mx: "auto",
          }}
        >
          {/* SECURITY INFORMATION */}

          <Alert
            severity="info"
            icon={
              <SecurityIcon
                sx={{
                  color:
                    "#2563EB !important",
                  fontSize: 24,
                }}
              />
            }
            sx={{
              borderRadius: "20px",
              mb: 4,
              backgroundColor:
                bgInnerCard,
              color: textPrimary,
              border:
                `1px solid ${borderCol}`,
              p: 2.5,
              fontWeight: 600,

              "& .MuiAlert-icon": {
                alignItems:
                  "center",
              },
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="900"
              sx={{
                color:
                  textPrimary,
                mb: 0.5,
              }}
            >
              Enterprise Security
              Requirement
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color:
                  textSecondary,
                fontWeight: 600,
              }}
            >
              Passwords must be at
              least 8 characters long
              and should contain a
              mixture of uppercase
              letters, numbers and
              special symbols.
            </Typography>
          </Alert>

          {/* FORM CARD */}

          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: {
                xs: 3.5,
                md: 4.5,
              },
              borderRadius: "28px",
              backgroundColor:
                bgCard,
              backdropFilter:
                "blur(12px)",
              border:
                `1px solid ${borderCol}`,
              boxShadow:
                "0 10px 30px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* FORM HEADER */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 4,
                pb: 2.5,
                borderBottom:
                  `1px solid ${borderCol}`,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "16px",
                  backgroundColor:
                    bgInnerCard,
                  color: "#2563EB",
                  display: "flex",
                  border:
                    `1px solid ${borderCol}`,
                }}
              >
                <KeyIcon
                  sx={{
                    fontSize: 26,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  fontWeight="900"
                  sx={{
                    color:
                      textPrimary,
                  }}
                >
                  Update Password
                  Credentials
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color:
                      textSecondary,
                    fontWeight: 600,
                  }}
                >
                  Verify your current
                  password before
                  saving a new password
                </Typography>
              </Box>
            </Box>

            {/* CURRENT PASSWORD */}

            <Box sx={{ mb: 3.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight="800"
                sx={{
                  mb: 1,
                  color:
                    textPrimary,
                }}
              >
                Current Password
              </Typography>

              <TextField
                fullWidth
                type={
                  showCurrent
                    ? "text"
                    : "password"
                }
                placeholder="Enter your current account password"
                value={currentPassword}
                disabled={
                  !can(
                    "password.change"
                  )
                }
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root":
                    {
                      height: 52,
                      borderRadius:
                        "16px",
                      backgroundColor:
                        bgInnerCard,
                      color:
                        textPrimary,

                      "& fieldset": {
                        borderColor:
                          borderCol,
                      },

                      "&:hover fieldset":
                        {
                          borderColor:
                            "#2563EB",
                        },

                      "&.Mui-focused fieldset":
                        {
                          borderColor:
                            "#2563EB",
                        },
                    },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon
                          sx={{
                            color:
                              textSecondary,
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          disabled={
                            !can(
                              "password.change"
                            )
                          }
                          onClick={() =>
                            setShowCurrent(
                              (previous) =>
                                !previous
                            )
                          }
                          edge="end"
                          sx={{
                            color:
                              textSecondary,
                          }}
                        >
                          {showCurrent ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* NEW PASSWORD */}

            <Box sx={{ mb: 3.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight="800"
                sx={{
                  mb: 1,
                  color:
                    textPrimary,
                }}
              >
                New Password
              </Typography>

              <TextField
                fullWidth
                type={
                  showNew
                    ? "text"
                    : "password"
                }
                placeholder="Enter a strong new password"
                value={newPassword}
                disabled={
                  !can(
                    "password.change"
                  )
                }
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root":
                    {
                      height: 52,
                      borderRadius:
                        "16px",
                      backgroundColor:
                        bgInnerCard,
                      color:
                        textPrimary,

                      "& fieldset": {
                        borderColor:
                          borderCol,
                      },

                      "&:hover fieldset":
                        {
                          borderColor:
                            "#2563EB",
                        },

                      "&.Mui-focused fieldset":
                        {
                          borderColor:
                            "#2563EB",
                        },
                    },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon
                          sx={{
                            color:
                              textSecondary,
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          disabled={
                            !can(
                              "password.change"
                            )
                          }
                          onClick={() =>
                            setShowNew(
                              (previous) =>
                                !previous
                            )
                          }
                          edge="end"
                          sx={{
                            color:
                              textSecondary,
                          }}
                        >
                          {showNew ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* LENGTH VALIDATION */}

              {newPassword && (
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    display: "block",
                    mt: 1.2,
                    color:
                      newPassword.length >=
                      8
                        ? "#10B981"
                        : "#EF4444",
                  }}
                >
                  {newPassword.length >=
                  8
                    ? "✓ Minimum 8 characters met"
                    : `Use at least 8 characters (${newPassword.length}/8)`}
                </Typography>
              )}

              {/* STRENGTH */}

              {newPassword && (
                <Box sx={{ mt: 1.8 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    mb={0.8}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="800"
                      sx={{
                        color:
                          textSecondary,
                      }}
                    >
                      Security Strength
                    </Typography>

                    <Typography
                      variant="caption"
                      fontWeight="900"
                      sx={{
                        color:
                          strength.color,
                      }}
                    >
                      {strength.label}
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={
                      strength.score
                    }
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        bgInnerCard,

                      "& .MuiLinearProgress-bar":
                        {
                          borderRadius: 4,
                          backgroundColor:
                            strength.color,
                        },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* CONFIRM PASSWORD */}

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle2"
                fontWeight="800"
                sx={{
                  mb: 1,
                  color:
                    textPrimary,
                }}
              >
                Confirm New Password
              </Typography>

              <TextField
                fullWidth
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                placeholder="Re-enter your new password to verify"
                value={confirmPassword}
                disabled={
                  !can(
                    "password.change"
                  )
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root":
                    {
                      height: 52,
                      borderRadius:
                        "16px",
                      backgroundColor:
                        bgInnerCard,
                      color:
                        textPrimary,

                      "& fieldset": {
                        borderColor:
                          borderCol,
                      },

                      "&:hover fieldset":
                        {
                          borderColor:
                            "#2563EB",
                        },

                      "&.Mui-focused fieldset":
                        {
                          borderColor:
                            "#2563EB",
                        },
                    },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon
                          sx={{
                            color:
                              textSecondary,
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          disabled={
                            !can(
                              "password.change"
                            )
                          }
                          onClick={() =>
                            setShowConfirm(
                              (previous) =>
                                !previous
                            )
                          }
                          edge="end"
                          sx={{
                            color:
                              textSecondary,
                          }}
                        >
                          {showConfirm ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* MATCH */}

              {confirmPassword &&
                  (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 1,
                      mt: 1.5,
                    }}
                  >
                    {newPassword ===
                    confirmPassword ? (
                      <>
                        <CheckCircleIcon
                          sx={{
                            color:
                              "#10B981",
                            fontSize: 18,
                          }}
                        />

                        <Typography
                          variant="caption"
                          fontWeight="800"
                          sx={{
                            color:
                              "#10B981",
                          }}
                        >
                          Passwords Match
                        </Typography>
                      </>
                    ) : (
                      <>
                        <ErrorIcon
                          sx={{
                            color:
                              "#EF4444",
                            fontSize: 18,
                          }}
                        />

                        <Typography
                          variant="caption"
                          fontWeight="800"
                          sx={{
                            color:
                              "#EF4444",
                          }}
                        >
                          Passwords Do Not
                          Match
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
            </Box>

            {/* ACTIONS */}

            <Box
              sx={{
                display: "flex",
                gap: 2.5,
                justifyContent:
                  "flex-end",
                pt: 2.5,
                borderTop:
                  `1px solid ${borderCol}`,
              }}
            >
              <Button
                variant="outlined"
                onClick={() =>
                  navigate("/profile")
                }
                sx={{
                  borderRadius: "16px",
                  px: 4,
                  height: 48,
                  borderColor:
                    borderCol,
                  color:
                    textPrimary,
                  fontWeight: 800,
                  textTransform:
                    "none",
                  backgroundColor:
                    bgInnerCard,

                  "&:hover": {
                    borderColor:
                      "#2563EB",
                    backgroundColor:
                      bgCard,
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={
                  <CheckCircleIcon />
                }
                disabled={
  !can("password.change") ||
  passwordUpdating
}
                sx={{
                  borderRadius: "16px",
                  px: 5,
                  height: 48,
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  textTransform:
                    "none",
                  boxShadow:
                    "0 8px 24px rgba(6, 182, 212, 0.4)",

                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
                  },
                }}
              >
                {passwordUpdating
                  ? "Updating..."
                  : "Update Password"}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* FOOTER */}

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            my: 4,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color:
                textSecondary,
              fontWeight: 600,
            }}
          >
            © 2026 Employee Management
            System • Enterprise Workspace
          </Typography>
        </Box>
      </Box>

      {/* =====================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={
            snackbar.severity
          }
          sx={{
            borderRadius: "16px",
            fontWeight: 800,
            background:
              snackbar.severity ===
              "error"
                ? "#EF4444"
                : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#FFFFFF",

            "& .MuiAlert-icon": {
              color: "#FFFFFF",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChangePassword;
