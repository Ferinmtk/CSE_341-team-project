const request = require("supertest");
const { app, connectDB, closeDB } = require("../server"); // Adjust path as necessary
// const Player = require('../models/player'); // Assuming model path, not used yet

// Mock the ensureAuthenticated middleware from its own module
jest.mock("../middleware/auth", () => ({
  ensureAuthenticated: (req, res, next) => next(), // Mock implementation calls next() directly
}));


describe("Player API", () => {
  // Connect to the database before running tests
  beforeAll(async () => {
    await connectDB();
  });

  // Close the database connection after tests
  afterAll(async () => {
    await closeDB();
  });

  // Test for GET all players
  describe("GET /player", () => {
    it("should return all players and status 200", async () => {
      const res = await request(app).get("/player"); // Use the correct route path
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      // Add more specific assertions if needed
    });
  });

  // Test for GET single player by ID
  describe("GET /player/:id", () => {
    let testPlayerId;

    // Fetch an existing player ID before testing GET by ID
    beforeAll(async () => {
      const players = await request(app).get("/player");
      if (players.body.length > 0) {
        testPlayerId = players.body[0]._id;
      } else {
        console.warn("No players found to test GET /player/:id");
      }
    });

    it("should return a single player and status 200 if ID exists", async () => {
      if (!testPlayerId) {
        console.log("Skipping GET /player/:id test - no player ID available.");
        return; // Skip test if no ID was found
      }
      const res = await request(app).get(`/player/${testPlayerId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty("_id", testPlayerId);
      // Add more specific assertions about the player object structure
    });

    it("should return status 400 or 404 for an invalid or non-existent ID", async () => {
      const invalidId = "invalidObjectIdFormat123";
      const res = await request(app).get(`/player/${invalidId}`);
      expect([400, 404]).toContain(res.statusCode);
    });
  });

});
