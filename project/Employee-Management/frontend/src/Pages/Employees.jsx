import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


// Material UI Core Imports
import {
  Box,
  Typography,
  Button,
 
  Avatar,
  TextField,
  Divider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControl,
  Checkbox,
  Select,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";




function Employees() {
  const navigate = useNavigate();

  // THEME STATE (DARK & LIGHT MODE) MATCHING DASHBOARD
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

  // SEARCH & FILTER STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  // SIDEBAR ACTIVE TAB
  const [activeTab, setActiveTab] = useState("Employees");

  // TOPBAR MENUS STATE
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [user, setUser] = useState(null);

  // ADD EMPLOYEE MODAL STATE
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("");
  const [newEmpDesignation, setNewEmpDesignation] = useState("");
  const [newEmpAttendance, setNewEmpAttendance] = useState("Present");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Current time is updated outside render so React Compiler can keep
  // the component render pure.
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(Date.now());
    };

    updateCurrentTime();

    const timer = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(timer);
  }, []);

  // MAIL ANNOUNCEMENT STATE
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [sendingMail, setSendingMail] = useState(false);


  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

// GOOGLE MEET STATE
const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);

const [meetingTitle, setMeetingTitle] = useState("");
const [meetingDate, setMeetingDate] = useState("");
const [meetingStartTime, setMeetingStartTime] = useState("");
const [meetingEndTime, setMeetingEndTime] = useState("");

const [selectedMeetingEmployeeIds, setSelectedMeetingEmployeeIds] =
  useState([]);

const [creatingMeeting, setCreatingMeeting] = useState(false);

  

  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== "string") return undefined;

    const value = imagePath.trim();
    if (!value) return undefined;

    if (/^https?:\/\//i.test(value)) return value;

    return `http://localhost:4000${value.startsWith("/") ? "" : "/"}${value}`;
  };

const fetchEmployees = useCallback(async (search = "") => {
  try {
    const query = search.trim();

    // Always load the complete employee list from the backend first.
    // This keeps the real employee count independent from search results.
    if (!query) {
      const response = await axios.post(
        "http://localhost:4000/webservices/users/get-all-users",
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data?.status === 1) {
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setAllEmployees(data);
        setEmployees(data);

        console.log(
          `Employees loaded from backend: ${data.length}`,
          data
        );
      } else {
        setAllEmployees([]);
        setEmployees([]);
      }

      return;
    }

    // Search only changes the visible table.
    const response = await axios.post(
      "http://localhost:4000/webservices/users/search-users",
      { search: query },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setEmployees(
        Array.isArray(response.data.data)
          ? response.data.data
          : []
      );
    } else {
      setEmployees([]);
    }
  } catch (error) {
    console.error(
      "Employees Fetch/Search Error:",
      error?.response?.data || error.message
    );

    // Do not destroy the complete employee list when search fails.
    if (!search.trim()) {
      setAllEmployees([]);
      setEmployees([]);
    }
  }
}, []);

const getEmployeeCreatedTime = useCallback((employee) => {
  const raw =
    employee?.created_at ??
    employee?.createdAt ??
    employee?.timestamp ??
    employee?.joining_date ??
    0;

  if (!raw) return 0;

  const numeric = Number(raw);

  // MySQL timestamp values in this project are Unix seconds.
  if (Number.isFinite(numeric)) {
    return numeric < 1000000000000
      ? numeric * 1000
      : numeric;
  }

  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}, []);

const formatRelativeTime = (value, now) => {
  if (!value) return "";

  const timestamp = getEmployeeCreatedTime({ created_at: value });
  if (!timestamp) return "";

  if (!now) return "";

  const diffSeconds = Math.max(
    0,
    Math.floor((now - timestamp) / 1000)
  );

  if (diffSeconds < 60) return "Just now";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

const getNotificationSubtitle = (notification, currentTime) => {
  const employeeName =
    notification?.employee_name ||
    notification?.employeeName ||
    notification?.name ||
    notification?.user_name ||
    notification?.userName;

  const department =
    notification?.department ||
    notification?.department_name ||
    notification?.departmentName;

  // New employee / employee-related notification.
  if (employeeName && department) {
    return `${employeeName} • ${department}`;
  }

  if (employeeName) {
    return employeeName;
  }

  // Leave / attendance / department notification.
  if (department) {
    const relative = formatRelativeTime(
      notification?.created_at ||
      notification?.timestamp,
      currentTime
    );

    return relative
      ? `${relative} • ${department}`
      : department;
  }

  if (notification?.subtitle) {
    return notification.subtitle;
  }

  const relative = formatRelativeTime(
    notification?.created_at ||
    notification?.timestamp,
    currentTime
  );

  return relative;
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
      const notificationData = Array.isArray(
        response.data.data
      )
        ? [...response.data.data]
        : [];

      notificationData.sort(
        (a, b) =>
          getEmployeeCreatedTime(b?.created_at || b?.timestamp) -
          getEmployeeCreatedTime(a?.created_at || a?.timestamp)
      );

      setNotifications(notificationData);
    } else {
      setNotifications([]);
    }
  } catch (error) {
    console.error(
      "Notification Fetch Error:",
      error?.response?.data || error.message
    );
    setNotifications([]);
  } finally {
    setNotificationLoading(false);
  }
};

const handleNotificationClick = async (notification) => {
  try {
    if (Number(notification?.is_read) === 0 && notification?.id) {
      await axios.post(
        "http://localhost:4000/notifications/read",
        { id: notification.id },
        { withCredentials: true }
      );
    }
  } catch (error) {
    console.error(
      "Notification Read Error:",
      error?.response?.data || error.message
    );
  } finally {
    setNotifAnchorEl(null);
    fetchNotifications();
  }
};


const fetchPerformance = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/dashboard/performance",
      {
        withCredentials: true,
      }
    );

    if (response.data.status === 1) {
      setPerformanceData(response.data.data);
    }
  } catch (error) {
    console.log("Performance Fetch Error:", error);
  }
};

const handlePerformanceClick = (item) => {
  setSelectedPerformance(item);
  setToastMessage(
    `${item?.timeframe || "Performance"} selected`
  );
};

const getMeetingLink = (meeting) => {
  if (!meeting) return "";

  const candidates = [
    meeting.meeting_link,
    meeting.meeting_url,
    meeting.meet_link,
    meeting.google_meet_link,
    meeting.googleMeetLink,
    meeting.join_url,
    meeting.joinUrl,
    meeting.url,
    meeting.link,
  ];

  const link = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim() !== ""
  );

  return link ? link.trim() : "";
};

const openMeeting = (meeting) => {
  const link = getMeetingLink(meeting);

  if (!link) {
    setToastMessage(
      "Google Meet link is missing from the backend meeting record."
    );
    return;
  }

  const normalizedLink =
    /^https?:\/\//i.test(link)
      ? link
      : `https://${link}`;

  window.open(
    normalizedLink,
    "_blank",
    "noopener,noreferrer"
  );
};

const fetchMeetings = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/meetings",
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setMeetings(data);

      console.log("Meetings loaded from backend:", data);
    } else {
      setMeetings([]);
      console.warn(
        "Meetings API:",
        response.data?.message || "No meetings returned"
      );
    }
  } catch (error) {
    console.log("Meetings Fetch Error:", error);
  }
};



const fetchUser = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/auth/me",
      {
        withCredentials: true,
      }
    );

    setUser(
      response.data?.user ||
      response.data?.data ||
      null
    );
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  fetchEmployees();
  fetchPerformance();
  fetchMeetings();
  fetchNotifications();
  fetchUser();
}, [fetchEmployees]);

useEffect(() => {
  const timer = setTimeout(() => {
    fetchEmployees(searchQuery);
  }, 300);

  return () => clearTimeout(timer);
}, [searchQuery, fetchEmployees,]);

const unreadCount = notifications.filter(
  (notification) => Number(notification?.is_read) === 0
).length;


  const handleEditClick = async (id) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/webservices/users/get-user-by-id",
      { id },
      {
        withCredentials: true,
      }
    );

    if (response.data.status === 1) {
      const emp = response.data.data;

      setEditingEmployee(emp);

      setNewEmpName(emp.name);
      setNewEmpRole(emp.role);
      setNewEmpDept(emp.department);
setNewEmpDesignation(emp.designation);
setNewEmpAttendance(emp.attendance);  
      setEditMode(true);
      setAddModalOpen(true);
    }
  } catch (error) {
    console.log(error);
  }
};

  // ADD EMPLOYEE HANDLER
 const handleAddEmployee = async () => {
  if (!newEmpName) {
    setToastMessage("Please enter employee name.");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:4000/webservices/users/add-users",
     {
  name: newEmpName,
  email: `${newEmpName.toLowerCase().replace(/\s/g, "")}@gmail.com`,
  password: "123456",
  role: "user",
  user_type: 3,
  profile_pic: "",
  cover_pic: "",
  department: newEmpDept,
  designation: newEmpDesignation,
  attendance: newEmpAttendance,
  status: 1,
  added_by: 1,
},
      {
        withCredentials: true,
      }
    );

    if (response.data.status === 1) {
      setToastMessage("Employee Added Successfully");

      setAddModalOpen(false);

      setNewEmpName("");
      setNewEmpDept("");
setNewEmpDesignation("");
setNewEmpRole("");

      await fetchEmployees();   // Refresh table + backend statistics
      await fetchNotifications(); // Refresh notification badge/feed
    } else {
      setToastMessage(response.data.message);
    }
  } catch (error) {
    console.log(error);
    setToastMessage("Failed to add employee");
  }
};


const handleUpdateEmployee = async () => {
  try {
    const response = await axios.post(
      "http://localhost:4000/webservices/users/update-user",
      {
        id: editingEmployee.id,
        name: newEmpName,
        email: editingEmployee.email,
        role: newEmpRole,
        department: newEmpDept,
        designation: newEmpDesignation,
        attendance: newEmpAttendance,
        user_type: editingEmployee.user_type,
        profile_pic: editingEmployee.profile_pic,
        cover_pic: editingEmployee.cover_pic,
        status: editingEmployee.status,
        added_by: editingEmployee.added_by,
      },
      {
        withCredentials: true,
      }
    );


    if (response.data.status === 1) {
      setToastMessage("Employee Updated Successfully");

      setAddModalOpen(false);
      setEditMode(false);
      setEditingEmployee(null);

      await fetchEmployees();
      await fetchNotifications();
    } else {
      setToastMessage(response.data.message);
    }
  } catch (error) {
    console.log(error);
    setToastMessage("Update Failed");
  }
};
    
  // DELETE EMPLOYEE HANDLER
  const handleDeleteEmployee = async (id) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/webservices/users/delete-user",
      {
        id: id,
      },
      {
        withCredentials: true,
      }
    );

    if (response.data.status === 1) {
      setToastMessage("Employee Deleted Successfully");
      fetchEmployees();
    } else {
      setToastMessage(response.data.message);
    }
  } catch (error) {
    console.log(error);
    setToastMessage("Delete Failed");
  }
};

<Box sx={{ mb: 3 }}>
  <Typography
    sx={{
      fontWeight: 800,
      mb: 1,
    }}
  >
    Select Employees
  </Typography>

  <Box
    sx={{
      maxHeight: 220,
      overflowY: "auto",
      border: "1px solid #B6D9EA",
      borderRadius: "12px",
      p: 1,
    }}
  >
    {employees
      .filter((employee) => employee.email)
      .map((employee) => {
        const id = Number(employee.id);

        return (
          <Box
            key={employee.id}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              borderRadius: "8px",
            }}
          >
            <Checkbox
              checked={selectedEmployeeIds.includes(id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEmployeeIds((prev) => [
                    ...prev,
                    id,
                  ]);
                } else {
                  setSelectedEmployeeIds((prev) =>
                    prev.filter(
                      (selectedId) => selectedId !== id
                    )
                  );
                }
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {employee.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#64748B",
                }}
              >
                {employee.email}
              </Typography>
            </Box>
          </Box>
        );
      })}
  </Box>

  <Typography
    sx={{
      mt: 1,
      fontSize: "13px",
      fontWeight: 700,
      color: "#0284C7",
    }}
  >
    {selectedEmployeeIds.length} employee(s) selected
  </Typography>
</Box>


  // SEND MAIL ANNOUNCEMENT TO ALL EMPLOYEES
  

  // SEND MAIL ANNOUNCEMENT TO SELECTED EMPLOYEES
const handleSendAnnouncement = async () => {
  const subject = mailSubject.trim();
  const message = mailMessage.trim();

  if (!subject) {
    setToastMessage("Please enter a subject.");
    return;
  }

  if (!message) {
    setToastMessage("Please enter the announcement message.");
    return;
  }

  if (selectedEmployeeIds.length === 0) {
    setToastMessage("Please select at least one employee.");
    return;
  }

  try {
    setSendingMail(true);

    console.log(
      "Sending mail to employee IDs:",
      selectedEmployeeIds
    );

    const response = await axios.post(
      "http://localhost:4000/webservices/mail/send-announcement",
      {
        subject,
        message,

        // IMPORTANT:
        // Send ONLY selected employee IDs
        recipientIds: selectedEmployeeIds,
      },
      {
        withCredentials: true,
      }
    );

    console.log(
      "Announcement response:",
      response.data
    );

    if (response.data?.status === 1) {
      setToastMessage(
        `Announcement sent to ${
          response.data.recipientCount ||
          selectedEmployeeIds.length
        } employee(s).`
      );

      // Clear form
      setMailSubject("");
      setMailMessage("");

      // Clear selected employees
      setSelectedEmployeeIds([]);

      // Close popup
      setMailDialogOpen(false);
    } else {
      setToastMessage(
        response.data?.message ||
          "Failed to send announcement."
      );
    }
  } catch (error) {
    console.error(
      "Send Mail Announcement Error:",
      error?.response?.data || error
    );

    setToastMessage(
      error?.response?.data?.message ||
        "Failed to send announcement."
    );
  } finally {
    setSendingMail(false);
  }
};





const handleCreateMeeting = async () => {
  if (!meetingTitle.trim()) {
    setToastMessage("Please enter a meeting title.");
    return;
  }

  if (!meetingDate) {
    setToastMessage("Please select a date.");
    return;
  }

  if (!meetingStartTime) {
    setToastMessage("Please select a start time.");
    return;
  }

  if (!meetingEndTime) {
    setToastMessage("Please select an end time.");
    return;
  }

  if (selectedMeetingEmployeeIds.length === 0) {
    setToastMessage("Please select at least one employee.");
    return;
  }

  try {
    setCreatingMeeting(true);

    const response = await axios.post(
      "http://localhost:4000/meetings/create",
      {
        title: meetingTitle.trim(),
        date: meetingDate,
        startTime: meetingStartTime,
        endTime: meetingEndTime,
        participantIds: selectedMeetingEmployeeIds,
      },
      {
        withCredentials: true,
      }
    );

    if (response.data?.status === 1) {
      setToastMessage("Google Meet created successfully.");

      setMeetingTitle("");
      setMeetingDate("");
      setMeetingStartTime("");
      setMeetingEndTime("");
      setSelectedMeetingEmployeeIds([]);

      setMeetingDialogOpen(false);

      await fetchMeetings();
    } else {
      setToastMessage(
        response.data?.message || "Failed to create meeting."
      );
    }
  } catch (error) {
    console.error(
      "Create Meeting Error:",
      error?.response?.data || error
    );

    setToastMessage(
      error?.response?.data?.message ||
        "Failed to create Google Meet."
    );
  } finally {
    setCreatingMeeting(false);
  }
};

  // FILTERED EMPLOYEES
const filteredEmployees = employees.filter((emp) => {
  const matchesDepartment =
    activeFilter === "All" || emp.department === activeFilter;

  return matchesDepartment;
});

  // EXACT MATCHING DASHBOARD COLOR THEME TOKENS
  const bgPageGradient = darkMode
    ? "linear-gradient(135deg, #090D16 0%, #0F172A 50%, #080C14 100%)"
    : "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #DBEAFE 100%)";

  const bgSidebarGradient = darkMode
    ? "linear-gradient(180deg, #0F172A 0%, #1E293B 60%, #090D16 100%)"
    : "linear-gradient(180deg, #0284C7 0%, #0369A1 60%, #075985 100%)";

  const textPrimary = darkMode ? "#F8FAFC" : "#0F172A";
  const textSecondary = darkMode ? "#94A3B8" : "#0284C7";
  const lineDivider = darkMode ? "rgba(255,255,255,0.08)" : "rgba(2,132,199,0.15)";
  const bgBoxContainer = darkMode ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.75)";

  // Streamlined Sidebar Menu List
  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, path: "/employees" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    { text: "Edit Profile", icon: <EditIcon />, path: "/edit-profile" },
    { text: "Change Password", icon: <LockIcon />, path: "/change-password" },
  ];


// ===============================
// EMPLOYEE PAGE STATISTICS
// ===============================

const employeeStatsSource =
  allEmployees.length > 0 ? allEmployees : employees;

const totalEmployees = employeeStatsSource.length;

const totalDepartments = new Set(
  employeeStatsSource
    .map((emp) => emp.department)
    .filter(Boolean)
).size;

const presentEmployees = employeeStatsSource.filter(
  (emp) => emp.attendance === "Present"
).length;

const attendanceRate =
  totalEmployees > 0
    ? ((presentEmployees / totalEmployees) * 100).toFixed(1)
    : "0.0";

    
 const productivityIndex =
  performanceData.length > 0
    ? parseFloat(
        String(performanceData[0].velocity || "0")
      ) || 0
    : 0;

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
                    if (item.path !== "/employees") navigate(item.path);
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

      {/* MAIN DASHBOARD CONTENT AREA */}
      <Box
        sx={{
          flex: 1,
          ml: "250px",
          p: { xs: 3, md: 5 },
          boxSizing: "border-box",
          maxWidth: "calc(100vw - 250px)",
        }}
      >
        {/* TOP NAVIGATION HEADER BAR - SEARCH ON LEFT / ACTIONS ON SAME HORIZONTAL ROW ON RIGHT */}
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
            placeholder="Search team members, departments, or roles..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                onClick={toggleTheme}
                sx={{ml:-12,
                  backgroundColor: darkMode ? "rgba(2, 7, 15, 0.8)" : "rgba(224, 242, 254, 0.8)",
                  p: 1.2,
                  borderRadius: "16px",
                  color: textPrimary,
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "rotate(15deg)" },
                }}
              >
                {darkMode
                  ? <LightModeIcon sx={{ fontSize: 20, color: "#000000" }} />
                  : <DarkModeIcon sx={{ fontSize: 20, color: "#000000" }} />}
              </IconButton>
            </Tooltip>

            {/* 2. NOTIFICATIONS BELL BUTTON */}
            <IconButton
              onClick={(e) => {
                setNotifAnchorEl(e.currentTarget);
                fetchNotifications();
              }}
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
                  width: 360,
                  maxHeight: 520,
                  p: 1,
                  backgroundColor: darkMode ? "#0F172A !important" : "#FFFFFF !important",
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
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
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
                            : "#F0F9FF"
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
                          color: "#0284C7",
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

            <Divider orientation="vertical" flexItem sx={{ height: 28, borderColor: lineDivider }} />

            {/* 3. USER PROFILE AVATAR & NAME */}
            <Box onClick={(e) => setProfileAnchorEl(e.currentTarget)} sx={{ mt:-9,display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
             <Avatar
  src={user?.profile_pic}
  alt={user?.name}
  sx={{
    width: 42,
    height: 42,
    border: "2px solid #06B6D4",
    boxShadow: "0 0 12px rgba(6,182,212,0.4)",
  }}
>
  {user?.name?.charAt(0)}
</Avatar>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
               <Typography
  variant="subtitle2"
  sx={{ fontWeight: 400 }}
>
  {user?.name}
</Typography>

<Typography
  variant="caption"
  sx={{ color: textSecondary }}
>
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
                  borderRadius: "18px",
                  width: 190,
                  p: 1,
                  backgroundColor: darkMode ? "#0F172A !important" : "#FFFFFF !important",
                  color: textPrimary,
                },
              }}
            >
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/profile"); }} sx={{ fontWeight: 700 }}>My Profile</MenuItem>
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/edit-profile"); }} sx={{ fontWeight: 700 }}>Edit Profile</MenuItem>
              <MenuItem onClick={() => { setProfileAnchorEl(null); navigate("/change-password"); }} sx={{ fontWeight: 700 }}>Change Password</MenuItem>
              <Divider sx={{ my: 1, borderColor: lineDivider }} />
              <MenuItem onClick={() => navigate("/")} sx={{ color: "#FF4D4D !important", fontWeight: 800 }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* HERO TITLE BANNER */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={5}>
          <Box>
            <Typography variant="h3" fontWeight="900" sx={{ color: textPrimary, letterSpacing: "-0.02em" }}>
              Workforce Roster Directory
            </Typography>
            <Typography variant="body1" sx={{ color: textSecondary, mt: 0.5, fontSize: "16px" }}>
              Manage active employees, department allocations, and productivity benchmarks
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
  setEditMode(false);
  setEditingEmployee(null);
  setAddModalOpen(true);
}}
            sx={{
              mt:2,
              mb:3,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
              color: "#FFFFFF",
              px: 3.5,
              py: 1.4,
              fontWeight: 800,
              fontSize: "14px",
              textTransform: "none",
              boxShadow: "0 8px 24px rgba(6, 182, 212, 0.4)",
              transition: "all 0.25s ease",
              "&:hover": { background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", transform: "translateY(-2px)" },
            }}
          >
            Add New Employee
          </Button>
        </Box>

        {/* 4 DASHBOARD MATCHING STAT COUNTERS */}
        <Box
          sx={{
            mb: 6,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 4,
          }}
        >
          {[
  {
    title: "Total Employees",
    value: totalEmployees.toString(),
    sub: "Active workforce",
    color: "#06B6D4",
    icon: <GroupsIcon sx={{ fontSize: 26 }} />,
  },
  {
    title: "Active Departments",
    value: `${totalDepartments} Teams`,
    sub: "From employee records",
    color: "#10B981",
    icon: <WorkspacesIcon sx={{ fontSize: 26 }} />,
  },
  {
    title: "Attendance Rate",
    value: `${attendanceRate}%`,
    sub: `${presentEmployees} present today`,
    color: "#F59E0B",
    icon: <EventAvailableIcon sx={{ fontSize: 26 }} />,
  },
  {
  title: "Productivity Index",
  value: `${productivityIndex}%`,
  sub: "Based on 3 Months performance",
  color: "#3B82F6",
  icon: <TrendingUpIcon sx={{ fontSize: 26 }} />,
},
].map((st) => (
            <Box key={st.title}>
              <Box
                sx={{
                  py: 3,
                  px: 3.5,
                  borderRadius: "24px",
                  borderLeft: `5px solid ${st.color}`,
                  backgroundColor: bgBoxContainer,
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  transition: "transform 0.25s ease",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight="800" sx={{ color: textSecondary, fontSize: "13px" }}>
                    {st.title}
                  </Typography>
                  <Box sx={{ color: st.color }}>{st.icon}</Box>
                </Box>
                <Typography variant="h4" fontWeight="900" sx={{ color: textPrimary, my: 1 }}>
                  {st.value}
                </Typography>
                <Chip label={st.sub} size="small" sx={{ fontWeight: 800, fontSize: "11px", backgroundColor: `${st.color}20`, color: st.color }} />
              </Box>
            </Box>
          ))}
        </Box>

        {/* DEPARTMENT FILTER CHIPS */}
        <Box mb={4} display="flex" gap={1.5} flexWrap="wrap">
          {["All", "Engineering", "UI/UX Design", "Operations", "Human Resources"].map((dept) => (
            <Chip
              key={dept}
              label={dept}
              clickable
              onClick={() => setActiveFilter(dept)}
              sx={{
                mb:3,
                fontWeight: 800,
                fontSize: "13px",
                px: 2.2,
                py: 2.3,
                borderRadius: "16px",
                backgroundColor: activeFilter === dept ? "#06B6D4" : darkMode ? "rgba(30,41,59,0.7)" : "rgba(224,242,254,0.8)",
                color: activeFilter === dept ? "#FFFFFF" : textPrimary,
                boxShadow: activeFilter === dept ? "0 6px 20px rgba(6,182,212,0.45)" : "none",
                transition: "all 0.25s ease",
                "&:hover": { backgroundColor: "#0284C7", color: "#FFFFFF", transform: "translateY(-2px)" },
              }}
            />
          ))}
        </Box>

        {/* EMPLOYEES DIRECTORY TABLE */}
        <Box sx={{ mb: 7 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, fontSize: "22px" }}>
                Active Workforce Roster
              </Typography>
              <Typography variant="caption" sx={{ mb:3,color: textSecondary, fontWeight: 600, fontSize: "13px" }}>
                Showing {filteredEmployees.length} registered team members
                {searchQuery.trim()
                  ? ` • ${totalEmployees} total employees`
                  : ""}
              </Typography>
            </Box>
          </Box>

          <TableContainer sx={{ backgroundColor: "transparent" }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: textPrimary, fontWeight: 800, borderColor: lineDivider, fontSize: "14px" }}>ID</TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 800, borderColor: lineDivider, fontSize: "14px" }}>Employee</TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 800, borderColor: lineDivider, fontSize: "14px" }}>Department</TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 800, borderColor: lineDivider, fontSize: "14px" }}>Attendance</TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 800, borderColor: lineDivider, fontSize: "14px" }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: textPrimary, fontWeight: 800, borderColor: lineDivider, fontSize: "14px" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((emp, index) => (
                  <TableRow
                    key={emp.id}
                    sx={{
                      transition: "backgroundColor 0.2s ease",
                      "&:hover": { backgroundColor: darkMode ? "rgba(6,182,212,0.12)" : "rgba(224,242,254,0.6)" },
                    }}
                  >
                    <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider }}>#{index + 1}</TableCell>
                    <TableCell sx={{ borderColor: lineDivider }}>
                      <Box display="flex" alignItems="center" gap={1.8}>
                        <Avatar
  src={getImageUrl(emp.profile_pic)}
  alt={emp.name}
  sx={{
    width: 42,
    height: 42,
    border: "2px solid #06B6D4",
  }}
>
  {emp.name?.charAt(0)}
</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="800" sx={{ color: textPrimary, fontSize: "14px" }}>
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>
                               {emp.designation}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: lineDivider }}>
                      <Typography variant="body2" fontWeight="700" sx={{ color: textPrimary }}>{emp.department}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: lineDivider }}>
                      <Typography variant="body2" fontWeight="800" sx={{ color: "#10B981" }}>{emp.attendance}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: lineDivider }}>
                      <Chip
  label={emp.status === 1 ? "Active" : "Inactive"}
  size="small"
  sx={{
    fontSize: "11px",
    fontWeight: 800,
    borderRadius: "10px",
    backgroundColor:
      emp.status === 1
        ? "rgba(16, 185, 129, 0.15)"
        : "rgba(239, 68, 68, 0.15)",
    color:
      emp.status === 1
        ? "#10B981"
        : "#EF4444",
  }}
/>

                    </TableCell>
                    <TableCell align="right" sx={{ borderColor: lineDivider }}>
                      <IconButton
  size="small"
  sx={{ color: textSecondary, mr: 1 }}
  onClick={() => handleEditClick(emp.id)}
>
  <EditIcon fontSize="small" />
</IconButton>
                      <IconButton size="small" onClick={() => handleDeleteEmployee(emp.id)} sx={{ color: "#F87171" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 7, borderColor: lineDivider }} />

        {/* 3 DISTINCTLY STYLED BOTTOM WIDGETS WITH COMPLETELY DIFFERENT UI STRUCTURES */}
        <Typography variant="h5" fontWeight="900" sx={{ color: textPrimary, mb: 4, fontSize: "24px" }}>
          Workforce Insights & Execution
        </Typography>

        <Box
          sx={{
            mb: 6,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 5,
            alignItems: "stretch",
          }}
        >
          {/* STRUCTURE 1: RECENT HIRES FEED — AMBIENT CAPSULE HERO SHOWCASE */}
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 400,
                p: 3.5,
                borderRadius: "32px",
                background: darkMode
                  ? "linear-gradient(145deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.5) 100%)"
                  : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.7) 100%)",
                border: "2px solid rgba(6,182,212,0.3)",
                boxShadow: "0 12px 35px rgba(6, 182, 212, 0.12)",
                height: "100%",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                "&:hover": { borderColor: "#06B6D4", boxShadow: "0 16px 40px rgba(6, 182, 212, 0.25)" },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 50,
                      height: 40,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                    }}
                  >
                    <GroupsIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, fontSize: "18px" }}>
                    Recent Hires
                  </Typography>
                </Box>
                <Chip label="Live Feed" size="small" sx={{mb:2, backgroundColor: "rgba(6,182,212,0.15)", color: "#06B6D4", fontWeight: 800 }} />
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                {[...employeeStatsSource]
                  .sort(
                    (a, b) =>
                      getEmployeeCreatedTime(b) -
                      getEmployeeCreatedTime(a)
                  )
                  .slice(0, 3)
                  .map((hire, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 300,
                      mt:2,
                      p: 2,
                      borderRadius: "22px",
                      backgroundColor: darkMode ? "rgba(30,41,59,0.7)" : "rgba(240,249,255,0.9)",
                      borderLeft: "6px solid #06B6D4",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateX(8px)",
                        backgroundColor: darkMode ? "rgba(6,182,212,0.2)" : "#E0F2FE",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1.8}>
                        <Avatar src={getImageUrl(hire.profile_pic)} alt={hire.name} sx={{ width: 44, height: 44, border: "2px solid #06B6D4" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="800" sx={{ color: textPrimary, fontSize: "14px" }}>
                            {hire.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>
                           {hire.designation} 
                          </Typography>
                        </Box>
                      </Box>
<Chip
  label={`ID: ${hire.id}`}
  size="small"
  sx={{
    fontWeight: 800,
    fontSize: "11px",
    backgroundColor: "#06B6D420",
    color: "#06B6D4",
  }}
/>                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* STRUCTURE 2: UPCOMING EVENTS — OPEN DASHED TIMELINE TREE (NO REPETITIVE BOX!) */}
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                 width: 400,
                p: 3.5,
                pl: 4,
                borderRadius: "32px",
                borderLeft: "4px dashed #0284C7",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: "rgba(2,132,199,0.15)", color: "#0284C7", width: 40, height: 40 }}>
                    <EventAvailableIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, fontSize: "18px" }}>
                    Upcoming Timeline
                  </Typography>
                </Box>
                <Chip label="Scheduled" size="small" sx={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 800 }} />
              </Box>

              <Box display="flex" flexDirection="column" gap={2.5}>
               {meetings.map((meeting, i) => {
  const colors = ["#0284C7", "#10B981", "#F59E0B"];
  const eventColor = colors[i % colors.length];

  return (
    <Box
      key={meeting.id || i}
      onClick={() => openMeeting(meeting)}
      sx={{
        position: "relative",
        p: 2,
        mt: 6,
        px: 2.5,
        borderRadius: "18px",
        backgroundColor: darkMode
          ? "rgba(15,23,42,0.8)"
          : "rgba(255,255,255,0.85)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        border: `1px solid ${lineDivider}`,
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: eventColor,
          boxShadow: `0 10px 25px ${eventColor}35`,
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: eventColor,
              boxShadow: `0 0 12px ${eventColor}`,
            }}
          />

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="800"
              sx={{ color: textPrimary, fontSize: "14px" }}
            >
              {meeting.title}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: textSecondary, fontWeight: 600 }}
            >
              {meeting.meeting_time}
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          variant="contained"
          onClick={(event) => {
            event.stopPropagation();
            openMeeting(meeting);
          }}
          sx={{
            mt: 1.5,
            textTransform: "none",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 800,
            backgroundColor: eventColor,
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: eventColor,
              filter: "brightness(0.92)",
            },
          }}
        >
          {meeting.platform || "Google Meet"}
        </Button>
      </Box>
    </Box>
  );
})}

                  
              </Box>
            </Box>
          </Box>

         {/* STRUCTURE 3: SPRINT VELOCITY — BACKEND CONNECTED */}
<Box sx={{ minWidth: 0  , mt:2, }}>
  <Box
    sx={{
      
      width: 400,
      p: 3.5,
      borderRadius: "32px",
      background:
        "linear-gradient(135deg, #0284C7 0%, #0369A1 60%, #075985 100%)",
      color: "#FFFFFF",
      boxShadow: "0 16px 40px rgba(2, 132, 199, 0.35)",
      height: "100%",
      boxSizing: "border-box",
    }}
  >
    <Box>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              
              width: 40,
              height: 40,
              borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ElectricBoltIcon
              sx={{
                color: "#FFFFFF",
                fontSize: 24,
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight="900"
              sx={{
                              color: "#FFFFFF",
                fontSize: "18px",
              }}
            >
              Sprint Velocity
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Backend performance
            </Typography>
          </Box>
        </Box>

        <Chip
          label={
            performanceData.length > 0
              ? performanceData[0].velocity
              : "Loading..."
          }
          size="small"
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#FFFFFF",
            fontWeight: 800,
          }}
        />
      </Box>

      {/* PERFORMANCE RECORDS */}
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
      >
        {performanceData.map((item) => {
          const velocity = parseFloat(item.velocity);

          return (
            <Box
              key={item.id}
              onClick={() => handlePerformanceClick(item)}
              sx={{
                mt: 2,
                p: 2,
                cursor: "pointer",
                borderRadius: "18px",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="800"
                  sx={{
                    color: "#FFFFFF",
                  }}
                >
                  {item.timeframe}
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight="900"
                  sx={{
                    color: "#FFFFFF",
                  }}
                >
                  {velocity}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={velocity}
                sx={{
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#6EE7B7",
                    borderRadius: 5,
                  },
                }}
              />

              <Box
                display="flex"
                justifyContent="space-between"
                mt={1.2}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {item.quality}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {item.tasks}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  color: "#BAE6FD",
                  fontWeight: 700,
                }}
              >
                {item.trend}
              </Typography>
            </Box>
          );
        })}

        {selectedPerformance && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: "18px",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <Typography
              fontWeight="900"
              sx={{ color: "#FFFFFF", mb: 0.5 }}
            >
              {selectedPerformance.timeframe}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "#FFFFFF" }}
            >
              Velocity: {selectedPerformance.velocity || 0}%
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Quality: {selectedPerformance.quality || "-"}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Tasks: {selectedPerformance.tasks || "-"}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "#BAE6FD", fontWeight: 700 }}
            >
              Trend: {selectedPerformance.trend || "-"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>

    {/* FOOTER */}
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      pt={2.5}
      mt={2.5}
      sx={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}
    >
      <Typography
        variant="caption"
        fontWeight="800"
        sx={{
          color: "#E0F2FE",
        }}
      >
        Live backend performance
      </Typography>

      <CheckCircleIcon
        sx={{
          color: "#6EE7B7",
          fontSize: 24,
        }}
      />
    </Box>
  </Box>
</Box>
        </Box>

        {/* FOOTER MAIL BROADCAST BUTTON */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            mt: 6,
            mb: 4,
            textAlign: "center",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<EmailIcon sx={{ fontSize: 22 }} />}
            onClick={() => setMailDialogOpen(true)}
            sx={{
              borderRadius: "18px",
              background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 800,
              fontSize: "16px",
              px: 5,
              py: 1.8,
              mb: 2,
              boxShadow: "0 8px 25px rgba(6, 182, 212, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 30px rgba(6, 182, 212, 0.5)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Send Mail Announcement
          </Button>
          <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
            © 2026 Employee Management System  •  Enterprise Workspace
          </Typography>
        </Box>
      </Box>

      {/* ADD NEW EMPLOYEE DIALOG MODAL */}
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
            {editMode ? "Edit Employee" : "Add New Employee"}
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
                placeholder="e.g. Rahul Verma"
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

            {/* FIELD 2: DEPARTMENT */}
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

            
            {/* FIELD 3: DESIGNATION */}
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
    DESIGNATION
  </Typography>

  <TextField
    placeholder="e.g. Software Engineer"
    fullWidth
    value={newEmpDesignation}
    onChange={(e) => setNewEmpDesignation(e.target.value)}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
        color: textPrimary,
        height: "52px",
      },
    }}
  />
</Box>

<Box>
  <Typography
    variant="subtitle2"
    fontWeight="800"
    sx={{
      mt: 2,
      mb: 1,
      color: textPrimary,
      fontSize: "13px",
    }}
  >
    ATTENDANCE
  </Typography>

  <FormControl fullWidth>
    <Select
      value={newEmpAttendance}
      onChange={(e) => setNewEmpAttendance(e.target.value)}
      sx={{
        borderRadius: "16px",
        backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
        color: textPrimary,
      }}
    >
      <MenuItem value="Present">Present</MenuItem>
      <MenuItem value="Absent">Absent</MenuItem>
      <MenuItem value="On Leave">On Leave</MenuItem>
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
  onClick={editMode ? handleUpdateEmployee : handleAddEmployee}
  sx={{
    borderRadius: "14px",
    background: "#06B6D4",
    textTransform: "none",
    fontWeight: 800,
    px: 3.5,
    py: 1.2,
  }}
>
  {editMode ? "Update Employee" : "Create Employee Record"}
</Button>
        </DialogActions>
      </Dialog>

    
      <Dialog
  open={meetingDialogOpen}
  onClose={() => {
    if (!creatingMeeting) {
      setMeetingDialogOpen(false);
    }
  }}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: "24px",
      p: 1,
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: 900,
      fontSize: "22px",
    }}
  >
    Schedule Google Meet
  </DialogTitle>

  <DialogContent>

    <TextField
      fullWidth
      label="Meeting Title"
      value={meetingTitle}
      onChange={(e) => setMeetingTitle(e.target.value)}
      sx={{ mb: 2 }}
    />

    <TextField
      fullWidth
      type="date"
      label="Meeting Date"
      value={meetingDate}
      onChange={(e) => setMeetingDate(e.target.value)}
      InputLabelProps={{
        shrink: true,
      }}
      sx={{ mb: 2 }}
    />

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        type="time"
        label="Start Time"
        value={meetingStartTime}
        onChange={(e) =>
          setMeetingStartTime(e.target.value)
        }
        InputLabelProps={{
          shrink: true,
        }}
      />

      <TextField
        type="time"
        label="End Time"
        value={meetingEndTime}
        onChange={(e) =>
          setMeetingEndTime(e.target.value)
        }
        InputLabelProps={{
          shrink: true,
        }}
      />
    </Box>

    <Typography
      sx={{
        fontWeight: 800,
        mb: 1,
      }}
    >
      Select Employees
    </Typography>

    <Box
      sx={{
        maxHeight: 240,
        overflowY: "auto",
        border: "1px solid #B6D9EA",
        borderRadius: "12px",
        p: 1,
      }}
    >
      {allEmployees
        .filter((employee) => employee.email)
        .map((employee) => {
          const id = Number(employee.id);

          return (
            <Box
              key={employee.id}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                borderRadius: "8px",
              }}
            >
              <Checkbox
                checked={selectedMeetingEmployeeIds.includes(id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMeetingEmployeeIds((prev) => [
                      ...prev,
                      id,
                    ]);
                  } else {
                    setSelectedMeetingEmployeeIds((prev) =>
                      prev.filter(
                        (selectedId) => selectedId !== id
                      )
                    );
                  }
                }}
              />

              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  {employee.name}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748B",
                  }}
                >
                  {employee.email}
                </Typography>
              </Box>
            </Box>
          );
        })}
    </Box>

    <Typography
      sx={{
        mt: 1,
        color: "#0284C7",
        fontWeight: 700,
        fontSize: "13px",
      }}
    >
      {selectedMeetingEmployeeIds.length} employee(s) selected
    </Typography>

  </DialogContent>

  <DialogActions sx={{ p: 2 }}>
    <Button
      onClick={() => setMeetingDialogOpen(false)}
      disabled={creatingMeeting}
    >
      CANCEL
    </Button>

    <Button
      variant="contained"
      onClick={handleCreateMeeting}
      disabled={creatingMeeting}
      sx={{
        borderRadius: "14px",
        background:
          "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
        fontWeight: 800,
        textTransform: "none",
      }}
    >
      {creatingMeeting
        ? "Creating..."
        : "Create Google Meet"}
    </Button>
  </DialogActions>
</Dialog>


      {/* SEND MAIL ANNOUNCEMENT DIALOG */}
<Dialog
  open={mailDialogOpen}
  onClose={() => {
    if (!sendingMail) {
      setMailDialogOpen(false);
    }
  }}
  PaperProps={{
    sx: {
      borderRadius: "24px",
      p: 1,
      width: "100%",
      maxWidth: "600px",
      backgroundColor: darkMode
        ? "#0F172A"
        : "#FFFFFF",
      color: textPrimary,
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: 900,
      fontSize: "22px",
      color: textPrimary,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    Send Mail Announcement

    <IconButton
      disabled={sendingMail}
      onClick={() => {
        setMailDialogOpen(false);
      }}
      sx={{ color: textSecondary }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent
    sx={{
      pt: "16px !important",
    }}
  >

    {/* DESCRIPTION */}
    <Typography
      variant="body2"
      sx={{
        color: textSecondary,
        mb: 2,
        fontWeight: 600,
      }}
    >
      Select the employees who should receive this announcement.
    </Typography>


    {/* SELECT EMPLOYEES */}
    <Typography
      sx={{
        fontWeight: 800,
        fontSize: "15px",
        mb: 1,
        color: textPrimary,
      }}
    >
      Select Employees
    </Typography>


    {/* EMPLOYEE LIST */}
    <Box
      sx={{
        maxHeight: 220,
        overflowY: "auto",
        border: `1px solid ${lineDivider}`,
        borderRadius: "16px",
        p: 1,
        mb: 1.5,
        backgroundColor: darkMode
          ? "rgba(30,41,59,0.7)"
          : "#F8FCFF",
      }}
    >

      {allEmployees
        .filter(
          (employee) =>
            employee.email &&
            employee.email.trim() !== ""
        )
        .map((employee) => {
          const employeeId = Number(employee.id);

          const isSelected =
            selectedEmployeeIds.includes(employeeId);

          return (
            <Box
              key={employee.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1,
                py: 0.8,
                borderRadius: "12px",

                backgroundColor: isSelected
                  ? darkMode
                    ? "rgba(6,182,212,0.15)"
                    : "rgba(6,182,212,0.10)"
                  : "transparent",

                "&:hover": {
                  backgroundColor: darkMode
                    ? "rgba(6,182,212,0.12)"
                    : "rgba(224,242,254,0.8)",
                },
              }}
            >

              {/* CHECKBOX */}
              <Checkbox
                checked={isSelected}
                disabled={sendingMail}
                onChange={(event) => {

                  if (event.target.checked) {

                    setSelectedEmployeeIds(
                      (previous) => [
                        ...previous,
                        employeeId,
                      ]
                    );

                  } else {

                    setSelectedEmployeeIds(
                      (previous) =>
                        previous.filter(
                          (id) =>
                            id !== employeeId
                        )
                    );

                  }

                }}
                sx={{
                  color: "#06B6D4",

                  "&.Mui-checked": {
                    color: "#0284C7",
                  },
                }}
              />


              {/* EMPLOYEE AVATAR */}
              <Avatar
                src={getImageUrl(
                  employee.profile_pic
                )}
                alt={employee.name}
                sx={{
                  width: 38,
                  height: 38,
                  border:
                    "2px solid #06B6D4",
                }}
              >
                {employee.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </Avatar>


              {/* NAME + EMAIL */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "14px",
                    color: textPrimary,
                  }}
                >
                  {employee.name}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: textSecondary,
                  }}
                >
                  {employee.email}
                </Typography>
              </Box>

            </Box>
          );
        })}

    </Box>


    {/* SELECTED COUNT */}
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: 800,
        color: "#0284C7",
        mb: 2.5,
      }}
    >
      {selectedEmployeeIds.length} employee(s) selected
    </Typography>


    {/* SUBJECT */}
    <TextField
      fullWidth
      label="Subject"
      value={mailSubject}
      disabled={sendingMail}
      onChange={(e) =>
        setMailSubject(e.target.value)
      }
      sx={{
        mb: 2.5,

        "& .MuiOutlinedInput-root": {
          borderRadius: "16px",
          backgroundColor: darkMode
            ? "#1E293B"
            : "#F0F9FF",
          color: textPrimary,
        },

        "& .MuiInputLabel-root": {
          color: textSecondary,
        },
      }}
    />


    {/* MESSAGE */}
    <TextField
      fullWidth
      multiline
      minRows={6}
      label="Announcement Message"
      value={mailMessage}
      disabled={sendingMail}
      onChange={(e) =>
        setMailMessage(e.target.value)
      }
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "16px",
          backgroundColor: darkMode
            ? "#1E293B"
            : "#F0F9FF",
          color: textPrimary,
        },

        "& .MuiInputLabel-root": {
          color: textSecondary,
        },
      }}
    />

  </DialogContent>


  {/* BUTTONS */}
  <DialogActions
    sx={{
      p: 2.5,
      pt: 1,
    }}
  >

    <Button
      onClick={() =>
        setMailDialogOpen(false)
      }
      disabled={sendingMail}
      sx={{
        color: textSecondary,
        fontWeight: 700,
      }}
    >
      Cancel
    </Button>


    <Button
      variant="contained"
      startIcon={<EmailIcon />}
      onClick={handleSendAnnouncement}
      disabled={
        sendingMail ||
        selectedEmployeeIds.length === 0
      }
      sx={{
        borderRadius: "14px",
        background:
          "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
        textTransform: "none",
        fontWeight: 800,
        px: 3,
        py: 1.2,

        "&:disabled": {
          opacity: 0.5,
        },
      }}
    >
      {sendingMail
        ? "Sending..."
        : "Send Announcement"}
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

export default Employees;