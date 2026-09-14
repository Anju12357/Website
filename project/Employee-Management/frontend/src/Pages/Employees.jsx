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
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { canUser } from "../rolePermissionResolver";


function Employees() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [permissionVersion, setPermissionVersion] = useState(0);

  // Centralized permission check.
  // A matching role saved in User Roles is authoritative; backend permissions
  // are used only when no matching saved role exists.
  const can = useCallback(
    (permission) => canUser(user, permission),
    [user, permissionVersion]
  );

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

  // ADD EMPLOYEE MODAL STATE
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("");
  const [newEmpJoiningDate, setNewEmpJoiningDate] = useState("");
  const [newEmpDesignation, setNewEmpDesignation] = useState("");
  const [newEmpAttendance, setNewEmpAttendance] = useState("Present");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // EMPLOYEE PROFILE + DATABASE ATTENDANCE
  const [profileEmployee, setProfileEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Current time is updated outside render so React Compiler can keep
  // the component render pure.
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatClockTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatWorkDuration = (record) => {
    if (!record?.clock_in) return "0h 0m";

    const start = new Date(record.clock_in).getTime();
    const end = record.clock_out
      ? new Date(record.clock_out).getTime()
      : currentTime;

    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      return "0h 0m";
    }

    const totalMinutes = Math.floor((end - start) / 60000);
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  };

  const getAttendanceRecord = (employeeId) =>
    attendanceRecords[String(employeeId)] || null;

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

    return `https://website-v1t1.onrender.com${value.startsWith("/") ? "" : "/"}${value}`;
  };

const fetchEmployees = useCallback(async (search = "") => {
  try {
    const query = search.trim();

    // Always load the complete employee list from the backend first.
    // This keeps the real employee count independent from search results.
    if (!query) {
      const response = await axios.post(
        "https://website-v1t1.onrender.com/webservices/users/get-all-users",
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
      "https://website-v1t1.onrender.com/webservices/users/search-users",
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

const fetchNotifications = useCallback(async () => {
  try {
    setNotificationLoading(true);

    const response = await axios.get(
      "https://website-v1t1.onrender.com/notifications",
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
}, [getEmployeeCreatedTime]);

const handleNotificationClick = async (notification) => {
   if (!can("notifications.view")) {
    setToastMessage("You do not have permission to view notifications.");
    return;
  }

  try {
    if (Number(notification?.is_read) === 0 && notification?.id) {
      await axios.post(
        "https://website-v1t1.onrender.com/notifications/read",
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


const fetchPerformance = useCallback(async () => {
  try {
    const response = await axios.get(
      "https://website-v1t1.onrender.com/dashboard/performance",
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
}, []);

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
  if (!can("employees.meeting.view")) {
    setToastMessage(
      "You do not have permission to view meetings."
    );
    return;
  }
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

const fetchMeetings = useCallback(async () => {
  try {
    const response = await axios.get(
      "https://website-v1t1.onrender.com/meetings",
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
}, []);


const meetingsWithValidParticipants = meetings.map((meeting) => {
  const validParticipants = (meeting.participants || [])
    .map((participant) => {
      const participantEmail = String(
        participant.email || ""
      ).trim().toLowerCase();

      const participantEmployeeId =
        participant.employee_id ??
        participant.user_id;

      const employee = allEmployees.find((emp) => {
        const employeeEmail = String(
          emp.email || ""
        ).trim().toLowerCase();

        return (
          (participantEmployeeId &&
            Number(emp.id) === Number(participantEmployeeId)) ||
          (participantEmail &&
            employeeEmail === participantEmail)
        );
      });

      // Employee was deleted -> remove participant
      if (!employee) {
        return null;
      }

      // Use current employee data
      return {
        ...participant,
        id: employee.id,
        name: employee.name,
        email: employee.email,
      };
    })
    .filter(Boolean);

  return {
    ...meeting,
    participants: validParticipants,
  };
});

const fetchAttendance = useCallback(async () => {
  try {
    setAttendanceLoading(true);

    const response = await axios.get(
      "https://website-v1t1.onrender.com/attendance/today",
      {
        withCredentials: true,
      }
    );

    console.log("========== ATTENDANCE RESPONSE ==========");
    console.log("STATUS:", response.status);
    console.log("DATA:", response.data);
    console.log("==========================================");

    if (response.data?.status === 1) {
      const nextRecords = {};

      (response.data.data || []).forEach((record) => {
        console.log("ATTENDANCE RECORD:", record);

        nextRecords[String(record.employee_id)] = record;
      });

      console.log("ATTENDANCE RECORDS MAP:", nextRecords);

      setAttendanceRecords(nextRecords);
    } else {
      setAttendanceRecords({});
    }
  } catch (error) {
    console.error(
      "EMPLOYEE ATTENDANCE FETCH ERROR:",
      error?.response?.status,
      error?.response?.data || error.message
    );

    setAttendanceRecords({});
  } finally {
    setAttendanceLoading(false);
  }
}, []);

const fetchUser = useCallback(async () => {
  try {
    const response = await axios.get(
      "https://website-v1t1.onrender.com/auth/me",
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
}, []);

useEffect(() => {
  fetchUser();
}, [fetchUser]);

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

useEffect(() => {
  if (!user) return;

  const loadEmployeesPage = async () => {
    if (can("employees.view")) {
      await fetchEmployees();
    }

    if (can("employees.performance.view")) {
      await fetchPerformance();
    }

    if (can("employees.meeting.view")) {
      await fetchMeetings();
    }

    if (can("notifications.view")) {
      await fetchNotifications();
    }

    // Attendance is loaded after the employee list so the attendance
    // records are ready when the table renders.
    if (can("employees.attendance.view")) {
      await fetchAttendance();
    }
  };

  loadEmployeesPage();
}, [
  user,
  fetchEmployees,
  fetchPerformance,
  fetchMeetings,
  fetchNotifications,
  fetchAttendance,
  permissionVersion,
]);

// Refresh attendance whenever the Employees page becomes active again.
// This is useful when an employee clocks in/out from the Profile page
// and then returns to the Employees page.
useEffect(() => {
  const refreshAttendance = () => {
    if (document.visibilityState !== "visible") return;
    if (!user) return;
    if (!can("employees.attendance.view")) return;

    fetchAttendance();
  };

  window.addEventListener("focus", refreshAttendance);
  document.addEventListener("visibilitychange", refreshAttendance);

  return () => {
    window.removeEventListener("focus", refreshAttendance);
    document.removeEventListener("visibilitychange", refreshAttendance);
  };
}, [user, permissionVersion, fetchAttendance]);

useEffect(() => {
  if (!user) return;
  if (!can("employees.view")) return;

  if (!can("employees.search")) {
    setSearchQuery("");
    return;
  }

  const timer = setTimeout(() => {
    fetchEmployees(searchQuery);
  }, 300);

  return () => clearTimeout(timer);
}, [user, searchQuery, fetchEmployees, permissionVersion]);

const unreadCount = notifications.filter(
  (notification) => Number(notification?.is_read) === 0
).length;


  const handleEditClick = async (id) => {
    if (!can("employees.edit")) {
  setToastMessage("You do not have permission to edit employees.");
  return;
}
  try {
    const response = await axios.post(
      "https://website-v1t1.onrender.com/webservices/users/get-user-by-id",
      { id },
      {
        withCredentials: true,
      }
    );

    if (response.data.status === 1) {
      const emp = response.data.data;

      setEditingEmployee(emp);

      setNewEmpName(emp.name);
      setNewEmpRole(emp.role || "");
      setNewEmpDept(emp.department || "");
      setNewEmpJoiningDate(
        emp.joining_date || emp.joiningDate || emp.joined_date || emp.joinedDate || ""
      );
      setNewEmpDesignation(emp.designation || "");
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
  if (!can("employees.create")) {
  setToastMessage("You do not have permission to add employees.");
  return;
}
  if (!newEmpName) {
    setToastMessage("Please enter employee name.");
    return;
  }

  try {
    const response = await axios.post(
      "https://website-v1t1.onrender.com/webservices/users/add-users",
     {
  name: newEmpName,
  email: `${newEmpName.toLowerCase().replace(/\s/g, "")}@gmail.com`,
  password: "123456",
  role: newEmpRole,
  user_type: 3,
  profile_pic: "",
  cover_pic: "",                                                                                       
  department: newEmpDept || null,
  joining_date: newEmpJoiningDate || null,
  joined_date: newEmpJoiningDate || null,
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
      setNewEmpJoiningDate("");
      setNewEmpDesignation("");
setNewEmpRole("");

      await fetchEmployees();   // Refresh table + backend statistics
      await fetchAttendance();
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
    if (!can("employees.edit")) {
    setToastMessage("You do not have permission to edit employees.");
    return;
  }

  try {
    const response = await axios.post(
      "https://website-v1t1.onrender.com/webservices/users/update-user",
      {
        id: editingEmployee.id,
        name: newEmpName,
        email: editingEmployee.email,
        role: newEmpRole,
        department: newEmpDept || null,
        joining_date: newEmpJoiningDate || null,
        joined_date: newEmpJoiningDate || null,
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
    
  // OPEN EMPLOYEE PROFILE
  const handleViewProfile = (employee) => {
    if (!can("employees.view")) {
      setToastMessage("You do not have permission to view employees.");
      return;
    }
    setProfileEmployee(employee);
  };

  // DELETE EMPLOYEE HANDLER
  const handleDeleteEmployee = async (id) => {
    if (!can("employees.delete")) {
  setToastMessage("You do not have permission to delete employees.");
  return;
}
  try {
    const response = await axios.post(
      "https://website-v1t1.onrender.com/webservices/users/delete-user",
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

  // SEND MAIL ANNOUNCEMENT TO SELECTED EMPLOYEES

  const handleSendAnnouncement = async () => {
  if (!can("employees.email")) {
    setToastMessage(
      "You do not have permission to send announcements."
    );
    return;
  }

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
      "https://website-v1t1.onrender.com/webservices/mail/send-announcement",
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
  if (!can("employees.meeting.create")) {
  setToastMessage("You do not have permission to create meetings.");
  return;
}
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
      "https://website-v1t1.onrender.com/meetings/create",
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
    activeFilter === "All" || (emp.department || "") === activeFilter;

  return matchesDepartment;
});


  // EXACT MATCHING DASHBOARD COLOR THEME TOKENS
  const bgPageGradient = darkMode
    ? "radial-gradient(circle at 12% 0%, rgba(37,99,235,.16), transparent 30%), linear-gradient(135deg, #070B14 0%, #0F172A 52%, #111827 100%)"
    : "radial-gradient(circle at 85% 0%, rgba(96,165,250,.18), transparent 26%), linear-gradient(135deg, #DCEBFA 0%, #EAF2FA 45%, #E4ECF8 100%)";

  const bgSidebarGradient = darkMode
    ? "linear-gradient(180deg, #0B1220 0%, #111C33 55%, #070B14 100%)"
    : "linear-gradient(180deg, #111D3A 0%, #172554 58%, #0F172A 100%)";

  const textPrimary = darkMode ? "#F8FAFC" : "#172033";
  const textSecondary = darkMode ? "#A8B4C7" : "#64748B";
  const lineDivider = darkMode ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.08)";

  // Streamlined Sidebar Menu List
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

const visibleSidebarItems = sidebarItems.filter(
  (item) => can(item.permission)
);


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

  if (user && !can("employees.view")) {
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
            You do not have permission to view Employees.
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
  navigate(item.path);
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


      {/* MAIN DASHBOARD CONTENT AREA
          Sidebar is fixed at 250px. The content starts after the full
          sidebar width, so no dashboard content can overlap it. */}
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
        {/* TOP NAVIGATION HEADER BAR - SEARCH ON LEFT / ACTIONS ON SAME HORIZONTAL ROW ON RIGHT */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 3.5,
          }}
        >
          {/* SEARCH BAR (TOP LEFT) */}
          {can("employees.search") && (
            <TextField
              placeholder="Search team members, departments, or roles..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
              width: { xs: 240, sm: 360, md: 420 },
              "& .MuiOutlinedInput-root": {
                height: 48,
                borderRadius: "24px",
                backgroundColor: darkMode ? "rgba(15,23,42,.72)" : "rgba(255,255,255,.82)",
                backdropFilter: "blur(12px)",
                color: textPrimary,
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(37, 99, 235, 0.08)",
                transition: "all 0.3s ease",
                "& fieldset": { borderColor: lineDivider },
                "&:hover fieldset": { borderColor: "#2563EB" },
                "&.Mui-focused fieldset": { borderColor: "#2563EB", boxShadow: "0 0 16px rgba(37, 99, 235, 0.35)" },
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
          )}


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


        {/* HERO TITLE BANNER */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: "28px",
            background: darkMode
              ? "linear-gradient(120deg, #182B58 0%, #334EAA 48%, #101B38 100%)"
              : "linear-gradient(120deg, #B8C8FF 0%, #C9D6FF 45%, #B9D8F5 100%)",
            border: darkMode
              ? "1px solid rgba(255,255,255,.10)"
              : "1px solid rgba(255,255,255,.75)",
            boxShadow: darkMode
              ? "0 24px 55px rgba(0,0,0,.24)"
              : "0 24px 55px rgba(48,75,130,.18)",
          }}
        >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h3" fontWeight="900" sx={{ color: darkMode ? "#FFFFFF" : "#10234B", letterSpacing: "-0.045em", fontSize: { xs: 29, md: 40 } }}>
              Workforce Roster Directory
            </Typography>
            <Typography variant="body1" sx={{ color: darkMode ? "rgba(255,255,255,.76)" : "#47648F", mt: 1, fontSize: "14px", lineHeight: 1.7 }}>
              Manage active employees, department allocations, and productivity benchmarks
            </Typography>
          </Box>

          <Box display="flex" gap={1.5} flexWrap="wrap" justifyContent="flex-end">
            {can("employees.meeting.create") && (
  <Button
    variant="contained"
    startIcon={<VideoCallIcon />}
    onClick={() => {
                setMeetingTitle("");
                setMeetingDate("");
                setMeetingStartTime("");
                setMeetingEndTime("");
                setSelectedMeetingEmployeeIds([]);
                setMeetingDialogOpen(true);
              }}
              sx={{
                mt: 2,
                mb: 3,
                borderRadius: "18px",
                background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                color: "#FFFFFF",
                px: 3.5,
                py: 1.4,
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(22, 163, 74, 0.35)",
                transition: "all 0.25s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #15803D 0%, #166534 100%)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Google Meet
            </Button>
            )}
            {can("employees.create") && (
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => {
      setEditMode(false);
      setEditingEmployee(null);
      setAddModalOpen(true);
    }}
            sx={{
              ml:6,
              mt:2,
              mb:3,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
              color: "#FFFFFF",
              px: 3.5,
              py: 1.4,
              fontWeight: 800,
              fontSize: "14px",
              textTransform: "none",
              boxShadow: "0 10px 26px rgba(37,99,235,.24)",
              transition: "all 0.25s ease",
              "&:hover": { background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)", transform: "translateY(-2px)" },
            }}
          >
            Add New Employee
          </Button>
            )}
          </Box>
        </Box>
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
            gap: 1.75,
          }}
        >
          {[
  {
    title: "Total Employees",
    value: totalEmployees.toString(),
    sub: "Active workforce",
    color: "#2563EB",
    icon: <GroupsIcon sx={{ fontSize: 26 }} />,
    permission: "dashboard.stats",
  },
  {
    title: "Active Departments",
    value: `${totalDepartments} Teams`,
    sub: "From employee records",
    color: "#10B981",
    icon: <WorkspacesIcon sx={{ fontSize: 26 }} />,
    permission: "dashboard.stats",
  },
  {
    title: "Attendance Rate",
    value: `${attendanceRate}%`,
    sub: `${presentEmployees} present today`,
    color: "#F59E0B",
    icon: <EventAvailableIcon sx={{ fontSize: 26 }} />,
    permission: "employees.attendance.view",
  },
  {
  title: "Productivity Index",
  value: `${productivityIndex}%`,
  sub: "Based on 3 Months performance",
  color: "#3B82F6",
  icon: <TrendingUpIcon sx={{ fontSize: 26 }} />,
  permission: "employees.performance.view",
},
].filter((st) => !st.permission || can(st.permission)).map((st) => (
            <Box key={st.title}>
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  py: 2.25,
                  px: 2.5,
                  minHeight: 132,
                  borderRadius: "24px",
                  border: `1px solid ${st.color}35`,
                  background: darkMode
                    ? "linear-gradient(145deg, rgba(15,23,42,.92), rgba(30,41,59,.72))"
                    : st.color === "#2563EB"
                    ? "linear-gradient(135deg, #F5F9FF 0%, #E6F0FF 100%)"
                    : st.color === "#10B981"
                    ? "linear-gradient(135deg, #F2FFFA 0%, #DDF8EE 100%)"
                    : st.color === "#F59E0B"
                    ? "linear-gradient(135deg, #FFFCF4 0%, #FFF0D4 100%)"
                    : "linear-gradient(135deg, #FBF7FF 0%, #EEE5FF 100%)",
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
                  <Typography variant="body2" fontWeight="800" sx={{ color: textSecondary, fontSize: "13px" }}>
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
                <Typography variant="h4" fontWeight="900" sx={{ color: textPrimary, my: 1 }}>
                  {st.value}
                </Typography>
                <Chip label={st.sub} size="small" sx={{ fontWeight: 800, fontSize: "11px", backgroundColor: `${st.color}20`, color: st.color }} />
              </Box>
            </Box>
          ))}
        </Box>

        {/* DEPARTMENT FILTER CHIPS */}
        <Box mb={2.75} display="flex" gap={1} flexWrap="wrap">
          {["All", "Engineering", "UI/UX Design", "Operations", "Human Resources"].map((dept) => (
            <Chip
              key={dept}
              label={dept}
              clickable
              onClick={() => setActiveFilter(dept)}
              sx={{
                fontWeight: 800,
                fontSize: "12px",
                px: 2.1,
                py: 1.75,
                borderRadius: "999px",
                backgroundColor: activeFilter === dept ? "#2563EB" : darkMode ? "rgba(30,41,59,0.7)" : "rgba(224,242,254,0.8)",
                color: activeFilter === dept ? "#FFFFFF" : textPrimary,
                boxShadow: activeFilter === dept ? "0 6px 20px rgba(37,99,235,0.45)" : "none",
                transition: "all 0.25s ease",
                 "&:hover": {
                   backgroundColor: activeFilter === dept ? "#1D4ED8" : (darkMode ? "rgba(59,130,246,.16)" : "rgba(219,234,254,.85)"),
                   color: activeFilter === dept ? "#FFFFFF" : "#2563EB",
                   transform: "translateY(-2px)",
                 },
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

          <TableContainer
            sx={{
              borderRadius: "24px",
              overflow: "hidden",
              background: darkMode
                ? "rgba(10,18,35,.72)"
                : "rgba(248,251,255,.88)",
              border: darkMode
                ? "1px solid rgba(148,163,184,.12)"
                : "1px solid rgba(148,163,184,.18)",
              boxShadow: darkMode
                ? "0 22px 50px rgba(0,0,0,.20)"
                : "0 18px 42px rgba(30,64,175,.08)",
              backdropFilter: "blur(16px)",
            }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>ID</TableCell>
                  <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Employee</TableCell>
                  <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Department</TableCell>
                  <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Joining Date</TableCell>
                  {can("employees.attendance.view") && (
                    <>
                      <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Work Status</TableCell>
                      <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Clock In</TableCell>
                      <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Clock Out</TableCell>
                      <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Total</TableCell>
                    </>
                  )}
                  <TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider, fontSize: "10px", letterSpacing: ".09em", textTransform: "uppercase" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    sx={{
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: darkMode ? "rgba(59,130,246,.10)" : "rgba(239,246,255,.72)",
                      },
                    }}
                  >
<TableCell sx={{ color: textSecondary, fontWeight: 800, borderColor: lineDivider }}>
  #{emp.id}
</TableCell>

                    <TableCell sx={{ borderColor: lineDivider }}>
                      <Box display="flex" alignItems="center" gap={1.8}>
                        <Avatar
  src={getImageUrl(emp.profile_pic)}
  alt={emp.name}
  sx={{
    width: 40,
    height: 40,
    border: "2px solid rgba(59,130,246,.28)",
    boxShadow: "0 5px 14px rgba(37,99,235,.12)",
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
                      <Typography variant="body2" fontWeight="700" sx={{ color: textPrimary }}>
                        {emp.department || "Not Assigned"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: lineDivider }}>
                      <Typography variant="body2" fontWeight="700" sx={{ color: textSecondary }}>
                        {emp.joining_date || emp.joiningDate || emp.joined_date || emp.joinedDate || "Not Available"}
                      </Typography>
                    </TableCell>
                    {can("employees.attendance.view") && (
                      <>
                        <TableCell sx={{ borderColor: lineDivider }}>
                          {(() => {
                            const record = getAttendanceRecord(emp.id);
                            const workStatus = record?.clock_out
                              ? "Completed"
                              : record?.clock_in
                                ? "Working"
                                : "Not Clocked In";
                            const statusColor = record?.clock_out
                              ? "#2563EB"
                              : record?.clock_in
                                ? "#10B981"
                                : "#64748B";
                            return (
                              <Typography variant="body2" fontWeight="800" sx={{ color: statusColor }}>
                                {attendanceLoading ? "Loading..." : workStatus}
                              </Typography>
                            );
                          })()}
                        </TableCell>
                        <TableCell sx={{ borderColor: lineDivider, color: textPrimary, fontWeight: 700 }}>
                          {formatClockTime(getAttendanceRecord(emp.id)?.clock_in)}
                        </TableCell>
                        <TableCell sx={{ borderColor: lineDivider, color: textPrimary, fontWeight: 700 }}>
                          {formatClockTime(getAttendanceRecord(emp.id)?.clock_out)}
                        </TableCell>
                        <TableCell sx={{ borderColor: lineDivider, color: textPrimary, fontWeight: 700 }}>
                          {formatWorkDuration(getAttendanceRecord(emp.id))}
                        </TableCell>
                      </>
                    )}
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

{/*
  mobile_number, phone_number, contact_number.
*/}

                    <Tooltip title="View Profile">
  <IconButton
    size="small"
    sx={{ color: "#2563EB", mr: 1 }}
    onClick={() => handleViewProfile(emp)}
  >
    <VisibilityIcon fontSize="small" />
  </IconButton>
</Tooltip>

{can("employees.edit") && (
  <IconButton
    size="small"
    sx={{ color: textSecondary, mr: 1 }}
    onClick={() => handleEditClick(emp.id)}
  >
    <EditIcon fontSize="small" />
  </IconButton>
)}

{can("employees.delete") && (
  <IconButton
    size="small"
    onClick={() => handleDeleteEmployee(emp.id)}
    sx={{ color: "#F87171" }}
  >
    <DeleteIcon fontSize="small" />
  </IconButton>
)}


                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {(can("employees.view.recent.hires") || can("employees.meeting.view") || can("employees.performance.view")) && (
          <>
            <Divider sx={{ my: 7, borderColor: lineDivider }} />
            <Typography variant="h5" fontWeight="900" sx={{ color: textPrimary, mb: 4, fontSize: "24px" }}>
              Workforce Insights & Execution
            </Typography>
          </>
        )}

        {(can("employees.view.recent.hires") || can("employees.meeting.view") || can("employees.performance.view")) && (
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
          {can("employees.view.recent.hires") && (
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 400,
                p: 3.5,
                borderRadius: "32px",
                background: darkMode
                  ? "linear-gradient(145deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.5) 100%)"
                  : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.7) 100%)",
                border: "2px solid rgba(37,99,235,0.3)",
                boxShadow: "0 12px 35px rgba(37, 99, 235, 0.12)",
                height: "100%",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                "&:hover": { borderColor: "#2563EB", boxShadow: "0 16px 40px rgba(37, 99, 235, 0.25)" },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box
                            display="flex"
                            alignItems="center"
                            gap={1.5}
                            sx={{ minWidth: 190 }}
                          >
                  <Box
                    sx={{
                      width: 50,
                      height: 40,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
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
                <Chip label="Live Feed" size="small" sx={{mb:2, backgroundColor: "rgba(37,99,235,0.15)", color: "#2563EB", fontWeight: 800 }} />
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
                      mt:5,
                      p: 2,
                      borderRadius: "22px",
                      backgroundColor: darkMode ? "rgba(30,41,59,0.7)" : "rgba(240,249,255,0.9)",
                      borderLeft: "6px solid #2563EB",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateX(8px)",
                        backgroundColor: darkMode ? "rgba(37,99,235,0.2)" : "#E0F2FE",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1.8}>
                        <Avatar src={getImageUrl(hire.profile_pic)} alt={hire.name} sx={{ width: 44, height: 44, border: "2px solid #2563EB" }} />
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
    backgroundColor: "#2563EB20",
    color: "#2563EB",
  }}
/>                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          )}

          {/* STRUCTURE 2: UPCOMING EVENTS — OPEN DASHED TIMELINE TREE (NO REPETITIVE BOX!) */}
          {can("employees.meeting.view") && (
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                 width: 400,
                p: 3.5,
                pl: 4,
                borderRadius: "32px",
                borderLeft: "4px dashed #1D4ED8",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: "rgba(2,132,199,0.15)", color: "#1D4ED8", width: 40, height: 40 }}>
                    <EventAvailableIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="900" sx={{ color: textPrimary, fontSize: "18px" }}>
                    Upcoming Timeline
                  </Typography>
                </Box>
                <Chip label="Scheduled" size="small" sx={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 800 }} />
              </Box>

              <Box display="flex" flexDirection="column" gap={2.5}>
              {[...meetingsWithValidParticipants]
  .sort((a, b) => Number(b.id) - Number(a.id))
  .slice(0, 2)
  .map((meeting, i) => {

  const colors = ["#1D4ED8", "#10B981", "#F59E0B"];
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


                {/* MEETING PARTICIPANTS */}
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: `1px solid ${lineDivider}`,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ mb: 1 }}
          >
            <GroupsIcon
              sx={{
                fontSize: 18,
                color: eventColor,
              }}
            />

            <Typography
              variant="caption"
              sx={{
                color: textPrimary,
                fontWeight: 800,
                fontSize: "12px",
              }}
            >
              Participants ({meeting.participants?.length || 0})
            </Typography>
          </Box>

          {meeting.participants?.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {meeting.participants.map((participant) => (
                <Box
                  key={participant.id || participant.email}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    p: 1,
                    borderRadius: "10px",
                    backgroundColor: darkMode
                      ? "rgba(30,41,59,0.6)"
                      : "rgba(240,249,255,0.8)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: "12px",
                        backgroundColor: eventColor,
                      }}
                    >
{participant.name?.charAt(0)?.toUpperCase()}


                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: textPrimary,
                          fontSize: "12px",
                          fontWeight: 800,
                        }}
                      >
                        {participant.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: textSecondary,
                          fontSize: "10px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {participant.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={
                      participant.response_status === "accepted"
                        ? "Accepted"
                        : participant.response_status === "declined"
                        ? "Declined"
                        : "Pending"
                    }
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "9px",
                      fontWeight: 800,
                      backgroundColor:
                        participant.response_status === "accepted"
                          ? "rgba(16,185,129,0.15)"
                          : participant.response_status === "declined"
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(245,158,11,0.15)",
                      color:
                        participant.response_status === "accepted"
                          ? "#10B981"
                          : participant.response_status === "declined"
                          ? "#EF4444"
                          : "#F59E0B",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: textSecondary,
                fontSize: "11px",
              }}
            >
              No participants selected
            </Typography>
          )}
        </Box>


      </Box>
    </Box>
  );
})}

                  
              </Box>
            </Box>
          </Box>
          )}

         {/* STRUCTURE 3: SPRINT VELOCITY — BACKEND CONNECTED */}
{can("employees.performance.view") && (
<Box sx={{ minWidth: 0  , mt:2, }}>
  <Box
    sx={{
      
      width: 400,
      p: 3.5,
      borderRadius: "32px",
      background:
        "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 60%, #075985 100%)",
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
                mt:2,
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
)}
        </Box>
        )}

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
          {can("employees.email") && (
          <Button
            variant="contained"
            size="large"
            startIcon={<EmailIcon sx={{ fontSize: 22 }} />}
            onClick={() => setMailDialogOpen(true)}
            sx={{
              borderRadius: "18px",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 800,
              fontSize: "16px",
              px: 5,
              py: 1.8,
              mb: 2,
              boxShadow: "0 8px 25px rgba(37, 99, 235, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 30px rgba(37, 99, 235, 0.5)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Send Mail Announcement
          </Button>
          )}
          <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
            © 2026 Employee Management System  •  Enterprise Workspace
          </Typography>
        </Box>
      </Box>

      {/* EMPLOYEE PROFILE DIALOG + STAFF TIME MANAGEMENT */}
      <Dialog
        open={Boolean(profileEmployee)}
        onClose={() => setProfileEmployee(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "24px",
            backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
            color: textPrimary,
            overflow: "hidden",
          },
        }}
      >
        {profileEmployee && (() => {
          const record = getAttendanceRecord(profileEmployee.id);
          const timeStatus = record?.clock_out
            ? "Completed"
            : record?.clock_in
              ? "Working"
              : "Not Clocked In";

          return (
            <>
              <DialogTitle sx={{ px: 3.5, pt: 3, pb: 2, color: textPrimary }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={getImageUrl(profileEmployee.profile_pic)}
                      alt={profileEmployee.name}
                      sx={{ width: 60, height: 60, border: "2px solid rgba(59,130,246,.28)" }}
                    >
                      {profileEmployee.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={900}>{profileEmployee.name}</Typography>
                      <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>
                        {profileEmployee.designation || "Employee"}
                        {profileEmployee.department ? ` • ${profileEmployee.department}` : ""}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setProfileEmployee(null)} sx={{ color: textSecondary }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>

              <DialogContent sx={{ px: 3.5, pb: 3.5 }}>
                <Divider sx={{ mb: 3, borderColor: lineDivider }} />

                <Box display="flex" alignItems="center" gap={1.2} mb={1}>
                  <AccessTimeIcon sx={{ color: "#2563EB" }} />
                  <Typography variant="h6" fontWeight={900}>Staff's Time Management</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                  Today's clock-in, clock-out and total working hours.
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {[
                    ["Status", timeStatus],
                    ["Clock In", formatClockTime(record?.clock_in)],
                    ["Clock Out", formatClockTime(record?.clock_out)],
                    ["Total Hours", formatWorkDuration(record)],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        border: `1px solid ${lineDivider}`,
                        backgroundColor: darkMode ? "rgba(30,41,59,.65)" : "#F8FAFC",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 800, textTransform: "uppercase" }}>
                        {label}
                      </Typography>
                      <Typography variant="h6" fontWeight={900} sx={{ color: textPrimary, mt: 0.5 }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: "14px",
                    backgroundColor: darkMode ? "rgba(30,41,59,.55)" : "#F8FAFC",
                    border: `1px solid ${lineDivider}`,
                  }}
                >
                  <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 700 }}>
                    Attendance actions are performed by the employee from their own Profile page.
                  </Typography>
                </Box>
              </DialogContent>
            </>
          );
        })()}
      </Dialog>

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
                    "&:hover fieldset": { borderColor: "#2563EB" },
                  },
                }}
              />
            </Box>

            {/* FIELD 2: DEPARTMENT */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mt: 2, mb: 1, color: textPrimary, fontSize: "13px", letterSpacing: "0.5px" }}>
                DEPARTMENT
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

            
            {/* FIELD 3: JOINING DATE */}
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
                JOINING DATE
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
                    backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
                    color: textPrimary,
                    height: "52px",
                    "& fieldset": { borderColor: lineDivider },
                    "&:hover fieldset": { borderColor: "#2563EB" },
                  },
                }}
              />
            </Box>

            {/* FIELD 4: DESIGNATION */}
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
    background: "#2563EB",
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

    
      {can("employees.meeting.create") && (
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
                borderRadius: "14px",
                 transition: "background .2s ease, transform .2s ease",
                 "&:hover": {
                   backgroundColor: darkMode ? "rgba(59,130,246,.10)" : "#EFF6FF",
                   transform: "translateX(3px)",
                 },
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
        color: "#1D4ED8",
        fontWeight: 700,
        fontSize: "13px",
      }}
    >
      {selectedMeetingEmployeeIds.length} employee(s) selected
    </Typography>

    <Box sx={{ mt: 2, p: 1.5, borderRadius: "12px", backgroundColor: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.18)" }}>
      <Typography sx={{ fontSize: "12px", color: "#166534", fontWeight: 700 }}>
        First-time setup: connect the Google account that will create the calendar meetings.
      </Typography>
      <Button
        size="small"
        startIcon={<VideoCallIcon />}
        onClick={() => {
          window.location.href = "https://website-v1t1.onrender.com/meetings/google/auth";
        }}
        sx={{ mt: 1, textTransform: "none", fontWeight: 800, color: "#15803D" }}
      >
        Connect Google Calendar
      </Button>
    </Box>

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
          "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
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
      )}


      {/* SEND MAIL ANNOUNCEMENT DIALOG */}
{can("employees.email") && (
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
                    ? "rgba(37,99,235,0.15)"
                    : "rgba(37,99,235,0.10)"
                  : "transparent",

                "&:hover": {
                  backgroundColor: darkMode
                    ? "rgba(37,99,235,0.12)"
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
                  color: "#2563EB",

                  "&.Mui-checked": {
                    color: "#1D4ED8",
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
                    "2px solid #2563EB",
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
        color: "#1D4ED8",
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

{can("employees.email") && (
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
          "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
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
)}
  </DialogActions>

</Dialog>
)}


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

