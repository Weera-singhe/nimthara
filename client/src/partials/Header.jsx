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
      setUser({ loggedIn: false, level: 0 });
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
    { path: "/cus", label: "Customers" },
    { path: "/quotation", label: "Quotation" },
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
              marginRight: "1rem",
              textDecoration: "none",
            }}
          >
            {label}
          </Link>
        ))}

        {user.loggedIn && (
          <div style={{ marginLeft: "10rem" }}>
            <b>
              {" "}
              <b>{user.display_name}</b>
            </b>

            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>
    </header>
  );
}
