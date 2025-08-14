import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import reactLogo from "../assests/long_logo.png";
import { LOGOUT_API_URL } from "../api/urls";
axios.defaults.withCredentials = true;

export default function Header({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
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
  const links = [
    { path: "/", label: "Home" },
    { path: "/papers", label: "Papers" },
    { path: "/price", label: "Price" },
    { path: "/stock", label: "Stock" },
    { path: "/gts/clients", label: "Clients" },
    { path: "/cus", label: "Customers" },
    { path: "/jobs", label: "Jobs" },
    { path: "/audit", label: "Audit" },
  ];

  if (!user.loggedIn) {
    links.push({ path: "/login", label: "Login" });
  }
  return (
    <header>
      <img src={reactLogo} alt="long_logo" />
      <nav>
        {links.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            style={{
              fontWeight: location.pathname === path ? "bolder" : "lighter",
              textDecoration: "none",
              marginLeft: label === "Login" && "auto",
            }}
          >
            {label}
          </Link>
        ))}

        {user.loggedIn && (
          <div className="log_area">
            <b>
              <b>{user.display_name}</b>
            </b>

            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>
    </header>
  );
}
