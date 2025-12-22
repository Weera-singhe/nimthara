import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LOGOUT_API_URL } from "../api/urls";

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
import LongLogo from "../assests/long_logo.svg";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const pages = ["Paper", "Audit", "Customers", "Jobs"];

export default function MyAppBar({ user, setUser }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(LOGOUT_API_URL, {}, { withCredentials: true });
      setUser({
        loggedIn: false,
        level: 0,
        level_jobs: 0,
        level_paper: 0,
        level_audit: 0,
      });
      navigate("/login");
    } catch {
      alert("Logout failed");
    }
  };

  const handleLoginLogout = () => {
    if (user?.loggedIn) {
      handleLogout();
    } else {
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "white",
        borderRadius: 4,
        overflow: "hidden",
        mb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component={Link}
            to="/"
            id="pc_logo"
            sx={{
              display: { xs: "none", md: "none", lg: "flex" },
              my: 3,
              mr: 3,
            }}
          >
            <img src={LongLogo} alt="Logo" style={{ height: 40 }} />
          </Box>

          <Box
            id="mob_menu"
            sx={{ display: { xs: "flex", md: "flex", lg: "none" } }}
          >
            <IconButton size="large" onClick={handleOpenNavMenu} color="black">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
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
                >
                  <Typography sx={{ textAlign: "center", color: "black" }}>
                    {page}
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
              m: 3,
              justifyContent: "center",
            }}
          >
            <img src={LongLogo} alt="Logo" />
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
                sx={{ mx: 2, color: "black", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
            <Typography
              variant="button"
              sx={{
                display: { xs: "none", md: "none", lg: "flex" },
                maxWidth: 70,
                overflow: "hidden",
              }}
              color="success"
            >
              {user.loggedIn && (user?.display_name || "")}
            </Typography>
            <IconButton
              onClick={handleLoginLogout}
              color={user.loggedIn ? "error" : "primary"}
            >
              {user.loggedIn ? <LogoutRoundedIcon /> : <LoginRoundedIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
