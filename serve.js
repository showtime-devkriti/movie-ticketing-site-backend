const express = require("express");
const path = require("path");

const app = express();
const PORT = 5500;

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"test.html")); // going one directory up
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
