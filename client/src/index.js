import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Papers from "./pages/Papers";
import Price from "./pages/Price";
import Stock from "./pages/Stock";
import Quotation from "./pages/Quotation";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/papers" element={<Papers />} />
      <Route path="/price" element={<Price />} />
      <Route path="/stock" element={<Stock />} />
      <Route path="/quotation" element={<Quotation />} />
    </Routes>
  </BrowserRouter>
);
