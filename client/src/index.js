import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
//import Price from "./pages/Price";
import Papers from "./pages/Papers";
//import Stock from "./pages/Stock";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/papers" element={<Papers />} />
    </Routes>
  </BrowserRouter>
);
