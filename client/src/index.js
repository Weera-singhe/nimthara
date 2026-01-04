import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PapersHome from "./pages/Papers/PapersHome";
import PaperPrice from "./pages/Papers/PaperPrice";
import Stock from "./pages/Papers/Stock";
import Customers from "./pages/Customers";
import Login from "./pages/Login";
import ClientsGTS from "./pages/Papers/ClientsGTS";
import MyAppBar from "./partials/MyAppBar";
import JobsHome from "./pages/JOBS/JobsHome";
import JobFile from "./pages/JOBS/JobFile";
import JobJob from "./pages/JOBS/JobJob";
import Audit from "./pages/Audit/Audit";
import BidBond from "./pages/Audit/BidBond";
import Ledger from "./pages/Audit/Ledger";
import ProtectedRoute from "./helpers/ProtectedRoute";
import Button from "@mui/material/Button";
import { AUTH_API_URL } from "./api/urls";
import axios from "axios";
import "./index.css";
import Box from "@mui/material/Box";
import Esti from "./pages/Esti/Esti";
import PaperLog from "./pages/Papers/PaperLog";

axios.defaults.withCredentials = true;

const INITIAL_USER = {
  loggedIn: null,
  level: 0,
  level_jobs: 0,
  level_paper: 0,
  level_audit: 0,
};
const App = () => {
  const [user, setUser] = useState(INITIAL_USER);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    axios
      .get(`${AUTH_API_URL}/check-auth`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser({ ...INITIAL_USER, loggedIn: false }))
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <Box sx={{ p: 2 }}>
        <Button loading loadingPosition="end">
          Loading...
        </Button>
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <MyAppBar user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Home user={user} />} />{" "}
        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />}
        />
        <Route path="/papers" element={<PapersHome user={user} />} />
        <Route
          path="papers/price/:id"
          element={
            <ProtectedRoute user={user}>
              <PaperPrice user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="papers/price"
          element={
            <ProtectedRoute user={user}>
              <PaperPrice user={user} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="papers/log/:id"
          element={
            <ProtectedRoute user={user}>
              <PaperLog user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="papers/log"
          element={
            <ProtectedRoute user={user}>
              <PaperLog user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute user={user}>
              <JobsHome user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/file/new"
          element={
            <ProtectedRoute user={user}>
              <JobFile user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/file/:fileid"
          element={
            <ProtectedRoute user={user}>
              <JobFile user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/job/:fileid/:jobindex"
          element={
            <ProtectedRoute user={user}>
              <JobJob user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/esti/:linkid/:linkat"
          element={
            <ProtectedRoute user={user}>
              <Esti user={user} />
            </ProtectedRoute>
          }
        />
        {/* /////////////////////////////////////////////////////// */}
        <Route path="/stock" element={<Stock user={user} />} />
        <Route path="/cus" element={<Customers user={user} />} />
        <Route path="/gts/clients" element={<ClientsGTS user={user} />} />
        <Route
          path="audit"
          element={
            <ProtectedRoute user={user}>
              <Audit user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="audit/bb" element={<BidBond user={user} />} />
        <Route path="audit/ledger" element={<Ledger user={user} />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
