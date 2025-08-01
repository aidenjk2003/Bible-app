const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/bibleApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
  userId: String,
  id: String,
  book: String,
  chapter: Number,
  verse: Number,
  text: String,
});

const annotationSchema = new mongoose.Schema({
  userId: String,
  key: String, // e.g., "Genesis-1-1"
  note: String,
  color: String,
  html: String,
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
const Annotation = mongoose.model("Annotation", annotationSchema);

// 📚 BOOKMARK ROUTES
app.get("/api/bookmarks/:userId", async (req, res) => {
  const { userId } = req.params;
  const bookmarks = await Bookmark.find({ userId });
  res.json(bookmarks);
});

app.post("/api/bookmarks/:userId", async (req, res) => {
  const { userId } = req.params;
  await Bookmark.deleteMany({ userId }); // overwrite
  await Bookmark.insertMany(req.body.bookmarks.map((b) => ({ ...b, userId })));
  res.json({ success: true });
});

// 📝 ANNOTATION ROUTES
app.get("/api/annotations/:userId", async (req, res) => {
  const { userId } = req.params;
  const annotations = await Annotation.find({ userId });
  res.json(annotations);
});

app.post("/api/annotations/:userId", async (req, res) => {
  const { userId } = req.params;
  await Annotation.deleteMany({ userId }); // overwrite
  await Annotation.insertMany(
    req.body.annotations.map((a) => ({ ...a, userId }))
  );
  res.json({ success: true });
});

app.listen(3000, () => console.log("✅ Backend running at http://localhost:3000"));
