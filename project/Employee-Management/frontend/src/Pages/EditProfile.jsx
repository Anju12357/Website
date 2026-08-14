import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Material UI Core Imports
import {
  Box,
  Typography,
  Button,
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
  Snackbar,
  Alert,
  Badge,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
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
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";

import ShieldIcon from "@mui/icons-material/Shield";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarIcon from "@mui/icons-material/Star";

function EditProfile() {
  const navigate = useNavigate();
const profileFileInputRef = useRef(null);
  // THEME STATE (DARK & LIGHT MODE) MATCHING DASHBOARD
  // ======================================================
// DARK MODE
// ======================================================

const [darkMode, setDarkMode] = useState(() => {
  const savedTheme =
    localStorage.getItem("darkMode");

  return savedTheme === "true";
});

const toggleTheme = () => {
  setDarkMode((prev) => {
    const newValue = !prev;

    localStorage.setItem(
      "darkMode",
      String(newValue)
    );

    return newValue;
  });
};
  // SEARCH & NAV STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Edit Profile");
  const [currentTabValue, setCurrentTabValue] = useState(0);

  // MENUS & TOAST STATE
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
// NOTIFICATION STATE
const [notifications, setNotifications] = useState([]);
const [, setNotificationLoading] = useState(false);

const [searchResults, setSearchResults] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);
  // EDITABLE FORM DATA
 const [formData, setFormData] = useState({
  id: "",
  name: "",
  email: "",
  role: "",
  designation: "",
  user_type: "",
  profile_pic: "",
  cover_pic: "",
  status: 1,
  added_by: 1,

  // UI-only fields
  phone: "",
  department: "",
  address: "",
  joiningDate: "",
  bio: "",
});



  // SKILLS TAG SYSTEM
const [skillsList, setSkillsList] = useState([]);


  const [newSkillInput, setNewSkillInput] = useState("");

  // PREFERENCES TOGGLES
  const [preferences, setPreferences] = useState({
    emailNotifs: true,
    desktopNotifs: true,
    twoFactorAuth: true,
    publicProfile: true,
  });


  const fetchUser = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/auth/me",
      {
        withCredentials: true,
      }
    );

    const user = response.data.user;

   setFormData((prev) => ({
  ...prev,

  id: user.id,
  name: user.name || "",
  email: user.email || "",
  role: user.role || "",
  user_type: user.user_type || "",

  designation: user.designation || "",
  department: user.department || "",

  // ⭐ NEW FIELDS
  phone: user.phone || "",
  joiningDate: user.joining_date || "",
  address: user.address || "",
  bio: user.bio || "",

  profile_pic: user.profile_pic || "",
  cover_pic: user.cover_pic || "",

  status: user.status ?? 1,
  added_by: user.added_by ?? 1,
}));


  } catch (error) {
    console.log(error);
  }
};

// ======================================================
// UPLOAD PROFILE AVATAR
// ======================================================

const handleProfilePhotoUpload = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setSnackbar({
      open: true,
      message: "Only JPG, PNG and WEBP images are allowed",
      severity: "error",
    });

    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setSnackbar({
      open: true,
      message: "Image must be smaller than 5 MB",
      severity: "error",
    });

    event.target.value = "";
    return;
  }

  try {
    const uploadData = new FormData();

    uploadData.append("user_id", formData.id);
    uploadData.append("type", "profile");
    uploadData.append("file", file);

    const response = await axios.post(
      "http://localhost:4000/webservices/users/upload-image",
      uploadData,
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setFormData((prev) => ({
        ...prev,
        profile_pic: response.data.image_path,
      }));

      setSnackbar({
        open: true,
        message: "Profile photo updated successfully",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message:
          response.data?.message ||
          "Profile photo upload failed",
        severity: "error",
      });
    }
  } catch (error) {
    console.error(
      "PROFILE PHOTO UPLOAD ERROR:",
      error
    );

    setSnackbar({
      open: true,
      message: "Failed to upload profile photo",
      severity: "error",
    });
  } finally {
    event.target.value = "";
  }
};


const handleUserSearch = async (value) => {
  setSearchQuery(value);

  if (!value.trim()) {
    setSearchResults([]);
    setSearchOpen(false);
    return;
  }

  if (value.trim().length < 2) {
    return;
  }

  try {
    setSearchLoading(true);

    const response = await axios.post(
      "http://localhost:4000/webservices/users/search-users",
      {
        search: value.trim(),
      },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setSearchResults(response.data.data || []);
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(true);
    }
  } catch (error) {
    console.error(
      "SEARCH USERS ERROR:",
      error
    );

    setSearchResults([]);
  } finally {
    setSearchLoading(false);
  }
};


const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  return `http://localhost:4000${
    imagePath.startsWith("/") ? "" : "/"
  }${imagePath}`;
};

// ======================================================
// FETCH NOTIFICATIONS
// ======================================================

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
      "Error fetching notifications:",
      error
    );

    setNotifications([]);
  } finally {
    setNotificationLoading(false);
  }
};

const fetchSkills = async (userId) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/webservices/users/get-skills",
      {
        user_id: userId,
      },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setSkillsList(response.data.data || []);
    } else {
      setSkillsList([]);
    }
  } catch (error) {
    console.error("FETCH SKILLS ERROR:", error);
    setSkillsList([]);
  }
};


useEffect(() => {
  fetchUser();
  fetchNotifications();
}, []);

useEffect(() => {
  if (formData.id) {
    fetchSkills(formData.id);
  }
}, [formData.id]);

const unreadNotificationCount =
  notifications.filter(
    (notification) =>
      Number(notification.is_read) === 0
  ).length;

 
 
// ======================================================
// MARK NOTIFICATION AS READ
// ======================================================
const handleNotificationClick = async (notification) => {
  try {
    if (Number(notification.is_read) === 1) {
      setNotifAnchorEl(null);
      return;
    }

    const response = await axios.post(
      "http://localhost:4000/notifications/read",
      {
        id: notification.id,
      },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: 1 }
            : item
        )
      );
    }

    setNotifAnchorEl(null);
  } catch (error) {
    console.error(
      "Error marking notification as read:",
      error
    );
  }
};




const handleAddSkill = async () => {
  const skill = newSkillInput.trim();

  if (!skill) return;

  // Prevent duplicate skill in UI
  const alreadyExists = skillsList.some(
    (item) => item.skill?.toLowerCase() === skill.toLowerCase()
  );

  if (alreadyExists) {
    setSnackbar({
      open: true,
      message: "Skill already exists",
      severity: "warning",
    });
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:4000/webservices/users/add-skill",
      {
        user_id: formData.id,
        skill,
      },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setSkillsList((prev) => [
        ...prev,
        response.data.data,
      ]);

      setNewSkillInput("");

      setSnackbar({
        open: true,
        message: "Skill added successfully",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message:
          response.data?.message || "Failed to add skill",
        severity: "error",
      });
    }
  } catch (error) {
    console.error("ADD SKILL ERROR:", error);

    setSnackbar({
      open: true,
      message: "Failed to add skill",
      severity: "error",
    });
  }
};

 

const handleDeleteSkill = async (skillToDelete) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/webservices/users/delete-skill",
      {
        id: skillToDelete.id,
        user_id: formData.id,
      },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setSkillsList((prev) =>
        prev.filter(
          (skill) => skill.id !== skillToDelete.id
        )
      );

      setSnackbar({
        open: true,
        message: "Skill deleted successfully",
        severity: "success",
      });
    }
  } catch (error) {
    console.error("DELETE SKILL ERROR:", error);
  }
};






const handleSave = async () => {
  try {
    const response = await axios.post(
  "http://localhost:4000/webservices/users/update-user",
  {
    id: formData.id,

    // Basic information
    name: formData.name,
    email: formData.email,

    // Role information
    role: formData.role,
    user_type: formData.user_type,
    designation: formData.designation,
    department: formData.department,

    // ⭐ NEW FIELDS
    phone: formData.phone || null,
    joining_date: formData.joiningDate || null,
    address: formData.address || null,
    bio: formData.bio || null,

    // Images
    profile_pic: formData.profile_pic || null,
    cover_pic: formData.cover_pic || null,

    // Other fields
    status: formData.status,
    added_by: formData.added_by,
  },
  {
    withCredentials: true,
  }
);
      
    console.log("UPDATE USER RESPONSE:", response.data);

    if (response.data?.status === 1) {
      setSnackbar({
        open: true,
        message: "Profile Updated Successfully",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } else {
      setSnackbar({
        open: true,
        message:
          response.data?.message || "Update Failed",
        severity: "error",
      });
    }

  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error.response?.data || error
    );

    setSnackbar({
      open: true,
      message:
        error.response?.data?.message ||
        "Update Failed",
      severity: "error",
    });
  }
};
     
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

  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, path: "/employees" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    { text: "Edit Profile", icon: <EditIcon />, path: "/edit-profile" },
    { text: "Change Password", icon: <LockIcon />, path: "/change-password" },
  ];

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
      {/* SIDEBAR */}
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
                    if (item.path !== "/edit-profile") navigate(item.path);
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
        {/* TOP BAR */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            mb: 5,
          }}
        >
          <TextField
            placeholder="Search settings, preferences, skills..."
            size="small"
            value={searchQuery}
            onChange={(e) =>
  handleUserSearch(e.target.value)
}
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

            {/* NOTIFICATION BELL */}
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
  badgeContent={unreadNotificationCount}
  color="error"
  invisible={unreadNotificationCount === 0}
>
              
                <NotificationsNoneIcon sx={{ color: textPrimary, fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* NOTIFICATIONS DROPDOWN MENU */}
        
{/* NOTIFICATION PANEL */}
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

      width: 290,
      maxWidth: 290,

      maxHeight: 520,
      overflowY: "auto",

      borderRadius: "3px",

      backgroundColor: darkMode
        ? "#0F172A"
        : "#FFFFFF",

      color: textPrimary,

      border: darkMode
        ? "1px solid rgba(255,255,255,0.10)"
        : "1px solid #E2E8F0",

      boxShadow: "0 5px 16px rgba(0,0,0,0.20)",

      "& .MuiList-root": {
        padding: 0,
      },
    },
  }}
>
  {/* HEADER */}
  <Box
    sx={{
      px: 1.5,
      py: 1.5,

      backgroundColor: darkMode
        ? "#0F172A"
        : "#FFFFFF",

      borderBottom: darkMode
        ? "1px solid rgba(255,255,255,0.10)"
        : "1px solid #DCEAF3",
    }}
  >
    <Typography
      sx={{
        fontSize: "15px",
        fontWeight: 500,
        color: darkMode
          ? "#F8FAFC"
          : "#172033",
      }}
    >
      Notifications & Alerts
    </Typography>
  </Box>

  {/* NOTIFICATIONS */}
  {notifications.length === 0 ? (
    <Box
      sx={{
        px: 2,
        py: 4,
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: "13px",
          color: textSecondary,
        }}
      >
        No notifications
      </Typography>
    </Box>
  ) : (
    notifications.map((notification, index) => {
      const unread =
        Number(notification?.is_read) === 0;

      const title =
        notification?.title ||
        notification?.message ||
        "Notification";

      const subtitle =
        notification?.subtitle ||
        notification?.description ||
        notification?.department ||
        "";

      /*
       * IMPORTANT:
       * Don't display created_at.
       *
       * Backend returns:
       * created_at: 2026-08-10T16:03:13.000Z
       *
       * We don't want that in the UI.
       */

      return (
        <Box
          key={notification?.id || index}
          onClick={() =>
            handleNotificationClick(notification)
          }
          sx={{
            width: "100%",
            boxSizing: "border-box",

            px: 1.5,
            py: 1.15,

            minHeight: 66,

            cursor: "pointer",

            borderBottom:
              index === notifications.length - 1
                ? "none"
                : darkMode
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid #DCEAF3",

            /*
             * Unread notification background
             */
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
              fontSize: "14px",

              lineHeight: 1.35,

              /*
               * THIS MAKES THE TITLE BOLD
               */
              fontWeight: 800,

              color: darkMode
                ? "#F8FAFC"
                : "#172033",

              mb: 0.25,
            }}
          >
            {title}
          </Typography>

          {/* SUBTITLE */}
          <Typography
            sx={{
              fontSize: "11px",

              lineHeight: 1.35,

              color: darkMode
                ? "#38BDF8"
                : "#0284C7",

              fontWeight: 600,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      );
    })
  )}
</Menu>         


            <Divider orientation="vertical" flexItem sx={{ height: 28, borderColor: borderCol }} />

            {/* USER PROFILE BUTTON */}
            <Box
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              sx={{
                mt:-9.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
              }}
            >
             <Avatar
  src={getImageUrl(formData.profile_pic)}
                sx={{ width: 42, height: 42, border: "2px solid #06B6D4", boxShadow: "0 0 12px rgba(6,182,212,0.4)" }}
              />
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ lineHeight: 1.2, color: textPrimary }}>
                  {formData.name}
                </Typography>
                <Typography
  variant="caption"
  sx={{ color: textSecondary, fontWeight: 700 }}
>
  {formData.role}
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

        {/* HERO COVER BANNER & AVATAR CARD */}
        <Paper
          elevation={0}
          sx={{
            mb: 5,
            borderRadius: "28px",
            backgroundColor: bgCard,
            backdropFilter: "blur(12px)",
            border: `1px solid ${borderCol}`,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* VIBRANT GRADIENT COVER PHOTO */}
          <Box
            sx={{
              height: 140,
              background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 50%, #0369A1 100%)",
              position: "relative",
              px: 4,
              pt: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Chip
              label="Enterprise Profile Editor"
              icon={<AutoAwesomeIcon sx={{ color: "#FFFFFF !important", fontSize: "16px !important" }} />}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                backdropFilter: "blur(10px)",
                fontWeight: 800,
                fontSize: "12px",
              }}
            />
          </Box>

          {/* AVATAR OVERLAY & USER TITLE BAR */}
          <Box sx={{ px: 4, pb: 3.5, pt: 0, position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-end" },
                justifyContent: "space-between",
                gap: 2,
                mt: "-50px",
                mb: 2,
              }}
            >
              {/* INTERACTIVE AVATAR WITH CAMERA OVERLAY */}
              <Box sx={{ position: "relative" }}>
                <Avatar

                   src={getImageUrl(formData.profile_pic)}
                   sx={{
                    width: 110,
                    height: 110,
                    border: `4px solid ${darkMode ? "#0F172A" : "#FFFFFF"}`,
                    boxShadow: "0 8px 24px rgba(6, 182, 212, 0.4)",
                  }}
                />
                
                  <>
  <input
    ref={profileFileInputRef}
    type="file"
    accept="image/jpeg,image/jpg,image/png,image/webp"
    hidden
    onChange={handleProfilePhotoUpload}
  />

  <Tooltip title="Upload New Profile Photo">
    <IconButton
      onClick={() =>
        profileFileInputRef.current?.click()
      }
      sx={{
        position: "absolute",
        bottom: 4,
        right: 4,
        backgroundColor: "#06B6D4",
        color: "#FFFFFF",
        boxShadow:
          "0 4px 12px rgba(6, 182, 212, 0.5)",
        "&:hover": {
          backgroundColor: "#0284C7",
          transform: "scale(1.1)",
        },
      }}
    >
      <CameraAltIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Tooltip>
</>
              </Box>

              {/* ACTION BUTTONS */}
              <Box sx={{ display: "flex", gap: 1.5, pb: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/profile")}
                  sx={{
                    borderRadius: "16px",
                    px: 3,
                    height: 46,
                    borderColor: borderCol,
                    color: textPrimary,
                    fontWeight: 800,
                    textTransform: "none",
                    backgroundColor: bgInnerCard,
                    "&:hover": { borderColor: "#06B6D4", backgroundColor: bgCard },
                  }}
                >
                  Cancel Edit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    borderRadius: "16px",
                    px: 4,
                    height: 46,
                    background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(6, 182, 212, 0.4)",
                    "&:hover": { background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" },
                  }}
                >
                  Save All Changes
                </Button>
              </Box>
            </Box>

            <Typography variant="h5" fontWeight="900" sx={{ color: textPrimary, mb: 0.5 }}>
              {formData.name}
            </Typography>
            <Typography variant="subtitle2" fontWeight="700" sx={{ color: textSecondary }}>
              {formData.role} • {formData.department}
            </Typography>
          </Box>
        </Paper>

        {/* NAVIGATION TABS BAR */}
        <Paper
          elevation={0}
          sx={{
            mb: 5,
            borderRadius: "22px",
            backgroundColor: bgCard,
            backdropFilter: "blur(12px)",
            border: `1px solid ${borderCol}`,
            px: 2,
          }}
        >
          <Tabs
            value={currentTabValue}
            onChange={(e, newVal) => setCurrentTabValue(newVal)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#06B6D4",
                height: 3.5,
                borderRadius: "3px",
              },
            }}
          >
            <Tab
              icon={<PersonIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Personal & Role Info"
              sx={{ fontWeight: 800, textTransform: "none", color: textPrimary, fontSize: "14px", py: 2 }}
            />
            <Tab
              icon={<StarIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Skills & Tech Stack"
              sx={{ fontWeight: 800, textTransform: "none", color: textPrimary, fontSize: "14px", py: 2 }}
            />
            <Tab
              icon={<SecurityIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Security & Preferences"
              sx={{ fontWeight: 800, textTransform: "none", color: textPrimary, fontSize: "14px", py: 2 }}
            />
          </Tabs>
        </Paper>

        {/* TAB 0: PERSONAL & ROLE INFO */}
        {currentTabValue === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, md: 4.5 },
              borderRadius: "28px",
              backgroundColor: bgCard,
              backdropFilter: "blur(12px)",
              border: `1px solid ${borderCol}`,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
              mb: 5,
            }}
          >
            <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, mb: 3, fontSize: "20px" }}>
              Personal Identity & Corporate Information
            </Typography>

            <Grid container spacing={3.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#06B6D4", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Work Email Address"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#10B981", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Direct Phone Number"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Designation / Role Title"
                  fullWidth
                  value={formData.designation}
onChange={(e) =>
  setFormData({ ...formData, designation: e.target.value })
}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkspacePremiumIcon sx={{ color: "#0284C7", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Department"
                  fullWidth
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon sx={{ color: "#06B6D4", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  {["Engineering (IT)", "Human Resources", "Finance", "Product Design", "Sales & Ops"].map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Joining Date"
                  type="date"
                  fullWidth
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthIcon sx={{ color: "#10B981", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Office Location / Address"
                  fullWidth
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {searchOpen && (
  <Paper
    elevation={8}
    sx={{
      position: "absolute",
      top: 58,
      left: 0,
      width: {
        xs: 240,
        sm: 380,
        md: 480,
      },
      maxHeight: 360,
      overflowY: "auto",
      zIndex: 1000,
      borderRadius: "18px",
      p: 1,
      backgroundColor: darkMode
        ? "#0F172A"
        : "#FFFFFF",
      border: `1px solid ${borderCol}`,
    }}
  >
    {searchLoading ? (
      <Typography
        sx={{
          p: 2,
          color: textSecondary,
          fontWeight: 600,
        }}
      >
        Searching...
      </Typography>
    ) : searchResults.length === 0 ? (
      <Typography
        sx={{
          p: 2,
          color: textSecondary,
          fontWeight: 600,
        }}
      >
        No employees found
      </Typography>
    ) : (
      searchResults.map((user) => (
        <Box
          key={user.id}
          onClick={() => {
            setSearchQuery(user.name);
            setSearchOpen(false);
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: "12px",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: darkMode
                ? "#1E293B"
                : "#F0F9FF",
            },
          }}
        >
          <Avatar
            src={getImageUrl(user.profile_pic)}
            sx={{
              width: 38,
              height: 38,
            }}
          >
            {user.name?.charAt(0)}
          </Avatar>

          <Box>
            <Typography
              sx={{
                color: textPrimary,
                fontWeight: 800,
              }}
            >
              {user.name}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: textSecondary,
                fontWeight: 600,
              }}
            >
              {user.designation || user.role}
              {user.department
                ? ` • ${user.department}`
                : ""}
            </Typography>
          </Box>
        </Box>
      ))
    )}
  </Paper>
)}

              <Grid item xs={12}>
                <TextField
                  label="Executive Summary / Bio"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: bgInnerCard,
                      color: textPrimary,
                      "& fieldset": { borderColor: borderCol },
                      "&:hover fieldset": { borderColor: "#06B6D4" },
                      "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                    },
                    "& .MuiInputLabel-root": { color: textSecondary, fontWeight: 700 },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* TAB 1: SKILLS & TECH STACK */}
        {currentTabValue === 1 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, md: 4.5 },
              borderRadius: "28px",
              backgroundColor: bgCard,
              backdropFilter: "blur(12px)",
              border: `1px solid ${borderCol}`,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
              mb: 5,
            }}
          >
            <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, mb: 1, fontSize: "20px" }}>
              Manage Skills & Technical Stack
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 3.5, fontWeight: 600 }}>
              Add, remove, or update your technical competencies visible across the enterprise.
            </Typography>

            {/* ADD SKILL INPUT */}
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <TextField
                placeholder="Enter new skill (e.g. Next.js, GraphQL, Docker)..."
                size="small"
                fullWidth
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    borderRadius: "16px",
                    backgroundColor: bgInnerCard,
                    color: textPrimary,
                    "& fieldset": { borderColor: borderCol },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
                    "&.Mui-focused fieldset": { borderColor: "#06B6D4" },
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSkill}
                sx={{
                  borderRadius: "16px",
                  px: 3.5,
                  background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "0 6px 18px rgba(6, 182, 212, 0.4)",
                  "&:hover": { background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" },
                }}
              >
                Add Skill
              </Button>
            </Box>

            {/* INTERACTIVE SKILL CHIPS */}
            <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    mt: 2,
  }}
>
  {skillsList.map((skill) => (
    <Chip
      key={skill.id}
      label={skill.skill}
      onDelete={() => handleDeleteSkill(skill)}
      sx={{
        borderRadius: "12px",
        fontWeight: 700,
      }}
    />
  ))}
</Box>
          </Paper>
        )}

        {/* TAB 2: SECURITY & PREFERENCES */}
        {currentTabValue === 2 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, md: 4.5 },
              borderRadius: "28px",
              backgroundColor: bgCard,
              backdropFilter: "blur(12px)",
              border: `1px solid ${borderCol}`,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
              mb: 5,
            }}
          >
            <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, mb: 3, fontSize: "20px" }}>
              Security, 2FA & Notification Controls
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  backgroundColor: bgInnerCard,
                  border: `1px solid ${borderCol}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "rgba(16, 185, 129, 0.18)", color: "#10B981", borderRadius: "14px", width: 44, height: 44 }}>
                    <ShieldIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: textPrimary }}>
                      Two-Factor Authentication (2FA)
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
                      Secure your enterprise account with hardware or app-based 2FA tokens
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.twoFactorAuth}
                      onChange={(e) => setPreferences({ ...preferences, twoFactorAuth: e.target.checked })}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#06B6D4" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#06B6D4" } }}
                    />
                  }
                  label=""
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  backgroundColor: bgInnerCard,
                  border: `1px solid ${borderCol}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "rgba(6, 182, 212, 0.18)", color: "#06B6D4", borderRadius: "14px", width: 44, height: 44 }}>
                    <NotificationsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: textPrimary }}>
                      Email Notification Alerts
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
                      Receive real-time updates regarding leave requests, team tasks, and roster updates
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifs}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifs: e.target.checked })}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#06B6D4" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#06B6D4" } }}
                    />
                  }
                  label=""
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  backgroundColor: bgInnerCard,
                  border: `1px solid ${borderCol}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "rgba(245, 158, 11, 0.18)", color: "#F59E0B", borderRadius: "14px", width: 44, height: 44 }}>
                    <LockIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: textPrimary }}>
                      Change Password & Security Keys
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
                      Update your account authentication credentials and API keys
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/change-password")}
                  sx={{
                    borderRadius: "14px",
                    fontWeight: 800,
                    textTransform: "none",
                    borderColor: borderCol,
                    color: textPrimary,
                    "&:hover": { borderColor: "#06B6D4", backgroundColor: bgInnerCard },
                  }}
                >
                  Manage Security
                </Button>
              </Paper>
            </Box>
          </Paper>
        )}

        {/* FOOTER */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
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
            background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
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

export default EditProfile;