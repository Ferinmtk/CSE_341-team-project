const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { studentValidationRules, validate } = require('../controllers/validator');

/**
 * @swagger
 * /student:
 *   get:
 *     summary: Retrieve a list of students
 *     responses:
 *       200:
 *         description: A list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', studentController.getStudents);

/**
 * @swagger
 * /student/{id}:
 *   get:
 *     summary: Retrieve a single student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: A single student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', studentValidationRules(), validate, studentController.getStudentById);

/**
 * @swagger
 * /student:
 *   post:
 *     summary: Create a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *               age:
 *                 type: number
 *               favoriteSubject:
 *                 type: string
 *               grade:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', studentValidationRules(), validate, studentController.createStudent);

/**
 * @swagger
 * /student/{id}:
 *   put:
 *     summary: Update a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *               age:
 *                 type: number
 *               favoriteSubject:
 *                 type: string
 *               grade:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', studentValidationRules(), validate, studentController.updateStudent);

/**
 * @swagger
 * /student/{id}:
 *   delete:
 *     summary: Delete a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: A message indicating the student was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', studentValidationRules(), validate, studentController.deleteStudent);

module.exports = router;