const express = require("express");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.js", (req, res) => {
  res.sendFile(path.join(__dirname, "index.js"));
});

app.listen(3000);
