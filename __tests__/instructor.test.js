const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Instructor = require('../models/instructor');
const Student = require('../models/student');

describe('Instructor API Endpoints', () => {
  let testStudent;
  let testInstructor;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
  });

  beforeEach(async () => {
    // Create test student
    testStudent = await Student.create({
      firstName: 'Test',
      lastName: 'Student',
      gender: 'Male',
      age: 20,
      favoriteSubject: 'Math',
      grade: 'A',
      email: 'student@test.com'
    });

    // Create test instructor
    testInstructor = await Instructor.create({
      firstName: 'John',
      lastName: 'Doe',
      course: 'Math',
      gender: 'Male',
      age: 35,
      email: 'instructor@test.com',
      qualification: 'PhD',
      students: [testStudent._id]
    });
  });

  afterEach(async () => {
    await Instructor.deleteMany({});
    await Student.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });



  // GET ALL INSTRUCTORS TESTS -----------------------------------------------------------------------
  describe('GET /instructor', () => {
    it('should return all instructors with status 200', async () => {
      const response = await request(app)
        .get('/instructor')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe('John');
      expect(response.body[0].lastName).toBe('Doe');
      expect(response.body[0].students).toBeDefined();
    });

    it('should return empty array when no instructors exist', async () => {
      await Instructor.deleteMany({});
      const response = await request(app)
        .get('/instructor')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should populate students when populate query is provided', async () => {
      const response = await request(app)
        .get('/instructor?populate=students')
        .expect(200);
      
      expect(response.body[0].students[0]).toEqual(
        expect.objectContaining({
          firstName: 'Test',
          lastName: 'Student'
        })
      );
    });
  });



  // GET SINGLE INSTRUCTOR TESTS -----------------------------------------------------------------------
  describe('GET /instructor/:id', () => {
    it('should return a single instructor with status 200', async () => {
      const response = await request(app)
        .get(`/instructor/${testInstructor._id}`)
        .expect(200);
      
      expect(response.body._id).toBe(testInstructor._id.toString());
      expect(response.body.firstName).toBe('John');
      expect(response.body.students).toBeDefined();
    });

    it('should populate students when populate query is provided', async () => {
      const response = await request(app)
        .get(`/instructor/${testInstructor._id}?populate=students`)
        .expect(200);
      
      expect(response.body.students[0]).toEqual(
        expect.objectContaining({
          firstName: 'Test',
          lastName: 'Student'
        })
      );
    });

    it('should return 404 for non-existent instructor ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/instructor/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid instructor ID format', async () => {
      await request(app)
        .get('/instructor/invalid-id-format')
        .expect(400);
    });
  });



// POST INSTRUCTOR TESTS ----------------------------------------------------------------------------------
describe('POST /instructor', () => {
    it('should create a new instructor and return 201 status', async () => {
      const newInstructor = {
        firstName: 'Jane',
        lastName: 'Smith',
        course: 'Science',
        gender: 'Female',
        age: 40,
        email: 'jane.smith@test.com',
        qualification: 'MSc'
      };
  
      const response = await request(app)
        .post('/instructor')
        .send(newInstructor)
        .expect(201);
  
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe('Jane');
      expect(response.body[0]._id).toBeDefined();
  
      const dbInstructor = await Instructor.findOne({ email: 'jane.smith@test.com' });
      expect(dbInstructor).not.toBeNull();
    });
  
    it('should create multiple instructors when given an array', async () => {
      const newInstructors = [
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          course: 'History',
          gender: 'Female',
          age: 45,
          email: 'alice@test.com',
          qualification: 'PhD'
        },
        {
          firstName: 'Bob',
          lastName: 'Williams',
          course: 'Physics',
          gender: 'Male',
          age: 50,
          email: 'bob@test.com',
          qualification: 'PhD'
        }
      ];
  
      const response = await request(app)
        .post('/instructor')
        .send(newInstructors)
        .expect(201);
  
      expect(response.body.length).toBe(2);
      expect(response.body[0].firstName).toBe('Alice');
      expect(response.body[1].firstName).toBe('Bob');
  
      const dbCount = await Instructor.countDocuments();
      expect(dbCount).toBe(3); // original + 2 new
    });
  
    it('should return 400 for invalid instructor data', async () => {
      const invalidInstructor = {
        firstName: 'Bad', // Missing required fields
        age: 'not-a-number' // Invalid type
      };
  
      const response = await request(app)
        .post('/instructor')
        .send(invalidInstructor)
        .expect(400);
  
      expect(response.body.error || response.body.errors).toBeDefined();
    });
  
    it('should auto-assign students matching the instructor course', async () => {
      await Student.create({
        firstName: 'Math',
        lastName: 'Enthusiast',
        gender: 'Male',
        age: 21,
        favoriteSubject: 'Math',
        grade: 'A+',
        email: 'math.student@test.com'
      });
  
      const newInstructor = {
        firstName: 'Math',
        lastName: 'Professor',
        course: 'Math',
        gender: 'Male',
        age: 55,
        email: 'math.prof@test.com',
        qualification: 'PhD'
      };
  
      const response = await request(app)
        .post('/instructor')
        .send(newInstructor)
        .expect(201);
  
      const createdInstructor = await Instructor.findById(response.body[0]._id)
        .populate('students');
      
      expect(createdInstructor.students.length).toBe(2);
      expect(createdInstructor.students.some(s => s.favoriteSubject === 'Math')).toBe(true);
    });
  
    it('should handle duplicate email addresses according to current API behavior', async () => {
      const duplicateInstructor = {
        firstName: 'Duplicate',
        lastName: 'Instructor',
        course: 'Chemistry',
        gender: 'Male',
        age: 40,
        email: 'instructor@test.com', // Same as testInstructor
        qualification: 'PhD'
      };
  
      const response = await request(app)
        .post('/instructor')
        .send(duplicateInstructor);
  
      // Check if API allows duplicates (201) or rejects them (400)
      if (response.status === 201) {
        // If duplicates are allowed, verify both exist
        const instructors = await Instructor.find({ email: 'instructor@test.com' });
        expect(instructors.length).toBe(2);
        expect(instructors[0]._id).not.toBe(instructors[1]._id);
      } else {
        // If duplicates are rejected
        expect(response.status).toBe(400);
        expect(response.body.error || response.body.errors).toBeDefined();
        expect(response.body.error || response.body.errors).toMatch(/duplicate|already exists/i);
      }
    });
  });
  
  

   // PUT (UPDATE) INSTRUCTOR TESTS -------------------------------------------------------------------------
   describe('PUT /instructor/:id', () => {
    it('should update an instructor and return 200 status', async () => {
      const updates = {
        firstName: 'Jonathan',
        age: 36,
        qualification: 'Professor'
      };

      const response = await request(app)
        .put(`/instructor/${testInstructor._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.firstName).toBe('Jonathan');
      expect(response.body.age).toBe(36);
      expect(response.body.qualification).toBe('Professor');

      const updatedInstructor = await Instructor.findById(testInstructor._id);
      expect(updatedInstructor.firstName).toBe('Jonathan');
    });

    it('should update course and reassign students', async () => {
      // Create a student with different subject
      await Student.create({
        firstName: 'Science',
        lastName: 'Student',
        gender: 'Female',
        age: 21,
        favoriteSubject: 'Science',
        grade: 'A',
        email: 'science.student@test.com'
      });

      const updates = {
        course: 'Science'
      };

      const response = await request(app)
        .put(`/instructor/${testInstructor._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.course).toBe('Science');

      const updatedInstructor = await Instructor.findById(testInstructor._id)
        .populate('students');
      
      // Should now have only science students
      expect(updatedInstructor.students.length).toBe(1);
      expect(updatedInstructor.students[0].favoriteSubject).toBe('Science');
    });

    it('should return 404 for non-existent instructor ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/instructor/${nonExistentId}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });

    it('should return 400 for invalid instructor ID format', async () => {
      await request(app)
        .put('/instructor/invalid-id-format')
        .send({ firstName: 'Updated' })
        .expect(400);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdates = {
        age: 'not-a-number'
      };

      const response = await request(app)
        .put(`/instructor/${testInstructor._id}`)
        .send(invalidUpdates)
        .expect(400);

      expect(response.body.error || response.body.errors).toBeDefined();
    });
  });



  // DELETE INSTRUCTOR TESTS -------------------------------------------------------------------------
  describe('DELETE /instructor/:id', () => {
    it('should delete an instructor and return 200 status', async () => {
      const response = await request(app)
        .delete(`/instructor/${testInstructor._id}`)
        .expect(200);

      expect(response.body.message).toMatch(/deleted successfully/i);

      const deletedInstructor = await Instructor.findById(testInstructor._id);
      expect(deletedInstructor).toBeNull();

      // Verify student's instructor reference was removed
      const student = await Student.findById(testStudent._id);
      expect(student.instructors).not.toContainEqual(testInstructor._id);
    });

    it('should return 404 for non-existent instructor ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/instructor/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid instructor ID format', async () => {
      await request(app)
        .delete('/instructor/invalid-id-format')
        .expect(400);
    });
  });

});