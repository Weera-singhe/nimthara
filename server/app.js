const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

// passport config MUST still be loaded
require("./Auth/passport");

const jobsRoutes = require("./routes/jobs.routes");
const docRoutes = require("./routes/doc.routes");
const authRoutes = require("./routes/auth.routes");
const estiRoutes = require("./routes/esti.routes");
const papersRoutes = require("./routes/papers.routes");
// ================================
// CHANGED HERE: request timing log (dev only)
// ================================

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://nimthara.com", "https://www.nimthara.com"]
      : ["http://localhost:3000"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.set("trust proxy", 1);

const isProd = process.env.NODE_ENV === "production";

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: isProd,

    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "lax" : "lax",
      domain: isProd ? ".nimthara.com" : undefined,
      path: "/",
      maxAge: 1000 * 60 * 60 * 4,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/jobs", jobsRoutes);
app.use("/papers", papersRoutes);
app.use("/esti", estiRoutes);
app.use("/doc", docRoutes);
app.use("/auth", authRoutes);

module.exports = app;
