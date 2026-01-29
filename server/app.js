const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const rateLimit = require("express-rate-limit");

const pgSession = require("connect-pg-simple")(session);
const pool = require("./Db/pool");

require("./Auth/passport");

const jobsRoutes = require("./routes/jobs.routes");
const recordsRoutes = require("./routes/records.routes");
const docRoutes = require("./routes/doc.routes");
const authRoutes = require("./routes/auth.routes");
const estiRoutes = require("./routes/esti.routes");
const papersRoutes = require("./routes/papers.routes");

const app = express();

const isProd = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProd
    ? ["https://nimthara.com", "https://www.nimthara.com"]
    : ["http://localhost:3000"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "1mb" }));

app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: isProd,

    store: isProd
      ? new pgSession({
          pool,
          tableName: "user_sessions",
          createTableIfMissing: true,
        })
      : undefined,

    rolling: true,
    unset: "destroy",

    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      domain: isProd ? ".nimthara.com" : undefined,
      path: "/",
      maxAge: 1000 * 60 * 60 * 4,
    },
  }),
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth/login", loginLimiter);

app.use(passport.initialize());
app.use(passport.session());

app.use("/jobs", jobsRoutes);
app.use("/records", recordsRoutes);
app.use("/papers", papersRoutes);
app.use("/esti", estiRoutes);
app.use("/doc", docRoutes);
app.use("/auth", authRoutes);

module.exports = app;
