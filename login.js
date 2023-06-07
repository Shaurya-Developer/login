const express = require("express");
const fs = require("fs");
const app = express();
const session = require("express-session");
const port = 3000;

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "hgaAH434$#$%vbsa7",
    saveUninitialized: false,
    resave: false,
  })
);
// Signup page - POST endpoint to receive user details
app.post("/signup", (req, res) => {
  const { name, username, password } = req.body;
  const user = { name, username, password };
  const userData = JSON.stringify(user);

  fs.appendFile("users.txt", userData + "\n", (err) => {
    if (err) throw err;
    res.send("User signed up successfully!");
  });
});

// Login page - POST endpoint to receive user credentials
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verify user credentials from the stored user data
  fs.readFile("users.txt", "utf8", (err, data) => {
    if (err) throw err;

    const users = data.split("\n").filter(Boolean);
    const foundUser = users.find((user) => {
      const { username: storedUsername, password: storedPassword } =
        JSON.parse(user);
      return storedUsername === username && storedPassword === password;
    });

    if (foundUser) {
      req.session.username = username; // Creating a session
      res.redirect("/home");
    } else {
      res.send("Invalid login credentials!");
    }
  });
});

// Home page - Displaying the username and logout button
app.get("/home", (req, res) => {
  const { username } = req.session;
  if (username) {
    res.send(`
      <h1>Welcome, ${username}!</h1>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.redirect("/login");
  }
});

// Logout page - Removing the session and redirecting to the login page
app.get("/logout", (req, res) => {
  req.session.destroy(); // Removing the session
  res.redirect("/login");
});

// Login page - GET endpoint to display the login form
app.get("/login", (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  `);
});

// Signup page - GET endpoint to display the signup form
app.get("/signup", (req, res) => {
  res.send(`
    <h1>Signup</h1>
    <form action="/signup" method="POST">
      <input type="text" name="name" placeholder="Name" required>
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Signup</button>
    </form>
  `);
});

// Starting the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
