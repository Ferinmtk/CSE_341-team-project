const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  publicationYear: { type: Number, required: true },
  shelveLocation: { type: String, required: true },
  genre: { type: String, required: true },
  copiesAvailable: { type: Number, required: true },
  borrowedBy: {
    type: [
      {
        borrowerId: { type: mongoose.Schema.Types.ObjectId, refPath: "borrowedBy.borrowerType" },
        borrowerType: { type: String, enum: ["Student", "Instructor"] },
        _id: false // Disable subdocument _id generation
      }
    ],
    default: [] 
  },
  createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false // Disable __v
});

module.exports = mongoose.model("Book", bookSchema);