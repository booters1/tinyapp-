
const express = require("express");
const cookieSession = require('cookie-session');
const users = {};
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

// middleware form data
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['banana']
}));

//Borrowed source code and tailored to tinyapp https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

function generateRandomString(len = 6, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let randomString = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet[randomPoz];
  }
  return randomString;
}

const randomString = generateRandomString();
//console.log(randomString);

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomString] = longURL; 
  res.redirect(`/urls/${randomString}`); 
});


// Extract shortURL -> Look up longURL corresponding shortURL in urlDatabase
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("SHORT URL NOT FOUND");
  }
});
// Edit route
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL; 

  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("Short URL not found");
  }
});

// Delete route
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; 
  if (urlDatabase[id]) {
    delete urlDatabase[id];
  }
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

//route for displaying form to add new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { email: req.session.email };
  res.render("urls_new", templateVars);
});

//redirect route for already signed in
app.get("/login", (req, res) => {
  if (req.session.email) {
    res.redirect("/urls");
  } else {
    res.render("login", { email: ""});
  }
});

// route for login 
app.post("/login", (req, res) => {
  const { email, password} = req.body;
  const user = getUserByEmail(email);
  
  if (!user) {
    res.status(403).send("User is not in database.");
    return;
  }
  //debug code
  console.log("Hashed password from database:", user.password);
  console.log("Entered password:", password);

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid password. PLease try again.");
    //debug code
    
    console.log("Hashed password does not match.");
    return;
  }

  req.session.email = email;
  res.redirect("/urls");
});

// logged in route
app.get("/urls", (req, res) => {
  const templateVars = {
    email: req.session["email"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//route for displaying speicifc URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]; 
  // const templateVars = { id: id, longURL: longURL };
  const templateVars = { id: id, longURL: longURL, email: req.session.email };
  res.render("urls_show", templateVars);
});

// route for logout (clears cookies and redirect)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// route for register --> added if user is loggedin, redirect
app.get("/register", (req, res) => {
  if (req.session.email) {
    res.redirect("/urls");
  } else {
    res.render("register", {email: req.session.email });
  }
});

// route for registration form
// checks for email registrated 
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Both email and password fields are required.");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);


  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Email already registered");
    }
  }
  const userId = generateRandomString();
  users[userId] = { id: userId, email, password: hashedPassword };
  req.session.email = email;
  res.redirect("/urls");
});

// email looker upper
const getUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null; // Return null if user not found
};


//route for login 
app.get("/login", (req, res) => {
  res.render("login", { email: ""});
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});