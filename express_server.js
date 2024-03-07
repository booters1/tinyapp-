
const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

// middleware form data
app.use(express.urlencoded({ extended: true }));

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
console.log(randomString);

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//This needs to come before all of our routes
app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomString] = longURL; // longURL in urlDatabase
  res.redirect(`/urls/${randomString}`); // redirect 
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
  res.render("urls_new");
});

// route for login -> get username from input, cookie + redirect
app.post("/login", (req, res) => {
  const username  = req.body.username;
  res.cookie("username", username); 
  res.redirect("/urls"); 
});

//logged in route
app.get("/urls", (req, res) => {
  const username = req.cookies.username || 'Guest';
  res.render("urls_index", { username: username });
});

//route for displaying speicifc URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]; 
 // const username = req.cookies.username || 'Guest';
  const templateVars = { id: id, longURL: longURL };
  // const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});