const Book = require("../models/book");
const Student = require("../models/student"); 
const Instructor = require("../models/instructor"); 

exports.createBook = async (req, res) => {
  try {
    const books = Array.isArray(req.body) ? req.body : [req.body];
    const createdBooks = await Book.insertMany(books);
    res.status(201).json(createdBooks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate({
      path: "borrowedBy.borrowerId",
      select: "firstName lastName"
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate({
      path: "borrowedBy.borrowerId",
      select: "firstName lastName"
    });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.borrowBook = async (req, res) => {
  try {
    const { borrowerId, borrowerType } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.copiesAvailable <= 0) return res.status(400).json({ error: "No copies available" });
    if (!["Student", "Instructor"].includes(borrowerType)) return res.status(400).json({ error: "Invalid borrower type" });

    const Model = borrowerType === "Student" ? Student : Instructor;
    const borrower = await Model.findById(borrowerId);
    if (!borrower) {
      return res.status(400).json({ error: `Borrower ID does not match ${borrowerType} type` });
    }

    // Ensure borrowedBy is an array and check for duplicates
    book.borrowedBy = book.borrowedBy || [];
    const alreadyBorrowed = book.borrowedBy.some(b => b.borrowerId && b.borrowerId.toString() === borrowerId);
    if (alreadyBorrowed) {
      return res.status(400).json({ error: "You already borrowed this book" });
    }

    book.borrowedBy.push({ borrowerId, borrowerType });
    book.copiesAvailable -= 1;
    await book.save();

    const populatedBook = await Book.findById(req.params.id).populate({
      path: "borrowedBy.borrowerId",
      select: "firstName lastName"
    });
    res.status(200).json(populatedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { borrowerId } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    book.borrowedBy = book.borrowedBy || [];
    const borrowIndex = book.borrowedBy.findIndex(b => b.borrowerId && b.borrowerId.toString() === borrowerId);
    if (borrowIndex === -1) {
      return res.status(400).json({ error: "You have not borrowed this book" });
    }

    book.borrowedBy.splice(borrowIndex, 1);
    book.copiesAvailable += 1;
    await book.save();

    const populatedBook = await Book.findById(req.params.id).populate({
      path: "borrowedBy.borrowerId",
      select: "firstName lastName"
    });
    res.status(200).json(populatedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};