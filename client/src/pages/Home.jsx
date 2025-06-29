import React from "react";
import Header from "../partials/Header";

export default function Welcome() {
  return (
    <>
      <Header />
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Welcome to Nimthara</h1>
      </div>
    </>
  );
}
