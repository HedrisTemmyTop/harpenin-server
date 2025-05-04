// server.js
const app = require("./app");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
const port = process.env.PORT || 6000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
