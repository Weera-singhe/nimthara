import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PapersHome from "./pages/Papers/PapersHome";
import PaperPrice from "./pages/Papers/PaperPrice";
import Login from "./pages/Login";
import MyAppBar from "./partials/MyAppBar";
import JobsHome from "./pages/JOBS/JobsHome";
import JobFile from "./pages/JOBS/JobFile";
import JobJob from "./pages/JOBS/JobJob";
import Audit from "./pages/Audit/Audit";
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

  const authApi = useMemo(() => {
    return axios.create({
      baseURL: AUTH_API_URL,
      withCredentials: true,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });
  }, []);

  useEffect(() => {
    authApi
      .get("/check-auth")
      .then((res) => setUser(res.data))
      .catch(() => setUser({ ...INITIAL_USER, loggedIn: false }))
      .finally(() => setAuthChecked(true));
  }, [authApi]);

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
        <Route path="/" element={<Home user={user} />} />
        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />}
        />

        <Route path="/papers" element={<PapersHome user={user} />} />
        <Route path="/papers/:bsns" element={<PapersHome user={user} />} />

        <Route
          path="papers/:bsns/price/:id"
          element={
            <ProtectedRoute user={user}>
              <PaperPrice user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="papers/:bsns/price"
          element={
            <ProtectedRoute user={user}>
              <PaperPrice user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="papers/:bsns/log/:id"
          element={
            <ProtectedRoute user={user}>
              <PaperLog user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="papers/:bsns/log"
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

        <Route
          path="audit"
          element={
            <ProtectedRoute user={user}>
              <Audit user={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
