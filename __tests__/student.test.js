const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Student = require('../models/student');
const Instructor = require('../models/instructor');

describe('Student API Endpoints', () => {
  let testInstructor;
  let testStudent;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
  });

  beforeEach(async () => {
    testInstructor = await Instructor.create({
      firstName: 'Test',
      lastName: 'Instructor',
      email: 'instructor@test.com',
      course: 'Math',
      qualification: 'PhD',
      age: 35,
      gender: 'Male'
    });

    testStudent = await Student.create({
      firstName: 'John',
      lastName: 'Doe',
      gender: 'Male',
      age: 20,
      favoriteSubject: 'Math',
      grade: 'A',
      email: 'john.doe@test.com',
      instructors: [testInstructor._id]
    });
  });

  afterEach(async () => {
    await Student.deleteMany({});
    await Instructor.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });



  // GET ALL STUDENTS TESTS -------------------------------------------------------------------
  describe('GET /student', () => {
    it('should return all students with status 200', async () => {
      const response = await request(app)
        .get('/student')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe('John');
      expect(response.body[0].lastName).toBe('Doe');
      expect(response.body[0].instructors).toBeDefined();
    });

    it('should return empty array when no students exist', async () => {
      await Student.deleteMany({});
      const response = await request(app)
        .get('/student')
        .expect(200);
      expect(response.body).toEqual([]);
    });
  });



  // POST STUDENT TESTS -------------------------------------------------------------------
  describe('POST /student', () => {
    it('should create a new student and return 201 status', async () => {
      const newStudent = {
        firstName: 'Jane',
        lastName: 'Smith',
        gender: 'Female',
        age: 21,
        favoriteSubject: 'Science',
        grade: 'B+',
        email: 'jane.smith@test.com'
      };

      const response = await request(app)
        .post('/student')
        .send(newStudent)
        .expect(201);

      // Verify response
      expect(response.body[0].firstName).toBe('Jane');
      expect(response.body[0].lastName).toBe('Smith');
      expect(response.body[0]._id).toBeDefined();

      // Verify actual database record
      const dbStudent = await Student.findOne({ email: 'jane.smith@test.com' });
      expect(dbStudent).not.toBeNull();
      expect(dbStudent.favoriteSubject).toBe('Science');
    });

    it('should create multiple students when given an array', async () => {
      const newStudents = [
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          gender: 'Female',
          age: 22,
          favoriteSubject: 'History',
          grade: 'A-',
          email: 'alice@test.com'
        },
        {
          firstName: 'Bob',
          lastName: 'Williams',
          gender: 'Male',
          age: 23,
          favoriteSubject: 'Math',
          grade: 'B',
          email: 'bob@test.com'
        }
      ];

      const response = await request(app)
        .post('/student')
        .send(newStudents)
        .expect(201);

      expect(response.body.length).toBe(2);
      expect(response.body[0].firstName).toBe('Alice');
      expect(response.body[1].firstName).toBe('Bob');

      // Verify both were created in database (1 existing + 2 new)
      const dbCount = await Student.countDocuments();
      expect(dbCount).toBe(3);
    });

    it('should return 400 for invalid student data', async () => {
      const invalidStudent = {
        firstName: 'Bad', // Missing required fields
        age: 'not-a-number' // Invalid type
      };

      const response = await request(app)
        .post('/student')
        .send(invalidStudent)
        .expect(400);

      // Check for either error message or validation errors
      expect(response.body.error || response.body.errors).toBeDefined();
    });

    it('should auto-assign instructors matching favoriteSubject', async () => {
      // Create additional math instructor
      await Instructor.create({
        firstName: 'Math',
        lastName: 'Expert',
        email: 'math@test.com',
        course: 'Math',
        qualification: 'MSc',
        age: 40,
        gender: 'Male'
      });

      const newStudent = {
        firstName: 'Math',
        lastName: 'Lover',
        gender: 'Male',
        age: 19,
        favoriteSubject: 'Math',
        grade: 'A+',
        email: 'mathlover@test.com'
      };

      const response = await request(app)
        .post('/student')
        .send(newStudent)
        .expect(201);

      // Verify instructors were assigned
      const createdStudent = await Student.findById(response.body[0]._id)
        .populate('instructors');
      
      expect(createdStudent.instructors.length).toBe(2); // original + new math instructor
      expect(createdStudent.instructors[0].course).toBe('Math');
      expect(createdStudent.instructors[1].course).toBe('Math');
    });
  });



  // GET SINGLE STUDENT TESTS (unchanged) -------------------------------------------------------------------
  describe('GET /student/:id', () => {
    it('should return a single student with status 200', async () => {
      const response = await request(app)
        .get(`/student/${testStudent._id}`)
        .expect(200);
      
      expect(response.body._id).toBe(testStudent._id.toString());
      expect(response.body.firstName).toBe('John');
      expect(response.body.instructors).toBeDefined();
    });

    it('should return 404 for non-existent student ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/student/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid student ID format', async () => {
      await request(app)
        .get('/student/invalid-id-format')
        .expect(400);
    });
  });


  
// PUT (UPDATE) STUDENT TESTS -------------------------------------------------------------------
describe('PUT /student/:id', () => {
    it('should update a student and return 200 status', async () => {
      const updates = {
        firstName: 'Johnny',
        age: 21,
        grade: 'A+'
      };

      const response = await request(app)
        .put(`/student/${testStudent._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.firstName).toBe('Johnny');
      expect(response.body.age).toBe(21);
      expect(response.body.grade).toBe('A+');

      const updatedStudent = await Student.findById(testStudent._id);
      expect(updatedStudent.firstName).toBe('Johnny');
      expect(updatedStudent.age).toBe(21);
    });

    it('should update favoriteSubject and reassign instructors', async () => {
      // Create a science instructor
      await Instructor.create({
        firstName: 'Science',
        lastName: 'Teacher',
        email: 'science@test.com',
        course: 'Science',
        qualification: 'PhD',
        age: 45,
        gender: 'Female'
      });

      const updates = {
        favoriteSubject: 'Science'
      };

      const response = await request(app)
        .put(`/student/${testStudent._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.favoriteSubject).toBe('Science');

      const updatedStudent = await Student.findById(testStudent._id).populate('instructors');
      expect(updatedStudent.instructors.length).toBe(1);
      expect(updatedStudent.instructors[0].course).toBe('Science');
    });

    it('should return 404 for non-existent student ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/student/${nonExistentId}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });

    it('should return 400 for invalid student ID format', async () => {
      await request(app)
        .put('/student/invalid-id-format')
        .send({ firstName: 'Updated' })
        .expect(400);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdates = {
        age: 'not-a-number'
      };

      const response = await request(app)
        .put(`/student/${testStudent._id}`)
        .send(invalidUpdates)
        .expect(400);

      expect(response.body.error || response.body.errors).toBeDefined();
    });
  });



  // DELETE STUDENT TESTS -------------------------------------------------------------------
  describe('DELETE /student/:id', () => {
    it('should delete a student and return 200 status', async () => {
      const response = await request(app)
        .delete(`/student/${testStudent._id}`)
        .expect(200);

      expect(response.body.message).toMatch(/deleted successfully/i);

      const deletedStudent = await Student.findById(testStudent._id);
      expect(deletedStudent).toBeNull();

      // Verify instructor's students reference was removed
      const instructor = await Instructor.findById(testInstructor._id);
      expect(instructor.students).not.toContainEqual(testStudent._id);
    });

    it('should return 404 for non-existent student ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/student/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid student ID format', async () => {
      await request(app)
        .delete('/student/invalid-id-format')
        .expect(400);
    });
  });

  
});