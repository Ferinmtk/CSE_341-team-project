require("dotenv").config();
const express = require('express');
const connectDB = require("./data/database");
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
// const passport = require('passport');
const { swaggerUi, swaggerSpec } = require('./swagger');
const studentRoutes = require('./routes/studentRoutes');
// const playerRoutes = require('./routes/playerRoutes');
// const authRoutes = require('./routes/authRoutes');
const routes = require('./routes/index');

const port = process.env.PORT || 3000;

// Middleware to enforce authentication
// const ensureAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.status(401).json({ error: "Access denied. Log in first." });
// };

app.use(bodyParser.json());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/", routes);
app.use('/student', studentRoutes);
// app.use('/player',  ensureAuthenticated, playerRoutes);
// app.use("/auth", authRoutes);


connectDB().then(() => {
//   require("./config/passport"); // Load Passport after DB connection
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  });
}).catch(err => {
  console.error("Failed to connect to the database", err);
});