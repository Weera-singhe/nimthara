import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AUTH_API_URL } from "../api/urls";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import LongLogo from "../assests/long_logo.png";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const pages = ["papers", "audit", "customers", "records", "jobs"];

export default function MyAppBar({ user, setUser }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const api = React.useMemo(() => {
    return axios.create({
      baseURL: AUTH_API_URL,
      withCredentials: true,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });
  }, []);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (page) => {
    const base = `/${page}`;
    return (
      location.pathname === base || location.pathname.startsWith(`${base}/`)
    );
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      setUser({
        loggedIn: false,
        level: 0,
        level_jobs: 0,
        level_paper: 0,
        level_audit: 0,
        level_stock: 0,
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err?.message);
    }
  };

  const handleLoginLogout = () => {
    handleCloseNavMenu();
    if (user?.loggedIn) handleLogout();
    else navigate("/login");
  };

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "white", borderRadius: 2, overflow: "hidden", mb: 3 }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component={Link}
            to="/"
            id="pc_logo"
            sx={{
              display: { xs: "none", md: "none", lg: "flex" },
              my: 2,
              mr: 2,
            }}
          >
            <img src={LongLogo} alt="Logo" style={{ height: 40 }} />
          </Box>

          <Box
            id="mob_menu"
            sx={{ display: { xs: "flex", md: "flex", lg: "none" } }}
          >
            <IconButton
              size="small"
              onClick={handleOpenNavMenu}
              color="black"
              sx={{ p: 0, m: 0 }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "block", lg: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  component={Link}
                  to={`/${page}`}
                  onClick={handleCloseNavMenu}
                  sx={{
                    bgcolor: isActive(page) ? "action.selected" : "inherit",
                  }}
                >
                  <Typography sx={{ textAlign: "center", color: "black" }}>
                    {page.toUpperCase()}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            component={Link}
            to="/"
            id="mob_logo"
            sx={{
              display: { xs: "flex", md: "flex", lg: "none" },
              flexGrow: 1,
              minWidth: 0,
              justifyContent: "center",
              mx: 3,
            }}
          >
            <img
              src={LongLogo}
              alt="Logo"
              style={{
                width: "100%",
                maxWidth: 300,
                height: "auto",
                maxHeight: 30,
                objectFit: "contain",
              }}
            />
          </Box>

          <Box
            id="pc_menu"
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "none", lg: "flex" },
            }}
          >
            {pages.map((page) => (
              <Button
                component={Link}
                to={`/${page}`}
                key={page}
                onClick={handleCloseNavMenu}
                sx={{
                  mx: 2,
                  color: "black",
                  display: "block",
                  fontWeight: isActive(page) ? "bold" : "normal",
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box
            sx={{
              flexGrow: 0,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="button"
              sx={{
                display: { xs: "none", md: "none", lg: "flex" },
                maxWidth: 70,
                overflow: "hidden",
              }}
              color="success"
            >
              {user?.loggedIn && (user?.display_name || "")}
            </Typography>

            <IconButton
              onClick={handleLoginLogout}
              color={user?.loggedIn ? "error" : "primary"}
            >
              {user?.loggedIn ? <LogoutRoundedIcon /> : <LoginRoundedIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
