const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  publicationYear: { type: Number, required: true },
  shelveLocation: { type: String, required: true },
  genre: { type: String, required: true },
  copiesAvailable: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", bookSchema);
