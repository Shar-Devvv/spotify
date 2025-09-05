const express = require("express");
const app = express();
const port = 3000;

// serve all static files from current folder
app.use(express.static(__dirname));

// default route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
