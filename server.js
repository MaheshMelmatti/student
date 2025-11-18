const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const session = require("express-session");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ SESSION SETUP
app.use(
  session({
    secret: "secretkey123",
    resave: false,
    saveUninitialized: false,
  })
);

// ⭐ SERVE STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// ⭐ CONNECT TO MONGODB
mongoose
  .connect("mongodb://127.0.0.1:27017/myappdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

// ⭐ USER SCHEMA
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// ⭐ COURSE SCHEMA
const courseSchema = new mongoose.Schema({
  studentName: String,
  studentID: String,
  courseName: String,
  courseID: String,
  email: String, // to identify student courses
});
const Course = mongoose.model("Course", courseSchema);

// ⭐ REGISTER ROUTE
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashed,
    });

    res.send(`
      <script>
        alert("Registration Successful!");
        window.location.href = "/login.html";
      </script>
    `);
  } catch (err) {
    res.send("Error: " + err);
  }
});

// ⭐ LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.send(`
        <script>
          alert("User not found!");
          window.location.href = "/login.html";
        </script>
      `);

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.send(`
        <script>
          alert("Incorrect Password!");
          window.location.href = "/login.html";
        </script>
      `);

    // ⭐ STORE SESSION
    req.session.userEmail = email;

    res.send(`
      <script>
        alert("Login Successful!");
        window.location.href = "/dashboard.html";
      </script>
    `);
  } catch (err) {
    res.send("Error: " + err);
  }
});

// ⭐ SAVE COURSE ROUTE
app.post("/save-course", async (req, res) => {
  if (!req.session.userEmail) {
    return res.send(`
      <script>alert("You must login first!"); window.location.href="/login.html";</script>
    `);
  }

  try {
    const { studentName, studentID, courseName, courseID } = req.body;

    await Course.create({
      studentName,
      studentID,
      courseName,
      courseID,
      email: req.session.userEmail,
    });

    res.send(`
      <script>
        alert("Course Registered Successfully!");
        window.location.href = "/courses.html";
      </script>
    `);
  } catch (err) {
    res.send("Error: " + err);
  }
});

// ⭐ GET MY COURSES
app.get("/my-courses", async (req, res) => {
  if (!req.session.userEmail) return res.json([]);

  const courses = await Course.find({ email: req.session.userEmail });
  res.json(courses);
});

// ⭐ LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/index.html");
  });
});

// ⭐ START SERVER
app.listen(5000, () => console.log("Server running on port 5000"));
