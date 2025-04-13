const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Book = require('../models/book');
const Student = require('../models/student');
const Instructor = require('../models/instructor');

describe('Book API Endpoints', () => {
  let testBook;
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
      firstName: 'Test',
      lastName: 'Instructor',
      course: 'Computer Science',
      gender: 'Male',
      age: 35,
      email: 'instructor@test.com',
      qualification: 'PhD'
    });

    // Create test book
    testBook = await Book.create({
      bookTitle: 'Clean Code',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      shelveLocation: 'CS-101',
      genre: 'Programming',
      copiesAvailable: 3
    });
  });

  afterEach(async () => {
    await Book.deleteMany({});
    await Student.deleteMany({});
    await Instructor.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });



  // GET ALL BOOKS TESTS -----------------------------------------------------------------------
  describe('GET /library/books', () => {
    it('should return all books with status 200', async () => {
      const response = await request(app)
        .get('/library/books')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].bookTitle).toBe('Clean Code');
      expect(response.body[0].author).toBe('Robert C. Martin');
      expect(response.body[0].borrowedBy).toBeDefined();
    });

    it('should return empty array when no books exist', async () => {
      await Book.deleteMany({});
      const response = await request(app)
        .get('/library/books')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should populate borrower details when getting books', async () => {
      // Borrow the book first
      await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Student'
        });

      const response = await request(app)
        .get('/library/books')
        .expect(200);
      
      expect(response.body[0].borrowedBy[0].borrowerId.firstName).toBe('Test');
      expect(response.body[0].borrowedBy[0].borrowerId.lastName).toBe('Student');
    });
  });



  // GET SINGLE BOOK TESTS -----------------------------------------------------------------------
  describe('GET /library/books/:id', () => {
    it('should return a single book with status 200', async () => {
      const response = await request(app)
        .get(`/library/books/${testBook._id}`)
        .expect(200);
      
      expect(response.body._id).toBe(testBook._id.toString());
      expect(response.body.bookTitle).toBe('Clean Code');
      expect(response.body.copiesAvailable).toBe(3);
    });

    it('should populate borrower details when getting a book', async () => {
      // Borrow the book first
      await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testInstructor._id,
          borrowerType: 'Instructor'
        });

      const response = await request(app)
        .get(`/library/books/${testBook._id}`)
        .expect(200);
      
      expect(response.body.borrowedBy[0].borrowerId.firstName).toBe('Test');
      expect(response.body.borrowedBy[0].borrowerId.lastName).toBe('Instructor');
    });

    it('should return 404 for non-existent book ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/library/books/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid book ID format', async () => {
      await request(app)
        .get('/library/books/invalid-id-format')
        .expect(400);
    });
  });



  // POST BOOK TESTS ----------------------------------------------------------------------------------
  describe('POST /library/books', () => {
    it('should create a new book and return 201 status', async () => {
      const newBook = {
        bookTitle: 'Design Patterns',
        author: 'Erich Gamma',
        publisher: 'Addison-Wesley',
        publicationYear: 1994,
        shelveLocation: 'CS-102',
        genre: 'Programming',
        copiesAvailable: 5
      };
  
      const response = await request(app)
        .post('/library/books')
        .send(newBook)
        .expect(201);
  
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].bookTitle).toBe('Design Patterns');
      expect(response.body[0]._id).toBeDefined();
  
      const dbBook = await Book.findOne({ bookTitle: 'Design Patterns' });
      expect(dbBook).not.toBeNull();
    });
  
    it('should create multiple books when given an array', async () => {
      const newBooks = [
        {
          bookTitle: 'Refactoring',
          author: 'Martin Fowler',
          publisher: 'Addison-Wesley',
          publicationYear: 1999,
          shelveLocation: 'CS-103',
          genre: 'Programming',
          copiesAvailable: 2
        },
        {
          bookTitle: 'The Pragmatic Programmer',
          author: 'Andrew Hunt',
          publisher: 'Addison-Wesley',
          publicationYear: 1999,
          shelveLocation: 'CS-104',
          genre: 'Programming',
          copiesAvailable: 3
        }
      ];
  
      const response = await request(app)
        .post('/library/books')
        .send(newBooks)
        .expect(201);
  
      expect(response.body.length).toBe(2);
      expect(response.body[0].bookTitle).toBe('Refactoring');
      expect(response.body[1].bookTitle).toBe('The Pragmatic Programmer');
  
      const dbCount = await Book.countDocuments();
      expect(dbCount).toBe(3); // original + 2 new
    });
  
    it('should return 400 for invalid book data', async () => {
      const invalidBook = {
        bookTitle: 'Invalid', // Missing required fields
        copiesAvailable: 'not-a-number' // Invalid type
      };
  
      const response = await request(app)
        .post('/library/books')
        .send(invalidBook)
        .expect(400);
  
      expect(response.body.error || response.body.errors).toBeDefined();
    });
  
    it('should handle duplicate book titles according to current API behavior', async () => {
      const duplicateBook = {
        bookTitle: 'Clean Code', // Same as testBook
        author: 'Different Author',
        publisher: 'Different Publisher',
        publicationYear: 2020,
        shelveLocation: 'CS-105',
        genre: 'Programming',
        copiesAvailable: 1
      };
  
      const response = await request(app)
        .post('/library/books')
        .send(duplicateBook);
  
      // Check if API allows duplicates (201) or rejects them (400)
      if (response.status === 201) {
        // If duplicates are allowed, verify both exist
        const books = await Book.find({ bookTitle: 'Clean Code' });
        expect(books.length).toBe(2);
        expect(books[0]._id).not.toBe(books[1]._id);
      } else {
        // If duplicates are rejected
        expect(response.status).toBe(400);
        expect(response.body.error || response.body.errors).toBeDefined();
        expect(response.body.error || response.body.errors).toMatch(/duplicate|already exists/i);
      }
    });
  });



  // PUT (UPDATE) BOOK TESTS -------------------------------------------------------------------------
  describe('PUT /library/books/:id', () => {
    it('should update a book and return 200 status', async () => {
      const updates = {
        bookTitle: 'Clean Code: Updated Edition',
        copiesAvailable: 5
      };

      const response = await request(app)
        .put(`/library/books/${testBook._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.bookTitle).toBe('Clean Code: Updated Edition');
      expect(response.body.copiesAvailable).toBe(5);

      const updatedBook = await Book.findById(testBook._id);
      expect(updatedBook.bookTitle).toBe('Clean Code: Updated Edition');
    });

    it('should return 404 for non-existent book ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/library/books/${nonExistentId}`)
        .send({ bookTitle: 'Updated' })
        .expect(404);
    });

    it('should return 400 for invalid book ID format', async () => {
      await request(app)
        .put('/library/books/invalid-id-format')
        .send({ bookTitle: 'Updated' })
        .expect(400);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdates = {
        publicationYear: 'not-a-number',
        copiesAvailable: 'many' // Invalid type
      };

      const response = await request(app)
        .put(`/library/books/${testBook._id}`)
        .send(invalidUpdates)
        .expect(400);

      expect(response.body.error || response.body.errors).toBeDefined();
    });
  });



  // DELETE BOOK TESTS -------------------------------------------------------------------------
  describe('DELETE /library/books/:id', () => {
    it('should delete a book and return 200 status', async () => {
      const response = await request(app)
        .delete(`/library/books/${testBook._id}`)
        .expect(200);

      expect(response.body.message).toMatch(/deleted successfully/i);

      const deletedBook = await Book.findById(testBook._id);
      expect(deletedBook).toBeNull();
    });

    it('should return 404 for non-existent book ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/library/books/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid book ID format', async () => {
      await request(app)
        .delete('/library/books/invalid-id-format')
        .expect(400);
    });
  });



  // BORROW BOOK TESTS -------------------------------------------------------------------------
  describe('POST /library/books/:id/borrow', () => {
    it('should allow a student to borrow a book and return 200 status', async () => {
      const response = await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Student'
        })
        .expect(200);

      expect(response.body.copiesAvailable).toBe(2);
      expect(response.body.borrowedBy.length).toBe(1);
      expect(response.body.borrowedBy[0].borrowerId.firstName).toBe('Test');
    });

    it('should allow an instructor to borrow a book and return 200 status', async () => {
      const response = await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testInstructor._id,
          borrowerType: 'Instructor'
        })
        .expect(200);

      expect(response.body.copiesAvailable).toBe(2);
      expect(response.body.borrowedBy.length).toBe(1);
      expect(response.body.borrowedBy[0].borrowerId.firstName).toBe('Test');
    });

    it('should return 400 when no copies are available', async () => {
      // Borrow all available copies
      testBook.copiesAvailable = 1;
      await testBook.save();

      // First borrow succeeds
      await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Student'
        });

      // Second borrow should fail
      const response = await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testInstructor._id,
          borrowerType: 'Instructor'
        })
        .expect(400);

      expect(response.body.error).toMatch(/No copies available/i);
    });

    it('should return 400 when borrower has already borrowed the book', async () => {
      // First borrow succeeds
      await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Student'
        });

      // Second borrow should fail
      const response = await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Student'
        })
        .expect(400);

      expect(response.body.error).toMatch(/already borrowed/i);
    });

    it('should return 400 for invalid borrower type', async () => {
        const response = await request(app)
          .post(`/library/books/${testBook._id}/borrow`)
          .send({
            borrowerId: testStudent._id,
            borrowerType: 'InvalidType'
          })
          .expect(400);
      
        // Your controller returns different error formats, so we need to handle both cases
        if (response.body.error) {
          expect(response.body.error).toBe("Invalid borrower type");
        } else if (response.body.errors) {
          expect(response.body.errors).toMatch(/Invalid borrower type|Borrower type must be Student or Instructor/i);
        } else {
          throw new Error(`Unexpected error format: ${JSON.stringify(response.body)}`);
        }
      });

    it('should return 400 when borrower ID does not match type', async () => {
      const response = await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Instructor' // Student ID but Instructor type
        })
        .expect(400);

      expect(response.body.error).toMatch(/does not match Instructor type/i);
    });

    it('should return 404 for non-existent book ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/library/books/${nonExistentId}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Student'
        })
        .expect(404);
    });
  });



  // RETURN BOOK TESTS -------------------------------------------------------------------------
  describe('POST /library/books/:id/return', () => {
    beforeEach(async () => {
      // Borrow the book first
      await request(app)
        .post(`/library/books/${testBook._id}/borrow`)
        .send({
          borrowerId: testStudent._id,
          borrowerType: 'Student'
        });
    });

    it('should allow returning a borrowed book and return 200 status', async () => {
      const response = await request(app)
        .post(`/library/books/${testBook._id}/return`)
        .send({
          borrowerId: testStudent._id
        })
        .expect(200);

      expect(response.body.copiesAvailable).toBe(3);
      expect(response.body.borrowedBy.length).toBe(0);
    });

    it('should return 400 when trying to return a not-borrowed book', async () => {
      // First return succeeds
      await request(app)
        .post(`/library/books/${testBook._id}/return`)
        .send({
          borrowerId: testStudent._id
        });

      // Second return should fail
      const response = await request(app)
        .post(`/library/books/${testBook._id}/return`)
        .send({
          borrowerId: testStudent._id
        })
        .expect(400);

      expect(response.body.error).toMatch(/not borrowed/i);
    });

    it('should return 404 for non-existent book ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/library/books/${nonExistentId}/return`)
        .send({
          borrowerId: testStudent._id
        })
        .expect(404);
    });
  });

});