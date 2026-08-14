import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
   
  ResponsiveContainer,
  Legend,
} from "recharts";

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

const [meeting, setMeeting] = useState({});
const [chartData, setChartData] = useState([]);

  const [activities, setActivities] = useState([]);

const [notifications, setNotifications] = useState([]);
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
  const [newEmpDept, setNewEmpDept] = useState("Engineering");
  const [newEmpRole, setNewEmpRole] = useState("Software Engineer");

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
      "http://localhost:4000/dashboard/stats"
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
      "http://localhost:4000/webservices/users/get-all-users"
    );

    if (res.data.status === 1) {
      setEmployees(res.data.data);
    }
  } catch (err) {
    console.log("Employee Fetch Error:", err);
  }
};

const searchEmployees = async (searchText) => {
  try {
    // If search box is empty, load all employees
    if (searchText.trim() === "") {
      fetchEmployees();
      return;
    }

    const res = await axios.post(
      "http://localhost:4000/webservices/users/search-users",
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




const fetchActivities = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4000/audit-logs"
    );

    if (res.data.status === 1) {
      setActivities(res.data.data);
    }
  } catch (err) {
    console.log("Activities Fetch Error:", err);
  }
};


const fetchMeeting = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4000/meetings"
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
      "http://localhost:4000/dashboard/department-chart"
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
      "http://localhost:4000/dashboard/performance"
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
    const res = await axios.get("http://localhost:4000/admin-notes");

    if (res.data.status === 1) {
      setNotes(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};

const fetchAuditLogs = async () => {
  try {
    const res = await axios.get("http://localhost:4000/audit-logs");

    if (res.data.status === 1) {
      setActivities(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};


const fetchNotifications = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4000/notifications"
    );

    if (res.data.status === 1) {
      setNotifications(res.data.data);
    }
  } catch (err) {
    console.log("Notification error:", err);
  }
};

  // Add Employee Handler
  
const handleAddEmployee = async () => {
  try {
    if (!newEmpName || !newEmpEmail) {
      setToastMessage("Please fill all fields");
      return;
    }

    const res = await axios.post(
      "http://localhost:4000/webservices/users/add-users",
      {
        name: newEmpName,
        email: newEmpEmail,
        password: "123456",
        role: newEmpRole,
        user_type: 2,
        department: newEmpDept,
        designation: newEmpRole,
        attendance: "Present",
        status: 1,
      }
    );

    if (res.data.status === 1) {
      setToastMessage("Employee Added Successfully");

      setAddModalOpen(false);

      setNewEmpName("");
      setNewEmpEmail("");
      setNewEmpDept("Engineering");
      setNewEmpRole("Software Engineer");

      fetchEmployees();      // Refresh employee list
      fetchDashboardStats(); // Refresh dashboard counters
    } else {
      setToastMessage(res.data.message);
    }
  } catch (err) {
    console.log(err);
    setToastMessage("Something went wrong");
  }
};

const handleUpdateEmployee = async () => {
  try {
    const res = await axios.post(
      "http://localhost:4000/webservices/users/update-user",
      {
        id: editEmployee.id,
        name: editEmployee.name,
        email: editEmployee.email,

        role: editEmployee.designation,
        user_type: 2,

        department: editEmployee.department,
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
  try {
    const res = await axios.post(
      "http://localhost:4000/webservices/users/delete-user",
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


  // Export Data Download Trigger
const handleExportData = async () => {
  try {
    const res = await axios.get("http://localhost:4000/dashboard/report");

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
  if (!quickNote.trim()) return;

  try {
    const res = await axios.post(
      "http://localhost:4000/admin-notes/add",
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
  try {
    const res = await axios.post(
      "http://localhost:4000/notifications/read",
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

  // Filtered employees for real-time search & status tabs
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
  statusFilter === "All" ||
  emp.attendance === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // THEME COLOR TOKENS
  const bgPageGradient = darkMode
    ? "linear-gradient(135deg, #090D16 0%, #0F172A 50%, #080C14 100%)"
    : "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #DBEAFE 100%)";

  const bgSidebarGradient = darkMode
    ? "linear-gradient(180deg, #0F172A 0%, #1E293B 60%, #090D16 100%)"
    : "linear-gradient(180deg, #0284C7 0%, #0369A1 60%, #075985 100%)";

  const textPrimary = darkMode ? "#F8FAFC" : "#0F172A";
  const textSecondary = darkMode ? "#94A3B8" : "#0284C7";
  const lineDivider = darkMode ? "rgba(255,255,255,0.08)" : "rgba(2,132,199,0.15)";

  // Sidebar Menu Configuration
  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, path: "/employees" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    { text: "Edit Profile", icon: <EditIcon />, path: "/edit-profile" },
    { text: "Change Password", icon: <LockIcon />, path: "/change-password" },
  ];

  // Key Performance Stats Data
 const stats = [
  {
    title: "Total Employees",
    value: dashboardStats.totalEmployees,
    change: "Live",
    color: "#06B6D4",
  },
  {
    title: "Departments",
    value: dashboardStats.totalDepartments,
    change: "Live",
    color: "#10B981",
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

  const [user, setUser] = useState(null);
useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/auth/me",
        {
          withCredentials: true,
        }
      );

      setUser(response.data.user);
    } catch (err) {
      console.log(err);
      navigate("/");
    }
  };

  fetchUser();
  fetchDashboardStats();
  fetchEmployees();
   fetchActivities();
 fetchNotifications();
  fetchMeeting();
   fetchDepartmentChart();
   fetchPerformance();
   fetchNotes();
   fetchAuditLogs();
   fetchNotifications();
}, [navigate]);

// PAGE-MATCHING BLUE & CYAN THEME COLORS FOR PIE CHART
const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#84CC16", // Lime
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
          <Box display="flex" alignItems="center" gap={1.5} mb={4} px={1}>
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

          {/* SIDEBAR MENU ITEMS */}
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

      {/* MAIN OPEN CONTENT AREA */}
      <Box
        sx={{
          flex: 1,
          ml: "250px",
          p: { xs: 3, md: 5 },
          boxSizing: "border-box",
          maxWidth: "calc(100vw - 250px)",
        }}
      >
        {/* TOP NAVIGATION HEADER BAR - SEARCH ON LEFT / (THEME, NOTIF, AVATAR) ALIGNED ON SAME ROW ON RIGHT */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 5,
          }}
        >
          {/* SEARCH BAR (TOP LEFT) */}
          <TextField
            placeholder="Search team members, analytics, or reports..."
            size="small"
            value={searchQuery}
onChange={(e) => {
  setSearchQuery(e.target.value);
  searchEmployees(e.target.value);
}}            sx={{
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
                "& fieldset": { borderColor: lineDivider },
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
        fontWeight: item.is_read === 0 ? 800 : 600,
        color: textPrimary,
      }}
    >
      {item.title}
    </Typography>

    <Typography
      variant="caption"
      sx={{ color: textSecondary }}
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
                },
              }}
            >
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/profile"); }} sx={{ fontWeight: 700 }}>My Profile</MenuItem>
                           <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/Edit-Profile"); }} sx={{ fontWeight: 700 }}>Edit Profile</MenuItem>

              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/change-password"); }} sx={{ fontWeight: 700 }}>Change Password</MenuItem>
              <Divider sx={{ my: 1, borderColor: lineDivider }} />
              <MenuItem onClick={() => navigate("/")} sx={{ color: "#FF4D4D !important", fontWeight: 800 }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* ITEM 1: OPEN HERO SHOWCASE */}
        <Box
          sx={{
            p: { xs: 4, md: 5 },
            mb: 6,
            borderRadius: "36px",
            background: "linear-gradient(135deg, #0284C7 0%, #0369A1 60%, #075985 100%)",
            color: "#FFFFFF",
            boxShadow: "0 20px 50px rgba(2, 132, 199, 0.35)",
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
              <Typography sx={{ color: "#E0F2FE", fontSize: "16px", mb: 4, maxWidth: "620px", lineHeight: 1.6 }}>
                Track real-time engineering velocity movement, manage cross-department team members, and review daily audit logs in your workspace.
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddModalOpen(true)}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    color: "#0369A1",
                    borderRadius: "18px",
                    px: 3.5,
                    py: 1.4,
                    fontWeight: 800,
                    fontSize: "14px",
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    "&:hover": { backgroundColor: "#F0F9FF" },
                  }}
                >
                  Add Employee
                </Button>
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
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ITEM 2: FLOATING STATS COUNTERS */}
        <Grid container spacing={4} sx={{ mb: 7 }}>
          {stats.map((st) => (
            <Grid item xs={12} sm={6} md={3} key={st.title}>
              <Box
                sx={{
                  py: 3,
                  px: 3.5,
                  borderRadius: "24px",
                  borderLeft: `5px solid ${st.color}`,
                  backgroundColor: darkMode ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  transition: "transform 0.25s ease",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <Typography variant="body2" fontWeight="800" sx={{ color: textSecondary, fontSize: "13px" }}>
                  {st.title}
                </Typography>
                <Typography variant="h4" fontWeight="900" sx={{ color: textPrimary, my: 1 }}>
                  {st.value}
                </Typography>
                <Chip label={st.change} size="small" sx={{ fontWeight: 800, fontSize: "11px", backgroundColor: `${st.color}20`, color: st.color }} />
              </Box>
            </Grid>
          ))}
        </Grid>
<Box
  sx={{
    mt: 5,
    p: 3,
    borderRadius: "24px",
    borderLeft: "5px solid #06B6D4",
    backgroundColor: darkMode
      ? "rgba(15,23,42,0.7)"
      : "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  }}
>
  <Typography
    variant="h6"
    fontWeight="bold"
    mb={2}
    color={textPrimary}
   
  >
    Employees by Department
  </Typography>

  <ResponsiveContainer width="100%" height={350}>
    <PieChart>
      <Pie
        data={chartData}
        dataKey="total"
        nameKey="department"
        outerRadius={120}
        label
      >
        {chartData.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</Box>
        {/* ITEM 3: TEAM PERFORMANCE MOVEMENT GRAPH */}
        <Box sx={{ mt: 4, mb: 7, py: 4, px: { xs: 2, md: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #06B6D4 0%, #10B981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  boxShadow: "0 8px 24px rgba(6, 182, 212, 0.45)",
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
                    backgroundColor: graphTimeframe === tf ? "#06B6D4" : darkMode ? "rgba(30,41,59,0.7)" : "rgba(224,242,254,0.8)",
                    color: graphTimeframe === tf ? "#FFFFFF" : textPrimary,
                    boxShadow: graphTimeframe === tf ? "0 6px 20px rgba(6,182,212,0.45)" : "none",
                    transition: "all 0.25s ease",
                    "&:hover": { backgroundColor: "#0284C7", color: "#FFFFFF", transform: "translateY(-2px)" },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* DYNAMIC ELECTRIC CYAN SVG WAVE CANVAS WITH GENEROUS HEIGHT & SPACING */}
          <Box sx={{ width: "100%", height: 270, position: "relative", my: 4 }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="electricWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
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
                stroke="#06B6D4"
                strokeWidth="5"
                style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", filter: "drop-shadow(0 6px 16px rgba(6,182,212,0.6))" }}
              />

              {/* EMERALD GREEN MOVEMENT PULSE POINTS */}
{currentGraphData?.pts?.map((pt, idx) => (                <g key={idx}>
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r={idx === currentGraphData.pts.length - 1 ? 8.5 : 6}
                    fill={idx === currentGraphData.pts.length - 1 ? "#10B981" : "#06B6D4"}
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
              <Box sx={{ p: 3, borderRadius: "22px", borderLeft: "5px solid #10B981", backgroundColor: darkMode ? "rgba(15,23,42,0.6)" : "rgba(240,253,244,0.8)" }}>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, fontSize: "13px" }}>Sprint Velocity Score</Typography>
                <Typography variant="h6" fontWeight="900" sx={{ color: "#10B981", mt: 0.5, fontSize: "20px" }}>{currentGraphData?.velocity}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 3, borderRadius: "22px", borderLeft: "5px solid #06B6D4", backgroundColor: darkMode ? "rgba(15,23,42,0.6)" : "rgba(224,242,254,0.8)" }}>
                <Typography variant="caption" fontWeight="700" sx={{ color: textSecondary, fontSize: "13px" }}>Code Quality Index</Typography>
                <Typography variant="h6" fontWeight="900" sx={{ color: "#06B6D4", mt: 0.5, fontSize: "20px" }}>{currentGraphData?.quality}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 3, borderRadius: "22px", borderLeft: "5px solid #F59E0B", backgroundColor: darkMode ? "rgba(15,23,42,0.6)" : "rgba(254,243,199,0.8)" }}>
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
                fontWeight: 800,
                fontSize: "12px",
                borderRadius: "12px",

                backgroundColor:
                  statusFilter === st
                    ? "#06B6D4"
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

          backgroundColor: "transparent",

          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#06B6D4",
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
                      {emp.department || "-"}
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
                      {emp.joined_date ||
                        emp.joinedDate ||
                        emp.created_at ||
                        "-"}
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
                            ? "#10B981"
                            : String(
                                emp.attendance || ""
                              ).toLowerCase() === "absent"
                            ? "#F59E0B"
                            : "#06B6D4",
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
              ? "#0F172A !important"
              : "#FFFFFF !important",
            color: textPrimary,
          },
        }}
      >

        <MenuItem
          onClick={() => {
            setRowMenuAnchorEl(null);
            navigate("/profile");
          }}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          View Profile
        </MenuItem>


        <MenuItem
          onClick={() => {

            if (!selectedEmp) return;

            setEditEmployee({
              id: selectedEmp.id,
              name: selectedEmp.name,
              email: selectedEmp.email,
              department: selectedEmp.department,
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


        <Divider
          sx={{
            my: 1,
            borderColor: lineDivider,
          }}
        />


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

      </Menu>

    </Box>


    {/* =====================================================
        ADMIN SCRATCHPAD

        IMPORTANT:
        No ml:30
        No ml:46
        No huge artificial margin
        ===================================================== */}

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
              borderColor: "#06B6D4",
            },
          },
        }}
      />


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
              borderRadius: "12px",
            }}
          >
            <Typography>
              {item.note}
            </Typography>
          </Paper>

        ))}

      </Box>


      {/* ---------- SAVE BUTTON ---------- */}

      <Button
        fullWidth
        variant="contained"
        onClick={saveNote}
        sx={{
          borderRadius: "14px",
          backgroundColor: "#06B6D4",
          fontWeight: 800,
          textTransform: "none",
          py: 1.2,
        }}
      >
        Pin Session Note
      </Button>

    </Box>

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

      mt: 15,
      ml: 10,

      width: "auto",
      maxWidth: "100%",

      pl: { lg: 2 },

      height: "fit-content",
    }}
  >

    {/* =================================================
        LIVE STANDUPS & CALLS
        ================================================= */}

    <Box
      mb={6}
    >

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
          p: 3,
          borderRadius: "22px",
          borderLeft: "5px solid #06B6D4",

          backgroundColor:
            darkMode
              ? "rgba(15,23,42,0.6)"
              : "rgba(224,242,254,0.7)",
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
                "rgba(6,182,212,0.2)",

              color: "#06B6D4",
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
            backgroundColor: "#06B6D4",
            textTransform: "none",
            fontWeight: 800,
            py: 1.2,
          }}
        >
          {meeting.button || "Join Video Call"}
        </Button>

      </Box>

    </Box>


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
              "rgba(6,182,212,0.15)",
            color: "#06B6D4",
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

  </Grid>

</Grid>
            </Box>
           

      {/* MODAL 1: ADD NEW EMPLOYEE MODAL (WITH GENEROUS SPACING BETWEEN INPUT BOXES) */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 2.5,
            backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
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
                    backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
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
                    backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
                  },
                }}
              />
            </Box>

            {/* FIELD 3: DEPARTMENT */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mt: 2, mb: 1, color: textPrimary, fontSize: "13px", letterSpacing: "0.5px" }}>
                DEPARTMENT *
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  sx={{
                    borderRadius: "16px",
                    backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
                  }}
                >
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                  <MenuItem value="Human Resources">Human Resources</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* FIELD 4: JOB POSITION / ROLE */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mt: 2, mb: 1, color: textPrimary, fontSize: "13px", letterSpacing: "0.5px" }}>
                JOB POSITION / ROLE
              </Typography>
              <TextField
                placeholder="e.g. Senior Frontend Lead"
                fullWidth
                value={newEmpRole}
                onChange={(e) => setNewEmpRole(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#06B6D4" },
                  },
                }}
              />
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
            sx={{ borderRadius: "14px", background: "#06B6D4", textTransform: "none", fontWeight: 800, px: 3.5, py: 1.2 }}
          >
            Create Employee Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: GENERATE REPORT MODAL WITH REAL DOWNLOAD */}
      <Dialog
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 2.5,
            backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
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
            <InputLabel shrink style={{ color: "#06B6D4", fontWeight: 800, fontSize: "13px" }}>EXPORT FORMAT</InputLabel>
            <Select
              defaultValue="JSON"
              id="export-format-select"
              label="EXPORT FORMAT"
              sx={{
                borderRadius: "14px",
                backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
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
  open={editModalOpen}
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
  );
}

export default Dashboard;