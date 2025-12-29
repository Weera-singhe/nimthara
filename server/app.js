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
// ================================
// CHANGED HERE: request timing log (dev only)
// ================================

const app = express();

// const corsOptions = {
//   origin:
//     process.env.NODE_ENV === "production"
//       ? ["https://nimthara.com", "https://www.nimthara.com"]
//       : ["http://localhost:3000"],
//   credentials: true,
// };
const corsOptions = {
  origin: true, // 👈 allow any origin temporarily
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const t0 = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - t0;
      console.log(
        `${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
      );
    });
    next();
  });
}

app.set("trust proxy", 1);

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/jobs", jobsRoutes);
app.use("/esti", estiRoutes); //new
app.use("/doc", docRoutes);
app.use("/auth", authRoutes);

module.exports = app;
