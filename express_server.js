
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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
  const randomString = generateRandomString(); // Generate a random string
  const longURL = req.body.longURL; // Get the long URL from the request body
  urlDatabase[randomString] = longURL; // Save the longURL in the urlDatabase with the generated randomString as key
  res.redirect(`/urls/${randomString}`); // Redirect to the newly created URL page
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]; 
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});