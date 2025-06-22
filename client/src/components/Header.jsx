import React from "react";
import { Link } from "react-router-dom";
import reactLogo from "../assests/long_logo.png";

export default function Header() {
  return (
    <header>
      <img src={reactLogo} alt="long_logo" />
      <nav>
        <Link to="/">Home</Link>
        <Link to="/papers">Papers</Link>
      </nav>
    </header>
  );
}
