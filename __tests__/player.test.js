const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Player = require('../models/player');

describe('Player API Endpoints', () => {
  let testPlayer;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
  });

  beforeEach(async () => {
    // Create test player
    testPlayer = await Player.create({
      firstName: 'Lionel',
      lastName: 'Messi',
      countryName: 'Argentina',
      gender: 'Male',
      age: 35,
      position: 'Forward',
      goals: 800
    });
  });

  afterEach(async () => {
    await Player.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });


  
  // GET ALL PLAYERS TESTS -----------------------------------------------------------------------
  describe('GET /player', () => {
    it('should return all players with status 200', async () => {
      const response = await request(app)
        .get('/player')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe('Lionel');
      expect(response.body[0].lastName).toBe('Messi');
      expect(response.body[0].goals).toBe(800);
    });

    it('should return empty array when no players exist', async () => {
      await Player.deleteMany({});
      const response = await request(app)
        .get('/player')
        .expect(200);
      expect(response.body).toEqual([]);
    });
  });



  // GET SINGLE PLAYER TESTS -----------------------------------------------------------------------
  describe('GET /player/:id', () => {
    it('should return a single player with status 200', async () => {
      const response = await request(app)
        .get(`/player/${testPlayer._id}`)
        .expect(200);
      
      expect(response.body._id).toBe(testPlayer._id.toString());
      expect(response.body.firstName).toBe('Lionel');
      expect(response.body.position).toBe('Forward');
    });

    it('should return 404 for non-existent player ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/player/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid player ID format', async () => {
      await request(app)
        .get('/player/invalid-id-format')
        .expect(400);
    });
  });



  // POST PLAYER TESTS ----------------------------------------------------------------------------------
  describe('POST /player', () => {
    it('should create a new player and return 201 status', async () => {
      const newPlayer = {
        firstName: 'Cristiano',
        lastName: 'Ronaldo',
        countryName: 'Portugal',
        gender: 'Male',
        age: 38,
        position: 'Forward',
        goals: 850
      };
  
      const response = await request(app)
        .post('/player')
        .send(newPlayer)
        .expect(201);
  
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe('Cristiano');
      expect(response.body[0]._id).toBeDefined();
  
      const dbPlayer = await Player.findOne({ lastName: 'Ronaldo' });
      expect(dbPlayer).not.toBeNull();
    });
  
    it('should create multiple players when given an array', async () => {
      const newPlayers = [
        {
          firstName: 'Neymar',
          lastName: 'Jr',
          countryName: 'Brazil',
          gender: 'Male',
          age: 31,
          position: 'Forward',
          goals: 400
        },
        {
          firstName: 'Kylian',
          lastName: 'Mbappé',
          countryName: 'France',
          gender: 'Male',
          age: 24,
          position: 'Forward',
          goals: 250
        }
      ];
  
      const response = await request(app)
        .post('/player')
        .send(newPlayers)
        .expect(201);
  
      expect(response.body.length).toBe(2);
      expect(response.body[0].firstName).toBe('Neymar');
      expect(response.body[1].firstName).toBe('Kylian');
  
      const dbCount = await Player.countDocuments();
      expect(dbCount).toBe(3); // original + 2 new
    });
  
    it('should return 400 for invalid player data', async () => {
      const invalidPlayer = {
        firstName: 'Invalid', // Missing required fields
        age: 'not-a-number' // Invalid type
      };
  
      const response = await request(app)
        .post('/player')
        .send(invalidPlayer)
        .expect(400);
  
      expect(response.body.error || response.body.errors).toBeDefined();
    });
  
    it('should handle duplicate player names according to current API behavior', async () => {
      const duplicatePlayer = {
        firstName: 'Lionel',
        lastName: 'Messi',
        countryName: 'Argentina',
        gender: 'Male',
        age: 35,
        position: 'Forward',
        goals: 800
      };
  
      const response = await request(app)
        .post('/player')
        .send(duplicatePlayer);
  
      // Check if API allows duplicates (201) or rejects them (400)
      if (response.status === 201) {
        // If duplicates are allowed, verify both exist
        const players = await Player.find({ firstName: 'Lionel', lastName: 'Messi' });
        expect(players.length).toBe(2);
        expect(players[0]._id).not.toBe(players[1]._id);
      } else {
        // If duplicates are rejected
        expect(response.status).toBe(400);
        expect(response.body.error || response.body.errors).toBeDefined();
        expect(response.body.error || response.body.errors).toMatch(/duplicate|already exists/i);
      }
    });
  });



  // PUT (UPDATE) PLAYER TESTS -------------------------------------------------------------------------
  describe('PUT /player/:id', () => {
    it('should update a player and return 200 status', async () => {
      const updates = {
        firstName: 'Leo',
        age: 36,
        goals: 805
      };

      const response = await request(app)
        .put(`/player/${testPlayer._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.firstName).toBe('Leo');
      expect(response.body.age).toBe(36);
      expect(response.body.goals).toBe(805);

      const updatedPlayer = await Player.findById(testPlayer._id);
      expect(updatedPlayer.firstName).toBe('Leo');
    });

    it('should return 404 for non-existent player ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/player/${nonExistentId}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });

    it('should return 400 for invalid player ID format', async () => {
      await request(app)
        .put('/player/invalid-id-format')
        .send({ firstName: 'Updated' })
        .expect(400);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdates = {
        age: 'not-a-number',
        goals: 'many' // Invalid type
      };

      const response = await request(app)
        .put(`/player/${testPlayer._id}`)
        .send(invalidUpdates)
        .expect(400);

      expect(response.body.error || response.body.errors).toBeDefined();
    });
  });



  // DELETE PLAYER TESTS -------------------------------------------------------------------------
  describe('DELETE /player/:id', () => {
    it('should delete a player and return 200 status', async () => {
      const response = await request(app)
        .delete(`/player/${testPlayer._id}`)
        .expect(200);

      expect(response.body.message).toMatch(/deleted successfully/i);

      const deletedPlayer = await Player.findById(testPlayer._id);
      expect(deletedPlayer).toBeNull();
    });

    it('should return 404 for non-existent player ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/player/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid player ID format', async () => {
      await request(app)
        .delete('/player/invalid-id-format')
        .expect(400);
    });
  });
});