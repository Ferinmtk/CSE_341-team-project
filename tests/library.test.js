const request = require("supertest");
const { app, connectDB, closeDB } = require("../server"); // Adjust path as necessary
// const Book = require('../models/book'); // Assuming model path, not used yet

// Mock the ensureAuthenticated middleware from its own module
jest.mock("../middleware/auth", () => ({
  ensureAuthenticated: (req, res, next) => next(), // Mock implementation calls next() directly
}));


describe("Library API (Books)", () => {
  // Connect to the database before running tests
  beforeAll(async () => {
    await connectDB();
  });

  // Close the database connection after tests
  afterAll(async () => {
    await closeDB();
  });

  // Test for GET all books
  describe("GET /library/books", () => { // Corrected path
    it("should return all books and status 200", async () => {
      const res = await request(app).get("/library/books"); // Corrected path
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      // Add more specific assertions if needed
    });
  });

  // Test for GET single book by ID
  describe("GET /library/books/:id", () => { // Corrected path
    let testBookId;

    // Fetch an existing book ID before testing GET by ID
    beforeAll(async () => {
      const books = await request(app).get("/library/books"); // Corrected path
      if (books.body.length > 0) {
        testBookId = books.body[0]._id;
      } else {
        console.warn("No books found to test GET /library/books/:id"); // Corrected path in warning
      }
    });

    it("should return a single book and status 200 if ID exists", async () => {
      if (!testBookId) {
        console.log("Skipping GET /library/books/:id test - no book ID available."); // Corrected path in log
        return; // Skip test if no ID was found
      }
      const res = await request(app).get(`/library/books/${testBookId}`); // Corrected path
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty("_id", testBookId);
      // Add more specific assertions about the book object structure
    });

    it("should return status 400 or 404 for an invalid or non-existent ID", async () => {
      const invalidId = "invalidObjectIdFormat123";
      const res = await request(app).get(`/library/books/${invalidId}`); // Corrected path
      expect([400, 404]).toContain(res.statusCode);
    });
  });

});
