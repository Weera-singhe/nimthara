import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Papers from "./pages/Papers";
import Price from "./pages/Price";
import Stock from "./pages/Stock";
import Customers from "./pages/Customers";
import Login from "./pages/Login";
import ClientsGTS from "./pages/ClientsGTS";
import Header from "./partials/Header";
import Jobs from "./pages/Jobs";
import Job from "./pages/Job";

import { CHECK_AUTH_API_URL } from "./api/urls";
import axios from "axios";
import "./index.css";

axios.defaults.withCredentials = true;

const App = () => {
  const [user, setUser] = useState({ loggedIn: false, level: 0 });

  useEffect(() => {
    axios
      .get(CHECK_AUTH_API_URL, {
        withCredentials: true,
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser({ loggedIn: false, level: 0 }));
  }, []);
  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route
          path="/papers"
          element={<Papers user={user} setUser={setUser} />}
        />
        <Route path="/price" element={<Price user={user} />} />
        <Route path="/stock" element={<Stock user={user} />} />
        <Route path="/cus" element={<Customers user={user} />} />
        <Route path="/gts/clients" element={<ClientsGTS user={user} />} />

        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/add" element={<Job user={user} />} />
        <Route path="jobs/:id" element={<Job user={user} />} />

        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
