import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  USER_REGISTER_API_URL,
  USER_LOGIN_API_URL,
  CHECK_AUTH_API_URL,
} from "../api/urls";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

axios.defaults.withCredentials = true;

export default function Login({ user, setUser }) {
  const navigate = useNavigate();

  // 0 = Login, 1 = Register/Change PW
  const [tab, setTab] = useState(0);

  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });

  const [regDetails, setRegDetails] = useState({
    display_name: "",
    regname: "",
    pwr: "",
    pwrr: "",
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formInfo, setFormInfo] = useState("");

  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegPw2, setShowRegPw2] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({
      withCredentials: true,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return instance;
  }, []);

  const pwMatches = regDetails.pwr === regDetails.pwrr;

  const setSafeMessage = (msg) => {
    // Keep messages generic to avoid account enumeration hints
    setFormError(msg || "Something went wrong. Please try again.");
  };

  const changedLogDetails = (e) => {
    const { name, value } = e.target;
    setLoginDetails((p) => ({ ...p, [name]: value }));
  };

  const changedRegDetails = (e) => {
    const { name, value } = e.target;
    setRegDetails((p) => ({ ...p, [name]: value }));
  };

  const validateLogin = () => {
    if (!loginDetails.username.trim() || !loginDetails.password) {
      setFormError("Please enter username and password.");
      return false;
    }
    return true;
  };

  const validateRegister = () => {
    if (!regDetails.display_name.trim()) {
      setFormError("Please enter your name.");
      return false;
    }
    if (!regDetails.regname.trim()) {
      setFormError("Please enter a username.");
      return false;
    }
    if (regDetails.pwr.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return false;
    }
    if (!pwMatches) {
      setFormError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const userLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormInfo("");

    if (!validateLogin()) return;

    setLoading(true);
    try {
      const res = await api.post(USER_LOGIN_API_URL, {
        username: loginDetails.username.trim(),
        password: loginDetails.password,
      });

      if (res?.data?.success) {
        // Fetch auth state after login (cookie-based)
        const authRes = await api.get(CHECK_AUTH_API_URL);
        setUser(authRes.data);

        // SPA navigation
        navigate("/", { replace: true });
      } else {
        setSafeMessage(
          "Login failed. Please check your details and try again."
        );
      }
    } catch (err) {
      setSafeMessage("Login failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const userRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormInfo("");

    if (!validateRegister()) return;

    setLoading(true);
    try {
      const res = await api.post(USER_REGISTER_API_URL, {
        display_name: regDetails.display_name.trim(),
        regname: regDetails.regname.trim(),
        pwr: regDetails.pwr,
        pwrr: regDetails.pwrr,
      });

      // Show server message but still keep UI safe/generic if needed
      setFormInfo(res?.data?.message || "Request completed.");
      setTab(0);
      setRegDetails({ display_name: "", regname: "", pwr: "", pwrr: "" });
    } catch (err) {
      setSafeMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.loggedIn) return null;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 6 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Login or create an account
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setFormError("");
            setFormInfo("");
          }}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label="Login" />
          <Tab label="Register / Change" />
        </Tabs>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        {formInfo && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {formInfo}
          </Alert>
        )}

        {tab === 0 ? (
          <Box component="form" onSubmit={userLogin} noValidate>
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  label="Username"
                  name="username"
                  value={loginDetails.username}
                  onChange={changedLogDetails}
                  fullWidth
                  autoComplete="username"
                  inputProps={{ maxLength: 64 }}
                  disabled={loading}
                />
              </Grid>

              <Grid>
                <TextField
                  label="Password"
                  name="password"
                  type={showLoginPw ? "text" : "password"}
                  value={loginDetails.password}
                  onChange={changedLogDetails}
                  fullWidth
                  autoComplete="current-password"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowLoginPw((s) => !s)}
                          edge="end"
                        >
                          {showLoginPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box component="form" onSubmit={userRegister} noValidate>
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  label="Name"
                  name="display_name"
                  value={regDetails.display_name}
                  onChange={changedRegDetails}
                  fullWidth
                  autoComplete="name"
                  inputProps={{ maxLength: 80 }}
                  disabled={loading}
                />
              </Grid>

              <Grid>
                <TextField
                  label="Username"
                  name="regname"
                  value={regDetails.regname}
                  onChange={changedRegDetails}
                  fullWidth
                  autoComplete="username"
                  inputProps={{ maxLength: 64 }}
                  disabled={loading}
                />
              </Grid>

              <Grid>
                <TextField
                  label="New Password"
                  name="pwr"
                  type={showRegPw ? "text" : "password"}
                  value={regDetails.pwr}
                  onChange={changedRegDetails}
                  fullWidth
                  autoComplete="new-password"
                  disabled={loading}
                  helperText="Use 8+ characters (preferably a passphrase)."
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowRegPw((s) => !s)}
                          edge="end"
                        >
                          {showRegPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid>
                <TextField
                  label="Repeat Password"
                  name="pwrr"
                  type={showRegPw2 ? "text" : "password"}
                  value={regDetails.pwrr}
                  onChange={changedRegDetails}
                  fullWidth
                  autoComplete="new-password"
                  disabled={loading}
                  error={Boolean(regDetails.pwrr) && !pwMatches}
                  helperText={
                    Boolean(regDetails.pwrr) && !pwMatches
                      ? "Passwords do not match."
                      : " "
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowRegPw2((s) => !s)}
                          edge="end"
                        >
                          {showRegPw2 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || !pwMatches}
                  startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
