const request = require("supertest");
const { app, connectDB, closeDB } = require("../server"); // Adjust path as necessary
// const Instructor = require('../models/instructor'); // Model not used in these specific tests yet

// Mock the ensureAuthenticated middleware from its own module
jest.mock("../middleware/auth", () => ({
  ensureAuthenticated: (req, res, next) => next(), // Mock implementation calls next() directly
}));


describe("Instructor API", () => {
  // Connect to the database before running tests
  beforeAll(async () => {
    await connectDB();
  });

  // Close the database connection after tests
  afterAll(async () => {
    await closeDB();
  });

  // Test for GET all instructors
  describe("GET /instructors", () => {
    it("should return all instructors and status 200", async () => {
      const res = await request(app).get("/instructor"); // Use the correct route path
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      // Add more specific assertions if needed, e.g., checking array length or item structure
    });
  });

  // Test for GET single instructor by ID
  describe("GET /instructors/:id", () => {
    let testInstructorId;

    // Fetch an existing instructor ID before testing GET by ID
    beforeAll(async () => {
      const instructors = await request(app).get("/instructor");
      if (instructors.body.length > 0) {
        testInstructorId = instructors.body[0]._id;
      } else {
        // Handle case where no instructors exist - maybe skip test or create one
        console.warn("No instructors found to test GET /instructors/:id");
      }
    });

    it("should return a single instructor and status 200 if ID exists", async () => {
      if (!testInstructorId) {
        console.log("Skipping GET /instructors/:id test - no instructor ID available.");
        return; // Skip test if no ID was found
      }
      const res = await request(app).get(`/instructor/${testInstructorId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty("_id", testInstructorId);
      // Add more specific assertions about the instructor object structure
    });

    it("should return status 400 or 404 for an invalid or non-existent ID", async () => {
      const invalidId = "invalidObjectIdFormat123"; // Or use a valid format but non-existent ID
      const res = await request(app).get(`/instructor/${invalidId}`);
      // Check for expected error status code (could be 400 for invalid format, 404 for not found)
      expect([400, 404]).toContain(res.statusCode);
    });
  });

  // Add tests for POST, PUT, DELETE later if needed
});
