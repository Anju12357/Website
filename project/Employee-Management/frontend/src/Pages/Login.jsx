import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Material UI Core Imports
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Tooltip,
  Avatar,
  Paper,
  Fade,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

// Material UI Icons
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import BusinessIcon from "@mui/icons-material/Business";
import BoltIcon from "@mui/icons-material/Bolt";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AppleIcon from "@mui/icons-material/Apple";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import SpeedIcon from "@mui/icons-material/Speed";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ShieldIcon from "@mui/icons-material/Shield";


import axios from "axios";



// Official Multi-Color Google SVG Icon Component
const GoogleSvgIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: "10px" }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.17 21.32 7.23 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.24c-.25-.72-.38-1.5-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.1 0 9.8 0 12s.43 3.9 1.18 5.4l4.09-3.16z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

// Customer Testimonials Data
const TESTIMONIALS = [
  {
    quote: "EMS transformed our workforce visibility across 14 global offices in under 3 weeks.",
    author: "Elena Rostova",
    title: "VP of Global Operations, TechScale",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    quote: "The automated scheduling and live attendance engine saved us hundreds of HR hours monthly.",
    author: "David Chen",
    title: "Head of People, Nexus Systems",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  },
];

function Login({ darkMode: propDarkMode, toggleDarkMode: propToggleDarkMode }) {
  const navigate = useNavigate();

  // Self-contained Dark/Light Theme state
  const [internalDarkMode, setInternalDarkMode] = useState(true);
  const darkMode = propDarkMode !== undefined ? propDarkMode : internalDarkMode;

  const handleToggleTheme = () => {
    if (propToggleDarkMode) {
      propToggleDarkMode();
    }
    setInternalDarkMode((prev) => !prev);
  };

  // Form State
const [email, setEmail] = useState("");

const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Testimonial State & Auto-rotation Effect
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Modals state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqCompany, setReqCompany] = useState("");
  const [reqDepartment, setReqDepartment] = useState("Engineering");
  const [reqTeamSize, setReqTeamSize] = useState("50-200 employees");

  // Direct Sign In handler
const handleLogin = async (e) => {
  e.preventDefault();

  setErrorMessage("");

  if (!email.trim() || !password.trim()) {
    setErrorMessage("Please enter both email address and password.");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.post(
      "http://localhost:4000/login",
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );

    setLoading(false);

    setToastMessage(response.data.message);

    navigate("/dashboard");

  } catch (error) {
    setLoading(false);

    if (error.response) {
      setErrorMessage(
        error.response.data.error || "Login Failed"
      );
    } else {
      setErrorMessage("Cannot connect to backend.");
    }
  }
};

  // SSO Login Handler
  const handleSSOLogin = (provider) => {
    setLoading(true);
    setToastMessage(`Connecting to ${provider} Enterprise SSO...`);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  // Password Reset Submission
  const handleForgotSubmit = () => {
    if (!resetEmail || !resetEmail.includes("@")) {
      setToastMessage("Please enter a valid email address.");
      return;
    }
    setForgotStep(2);
  };

  // Request Access Submission
  const handleRequestSubmit = () => {
    if (!reqName || !reqEmail || !reqCompany) {
      setToastMessage("Please complete all required fields.");
      return;
    }
    setRequestSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        backgroundColor: darkMode ? "#0B0F19" : "#F8FAFC",
        color: darkMode ? "#F8FAFC" : "#0F172A",
        transition: "background-color 0.3s ease, color 0.3s ease",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* =================================================================== */}
      {/* LEFT SIDE - HERO WITH BACKGROUND IMAGE & GLASS OVERLAY              */}
      {/* =================================================================== */}
      <Box
        sx={{
          width: { xs: "100%", md: "52%", lg: "58%" },
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { xs: 4, sm: 6, md: 7, lg: 9 },
          overflow: "hidden",
          backgroundImage: `url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* POLISHED GRADIENT OVERLAY */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: darkMode
              ? "linear-gradient(135deg, rgba(11, 15, 25, 0.94) 0%, rgba(15, 23, 42, 0.88) 50%, rgba(30, 58, 138, 0.85) 100%)"
              : "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(29, 78, 216, 0.78) 100%)",
            zIndex: 1,
          }}
        />

        {/* TOP BRAND HEADER */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                p: 1.4,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.4)",
              }}
            >
              <BusinessIcon sx={{ fontSize: { xs: 26, md: 32 } }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="800"
                sx={{
                  letterSpacing: 0.5,
                  fontSize: { xs: "20px", md: "24px" },
                  color: "#FFFFFF",
                }}
              >
                EMS <span style={{ color: "#60A5FA", fontWeight: 400 }}>| Enterprise</span>
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", letterSpacing: 0.5, fontWeight: 500 }}>
                Workforce OS v4.2 • Cloud Infrastructure
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<CheckCircleIcon style={{ color: "#10B981", fontSize: "16px" }} />}
            label="Systems Operational"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              color: "#F8FAFC",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontWeight: 600,
              fontSize: "12px",
              display: { xs: "none", sm: "flex" },
            }}
          />
        </Box>

        {/* MIDDLE HERO CONTENT */}
        <Box sx={{ position: "relative", zIndex: 2, my: "auto", py: { xs: 5, md: 7 } }}>
          <Chip
            label="NEXT-GEN WORKFORCE PLATFORM"
            sx={{
              backgroundColor: "rgba(37, 99, 235, 0.3)",
              color: "#93C5FD",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: 1.5,
              mb: 3,
            }}
          />

          <Typography
            variant="h1"
            fontWeight="800"
            sx={{
              fontSize: { xs: "30px", sm: "40px", md: "48px", lg: "54px" },
              lineHeight: 1.15,
              mb: 2.5,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            Smart solutions for{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #60A5FA, #38BDF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              modern workplaces.
            </span>
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "14px", md: "17px" },
              lineHeight: 1.6,
              mb: 5,
              maxWidth: "620px",
              color: "#CBD5E1",
              fontWeight: 400,
            }}
          >
            Streamline workforce management, boost productivity, and keep your global teams seamlessly connected — all in one real-time platform.
          </Typography>

          {/* DYNAMIC METRICS CARDS */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#60A5FA", mb: 0.5 }}>
                <GroupIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8" }}>ACTIVE USERS</Typography>
              </Box>
              <Typography variant="h6" fontWeight="800" sx={{ color: "#FFF" }}>
                148,200+
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#34D399", mb: 0.5 }}>
                <ShieldIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8" }}>SECURITY</Typography>
              </Box>
              <Typography variant="h6" fontWeight="800" sx={{ color: "#FFF" }}>
                SOC2 Type II
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#FBBF24", mb: 0.5 }}>
                <SpeedIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8" }}>LATENCY</Typography>
              </Box>
              <Typography variant="h6" fontWeight="800" sx={{ color: "#FFF" }}>
                &lt; 14ms
              </Typography>
            </Paper>
          </Box>

          {/* TESTIMONIAL CARD */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              position: "relative",
            }}
          >
            <FormatQuoteIcon sx={{ position: "absolute", top: 12, right: 16, fontSize: 36, color: "rgba(255, 255, 255, 0.1)" }} />
            <Typography sx={{ fontSize: "14px", fontStyle: "italic", color: "#E2E8F0", mb: 2, lineHeight: 1.5 }}>
              "{TESTIMONIALS[activeTestimonial]?.quote || TESTIMONIALS[0].quote}"
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  src={TESTIMONIALS[activeTestimonial]?.avatar || TESTIMONIALS[0].avatar}
                  alt={TESTIMONIALS[activeTestimonial]?.author || TESTIMONIALS[0].author}
                  sx={{ width: 36, height: 36, border: "2px solid #60A5FA" }}
                />
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>
                    {TESTIMONIALS[activeTestimonial]?.author || TESTIMONIALS[0].author}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#94A3B8" }}>
                    {TESTIMONIALS[activeTestimonial]?.title || TESTIMONIALS[0].title}
                  </Typography>
                </Box>
              </Box>

              {/* DOT INDICATORS */}
              <Box sx={{ display: "flex", gap: 0.8 }}>
                {TESTIMONIALS.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    sx={{
                      width: activeTestimonial === idx ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: activeTestimonial === idx ? "#60A5FA" : "rgba(255, 255, 255, 0.3)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* BOTTOM FOOTER */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            pt: 3,
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ color: "#E2E8F0", fontSize: "13px" }}>
            🔒 End-to-End Encrypted Session
          </Typography>
          <Typography sx={{ color: "#94A3B8", fontSize: "13px", fontWeight: 600 }}>
            Trusted by 500+ Enterprises
          </Typography>
        </Box>
      </Box>

      {/* =================================================================== */}
      {/* RIGHT SIDE - LOGIN FORM                                            */}
      {/* =================================================================== */}
      <Box
        sx={{
          width: { xs: "100%", md: "48%", lg: "42%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { xs: 4, sm: 6, md: 7, lg: 8 },
          backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
          transition: "background-color 0.3s ease",
          boxShadow: darkMode ? "none" : "-10px 0 30px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* TOP BAR ACTION - THEME SWITCHER TOGGLE */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Chip
            icon={<BoltIcon sx={{ color: "#F59E0B !important" }} />}
            label="EMS Cloud v4.2"
            size="small"
            sx={{
              backgroundColor: darkMode ? "#1E293B" : "#F1F5F9",
              color: darkMode ? "#CBD5E1" : "#475569",
              fontWeight: 600,
              fontSize: "12px",
            }}
          />

          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
              onClick={handleToggleTheme}
              sx={{
                color: darkMode ? "#94A3B8" : "#475569",
                border: darkMode ? "1px solid #334155" : "1px solid #E2E8F0",
                p: 1,
                borderRadius: "10px",
                backgroundColor: darkMode ? "#1E293B" : "#F8FAFC",
                "&:hover": { backgroundColor: darkMode ? "#334155" : "#E2E8F0" },
              }}
            >
              {darkMode ? <LightModeIcon sx={{ fontSize: 20, color: "#FBBF24" }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* LOGIN FORM CONTAINER */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ maxWidth: "440px", width: "100%", mx: "auto", my: "auto" }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              component="span"
              sx={{
                color: "#2563EB",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                display: "block",
                mb: 0.5,
              }}
            >
              WELCOME BACK
            </Typography>

            <Typography
              variant="h4"
              fontWeight="800"
              color={darkMode ? "#F8FAFC" : "#0F172A"}
              sx={{ mb: 1, fontSize: { xs: "26px", md: "30px" }, letterSpacing: "-0.01em" }}
            >
              Sign in to your account
            </Typography>

            <Typography color={darkMode ? "#94A3B8" : "#64748B"} sx={{ fontSize: "14px", lineHeight: 1.5 }}>
              Enter your credentials to access your workspace.
            </Typography>
          </Box>

          {/* ERROR ALERT */}
          {errorMessage && (
            <Fade in={Boolean(errorMessage)}>
              <Alert severity="error" sx={{ mb: 3, fontSize: "13px", borderRadius: "10px" }}>
                {errorMessage}
              </Alert>
            </Fade>
          )}

          {/* EMAIL INPUT */}
          <Box sx={{ mb: 3 }}>
            <Typography
              component="label"
              sx={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: darkMode ? "#E2E8F0" : "#334155",
                mb: 0.8,
              }}
            >
              Email Address
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: darkMode ? "#1E293B" : "#F8FAFC",
                  color: darkMode ? "#F8FAFC" : "#0F172A",
                  fontSize: "15px",
                  height: "52px",
                  "& fieldset": { borderColor: darkMode ? "#334155" : "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#2563EB" },
                  "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "2px" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: darkMode ? "#64748B" : "#94A3B8", fontSize: "20px" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* PASSWORD INPUT WITH INTERACTIVE EYE ICON */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
              <Typography
                component="label"
                sx={{ fontSize: "14px", fontWeight: 600, color: darkMode ? "#E2E8F0" : "#334155" }}
              >
                Password
              </Typography>
              <Typography
                component="span"
                onClick={() => {
                  setForgotStep(1);
                  setResetEmail(email);
                  setForgotOpen(true);
                }}
                sx={{
                  color: "#2563EB",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline", color: "#3B82F6" },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: darkMode ? "#1E293B" : "#F8FAFC",
                  color: darkMode ? "#F8FAFC" : "#0F172A",
                  fontSize: "15px",
                  height: "52px",
                  "& fieldset": { borderColor: darkMode ? "#334155" : "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#2563EB" },
                  "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "2px" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: darkMode ? "#64748B" : "#94A3B8", fontSize: "20px" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        sx={{
                          color: darkMode ? "#94A3B8" : "#64748B",
                          "&:hover": { color: "#2563EB" },
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: "20px" }} />
                        ) : (
                          <Visibility sx={{ fontSize: "20px" }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* REMEMBER ME CHECKBOX */}
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{
                  color: darkMode ? "#475569" : "#94A3B8",
                  "&.Mui-checked": { color: "#2563EB" },
                }}
              />
            }
            label={
              <Typography sx={{ color: darkMode ? "#94A3B8" : "#475569", fontSize: "14px", fontWeight: 500 }}>
                Keep me signed in for 30 days
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          {/* SUBMIT BUTTON */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            endIcon={!loading && <ArrowForwardIcon />}
            sx={{
              height: 52,
              borderRadius: "12px",
              mb: 3,
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.01em",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.5)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign in "}
          </Button>

          {/* OR DIVIDER */}
          <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
            <Divider sx={{ flex: 1, borderColor: darkMode ? "#334155" : "#E2E8F0" }} />
            <Typography
              sx={{
                mx: 2,
                color: darkMode ? "#64748B" : "#94A3B8",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              OR CONTINUE WITH
            </Typography>
            <Divider sx={{ flex: 1, borderColor: darkMode ? "#334155" : "#E2E8F0" }} />
          </Box>

          {/* SSO BUTTONS */}
          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleSSOLogin("Google Workspace")}
              sx={{
                color: darkMode ? "#F8FAFC" : "#334155",
                borderColor: darkMode ? "#334155" : "#CBD5E1",
                textTransform: "none",
                py: 1.2,
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "14px",
                backgroundColor: darkMode ? "#1E293B" : "#FFFFFF",
                "&:hover": {
                  borderColor: "#2563EB",
                  backgroundColor: darkMode ? "#334155" : "#F8FAFC",
                },
              }}
              startIcon={<GoogleSvgIcon />}
            >
              Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleSSOLogin("Apple ID")}
              sx={{
                color: darkMode ? "#F8FAFC" : "#334155",
                borderColor: darkMode ? "#334155" : "#CBD5E1",
                textTransform: "none",
                py: 1.2,
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "14px",
                backgroundColor: darkMode ? "#1E293B" : "#FFFFFF",
                "&:hover": {
                  borderColor: "#2563EB",
                  backgroundColor: darkMode ? "#334155" : "#F8FAFC",
                },
              }}
              startIcon={
                <AppleIcon
                  sx={{
                    fontSize: "20px !important",
                    color: darkMode ? "#FFFFFF" : "#000000",
                  }}
                />
              }
            >
              Apple ID
            </Button>
          </Box>

          {/* REQUEST ACCESS LINK */}
          <Typography textAlign="center" color={darkMode ? "#94A3B8" : "#64748B"} sx={{ fontSize: "14px" }}>
            New to EMS?{" "}
            <Typography
              component="span"
              onClick={() => {
                setRequestSubmitted(false);
                setRequestOpen(true);
              }}
              sx={{
                color: "#2563EB",
                cursor: "pointer",
                fontWeight: 700,
                "&:hover": { textDecoration: "underline", color: "#3B82F6" },
              }}
            >
              Request workspace access
            </Typography>
          </Typography>
        </Box>

        {/* RIGHT FOOTER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: darkMode ? "#64748B" : "#94A3B8",
            fontSize: "13px",
            mt: 4,
            pt: 3,
            borderTop: darkMode ? "1px solid #1E293B" : "1px solid #F1F5F9",
          }}
        >
          <Typography sx={{ fontSize: "13px", color: darkMode ? "#64748B" : "#94A3B8" }}>
            © 2026 EMS Inc. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 2.5 }}>
            <Typography sx={{ fontSize: "13px", cursor: "pointer", "&:hover": { color: "#2563EB" } }}>
              Privacy
            </Typography>
            <Typography sx={{ fontSize: "13px", cursor: "pointer", "&:hover": { color: "#2563EB" } }}>
              Terms
            </Typography>
            <Typography sx={{ fontSize: "13px", cursor: "pointer", "&:hover": { color: "#2563EB" } }}>
              Help
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* =================================================================== */}
      {/* MODAL 1: FORGOT PASSWORD DIALOG                                     */}
      {/* =================================================================== */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            backgroundColor: darkMode ? "#1E293B" : "#FFFFFF",
            color: darkMode ? "#F8FAFC" : "#0F172A",
            minWidth: { xs: "90%", sm: "420px" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "20px", display: "flex", justifyContent: "space-between" }}>
          {forgotStep === 1 ? "Reset your password" : "Instructions Sent"}
          <IconButton onClick={() => setForgotOpen(false)} sx={{ color: darkMode ? "#94A3B8" : "#64748B" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {forgotStep === 1 ? (
            <>
              <Typography sx={{ fontSize: "14px", color: darkMode ? "#94A3B8" : "#64748B", mb: 2.5 }}>
                Enter your email address and we'll send you instructions to reset your account password.
              </Typography>
              <TextField
                autoFocus
                fullWidth
                type="email"
                placeholder="you@company.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: darkMode ? "#0F172A" : "#F8FAFC",
                    color: darkMode ? "#F8FAFC" : "#0F172A",
                  },
                }}
              />
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10B981",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>
                Check Your Email
              </Typography>
              <Typography sx={{ fontSize: "14px", color: darkMode ? "#94A3B8" : "#64748B" }}>
                We have sent a password reset link to <strong>{resetEmail}</strong>.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {forgotStep === 1 ? (
            <>
              <Button onClick={() => setForgotOpen(false)} sx={{ color: darkMode ? "#94A3B8" : "#64748B" }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleForgotSubmit}
                sx={{ borderRadius: "8px", background: "#2563EB", textTransform: "none", fontWeight: 600 }}
              >
                Send Reset Link
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => setForgotOpen(false)}
              sx={{ borderRadius: "8px", background: "#2563EB", textTransform: "none", fontWeight: 600 }}
            >
              Return to Login
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* =================================================================== */}
      {/* MODAL 2: REQUEST ACCESS DIALOG                                      */}
      {/* =================================================================== */}
      <Dialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            backgroundColor: darkMode ? "#1E293B" : "#FFFFFF",
            color: darkMode ? "#F8FAFC" : "#0F172A",
            minWidth: { xs: "90%", sm: "450px" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "20px", display: "flex", justifyContent: "space-between" }}>
          {requestSubmitted ? "Request Submitted" : "Request Workspace Access"}
          <IconButton onClick={() => setRequestOpen(false)} sx={{ color: darkMode ? "#94A3B8" : "#64748B" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {!requestSubmitted ? (
            <>
              <Typography sx={{ fontSize: "14px", color: darkMode ? "#94A3B8" : "#64748B", mb: 3 }}>
                Join your company's EMS workforce portal. Your IT administrator will verify and approve your account.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Full Name *"
                  fullWidth
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <TextField
                  label="Email Address *"
                  fullWidth
                  type="email"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <TextField
                  label="Company / Organization Name *"
                  fullWidth
                  value={reqCompany}
                  onChange={(e) => setReqCompany(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />

                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={reqDepartment}
                    label="Department"
                    onChange={(e) => setReqDepartment(e.target.value)}
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="Engineering">Engineering / IT</MenuItem>
                    <MenuItem value="HR">Human Resources</MenuItem>
                    <MenuItem value="Operations">Operations</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Estimated Team Size</InputLabel>
                  <Select
                    value={reqTeamSize}
                    label="Estimated Team Size"
                    onChange={(e) => setReqTeamSize(e.target.value)}
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="10-50 employees">10-50 employees</MenuItem>
                    <MenuItem value="50-200 employees">50-200 employees</MenuItem>
                    <MenuItem value="200-1000 employees">200-1000 employees</MenuItem>
                    <MenuItem value="1000+ Enterprise">1000+ Enterprise</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mx: "auto",
                  mb: 2,
                  backgroundColor: "rgba(37, 99, 235, 0.15)",
                  color: "#2563EB",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 36 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>
                Access Request Pending
              </Typography>
              <Typography sx={{ fontSize: "14px", color: darkMode ? "#94A3B8" : "#64748B" }}>
                Thank you, <strong>{reqName}</strong>! An administrator at <strong>{reqCompany}</strong> will review your request shortly.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {!requestSubmitted ? (
            <>
              <Button onClick={() => setRequestOpen(false)} sx={{ color: darkMode ? "#94A3B8" : "#64748B" }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleRequestSubmit}
                sx={{ borderRadius: "8px", background: "#2563EB", textTransform: "none", fontWeight: 600 }}
              >
                Submit Request
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => setRequestOpen(false)}
              sx={{ borderRadius: "8px", background: "#2563EB", textTransform: "none", fontWeight: 600 }}
            >
              Done
            </Button>
          )}
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

export default Login;