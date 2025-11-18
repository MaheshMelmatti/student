const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/studentDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Course schema
const courseSchema = new mongoose.Schema({
  studentName: String,
  studentId: String,
  courseName: String,
  courseId: String,
});

const Course = mongoose.model("Course", courseSchema);

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.send({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Error registering user" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const bcrypt = require("bcryptjs");

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: "Incorrect password" });

    res.send({ message: "Login successful" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Error logging in" });
  }
});

// Add course endpoint
app.post("/add-course", async (req, res) => {
  try {
    const { studentName, studentId, courseName, courseId } = req.body;
    const course = new Course({ studentName, studentId, courseName, courseId });
    await course.save();
    res.send({ message: "Course registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Error registering course" });
  }
});

// Get all courses
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.send(courses);
  } catch (err) {
    res.status(500).send({ error: "Error fetching courses" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
