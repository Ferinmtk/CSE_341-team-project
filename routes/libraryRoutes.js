const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/libraryController");
const { bookValidationRules, validate } = require("../controllers/validator");

/**
 * @swagger
 *
 * # LIBRARY MANAGEMENT ROUTES
 *
 * /library/books:
 *   get:
 *     summary: Retrieve a list of all books
 *     tags: [Library]
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get("/books", libraryController.getBooks);

/**
 * @swagger
 * /library/books/{id}:
 *   get:
 *     summary: Retrieve a single book by ID
 *     tags: [Library]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     responses:
 *       200:
 *         description: A single book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get(
  "/books/:id",
  bookValidationRules(),
  validate,
  libraryController.getBookById
);

/**
 * @swagger
 * /library/books:
 *   post:
 *     summary: Add a new book to the library
 *     tags: [Library]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: The created book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 */
router.post(
  "/books",
  bookValidationRules(),
  validate,
  libraryController.createBook
);

/**
 * @swagger
 * /library/books/{id}:
 *   put:
 *     summary: Update a book's information
 *     tags: [Library]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Book not found
 */
router.put(
  "/books/:id",
  bookValidationRules(),
  validate,
  libraryController.updateBook
);

/**
 * @swagger
 * /library/books/{id}:
 *   delete:
 *     summary: Remove a book from the library
 *     tags: [Library]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Library:
 *       type: object
 *       properties:
 *         bookTitle:
 *           type: string
 *         author:
 *           type: string
 *         publisher:
 *           type: string
 *         publicationYear:
 *           type: number
 *         shelveLocation:
 *           type: string
 *         genre:
 *           type: string
 *         copiesAvailable:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */

router.delete(
  "/books/:id",
  bookValidationRules(),
  validate,
  libraryController.deleteBook
);

module.exports = router;
