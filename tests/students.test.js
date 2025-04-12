const request = require("supertest");
const { app, connectDB, closeDB } = require("../server"); // Adjust path as necessary
// const Student = require('../models/student'); // Assuming model path, not used yet

// Mock the ensureAuthenticated middleware from its own module
jest.mock("../middleware/auth", () => ({
  ensureAuthenticated: (req, res, next) => next(), // Mock implementation calls next() directly
}));


describe("Student API", () => {
  // Connect to the database before running tests
  beforeAll(async () => {
    await connectDB();
  });

  // Close the database connection after tests
  afterAll(async () => {
    await closeDB();
  });

  // Test for GET all students
  describe("GET /student", () => {
    it("should return all students and status 200", async () => {
      const res = await request(app).get("/student"); // Use the correct route path
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      // Add more specific assertions if needed
    });
  });

  // Test for GET single student by ID
  describe("GET /student/:id", () => {
    let testStudentId;

    // Fetch an existing student ID before testing GET by ID
    beforeAll(async () => {
      const students = await request(app).get("/student");
      if (students.body.length > 0) {
        testStudentId = students.body[0]._id;
      } else {
        console.warn("No students found to test GET /student/:id");
      }
    });

    it("should return a single student and status 200 if ID exists", async () => {
      if (!testStudentId) {
        console.log("Skipping GET /student/:id test - no student ID available.");
        return; // Skip test if no ID was found
      }
      const res = await request(app).get(`/student/${testStudentId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty("_id", testStudentId);
      // Add more specific assertions about the student object structure
    });

    it("should return status 400 or 404 for an invalid or non-existent ID", async () => {
      const invalidId = "invalidObjectIdFormat123";
      const res = await request(app).get(`/student/${invalidId}`);
      expect([400, 404]).toContain(res.statusCode);
    });
  });

});
