
const express = require("express");
const cookieSession = require('cookie-session');
const users = {};
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

// middleware form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['bananaman1998']
}));
// source code and tailored to tinyapp https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateRandomString(len = 6, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let randomString = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet[randomPoz];
  }
  return randomString;
}
const randomString = generateRandomString();
app.set("view engine", "ejs")
const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
// filter urls by ownership
const urlsForUser = (id) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};
// route: creating new url
app.post("/urls", (req, res) => {
  if (!req.session || !req.session.user_id) {
    res.status(401).send("Please login or register first.");
    return;
  }

  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomString] = {
  longURL: longURL,
  userID: req.session.user_id
  };

  res.redirect(`/urls/${randomString}`); 
});
// route: redirect to long url
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("SHORT URL NOT FOUND");
  }
});
// Edit route (ONLY OWNER CAN EDIT)
app.post("/urls/:id", (req, res) => {
  if (!req.session || !req.session.user_id) {
    res.status(401).send("🛑 Unauthorized User- Create or Login to an account 🛑");
    return;
  }
  const shortURL = req.params.id;
  const userURLs = urlsForUser(req.session.user_id);

  if (!userURLs[shortURL]) {
    res.status(401).send("🛑 Unauthorized User- Create or login to an account 🛑");
    return;
  }
  const updatedLongURL = req.body.updatedLongURL;
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect(`/urls`);
});
// Delete route (ONLY OWNER CAN DELETE)
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session || !req.session.user_id) {
    res.status(401).send("🛑 Unauthorized User- Create or login to an account 🛑");
    return;
  }
  const shortURL = req.params.id;
  const userURLs = urlsForUser(req.session.user_id);
  if (!userURLs[shortURL]) {
    res.status(401).send("🛑 Unauthorized User- Create or login to an account 🛑");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
// get url database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//route for displaying form to add new URL
app.get("/urls/new", (req, res) => {
  if (!req.session || !req.session.user_id) {
    res.status(401).send("🛑 Please log in to create a new URL 🛑");
    return;
  }
  const templateVars = { email: users[req.session.user_id].email };
  res.render("urls_new", templateVars);
});

//redirect route for already signed in
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", { email: ""});
  }
});

// route for login 
app.post("/login", (req, res) => {
  const { email, password} = req.body;
  const user = getUserByEmail(email, users);
  
  if (!user) {
    res.status(403).send("User is not in database.");
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid password. PLease try again.");
    return;
  }
  req.session.user_id = user.id;
  users[user.id] = user;
  
  res.redirect("/urls");
});

// logged in route (display urls)
app.get("/urls", (req, res) => {
  if (!req.session || !req.session.user_id) {
    res.status(401).send("🛑 Unauthorized User- Create or login to an account 🛑");
    return;
  }
  const userURLs = urlsForUser(req.session.user_id);
  const email = users[req.session.user_id].email;

  const templateVars = {
    urls: userURLs,
    email: email,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//route for displaying specific URL (logged in person only)
app.get("/urls/:id", (req, res) => {
  if (!req.session || !req.session.user_id) {
    res.status(401).send("🛑 Unauthorized User- Create or login to an account 🛑");
    return;
  }
  const shortURL = req.params.id;
  const userURLs = urlsForUser(req.session.user_id);
  
  if (!userURLs[shortURL]) {
    res.status(404).send("URL does not belong to this user./");
    return;
  }
  const id = req.params.id;
  const email = users[req.session.user_id].email;

  const templateVars = {
    shortURL: shortURL,
    longURL: userURLs[shortURL].longURL,
    email: email,
    user: users[req.session.user_id],
    id: id,
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

// route for logout (clears cookies and redirect)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// route for register --> added if user is loggedin, redirect
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", { email: "" });
  }
});

// route for registration form
// checks for email registrated 
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Both email and password fields needed.");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

// check for already registered user
  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Email already registered");
    }
  }
  const userId = generateRandomString();
  users[userId] = { id: userId, email, password: hashedPassword };
  req.session.user_id = userId;
  users[userId].email = email;
  res.redirect("/urls");
});

// email looker upper
const getUserByEmail = function(email, usersDatabase) {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null; // Return null if user not found
};


// starts the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});