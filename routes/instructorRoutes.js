const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructorController");
const {
  instructorValidationRules,
  validate,
} = require("../controllers/validator");

/**
 * @swagger
 *
 * # INSTRUCTOR MANAGEMENT ROUTES
 *
 * /instructor:
 *   get:
 *     summary: Retrieve a list of instructors
 *     tags: [Instructors]
 *     responses:
 *       200:
 *         description: A list of instructors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instructor'
 */
router.get("/", instructorController.getInstructors);

/**
 * @swagger
 * /instructor/{id}:
 *   get:
 *     summary: Retrieve a single instructor by ID with enrolled students' names
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The instructor ID
 *     responses:
 *       200:
 *         description: A single instructor with student names
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instructor'
 *       404:
 *         description: Instructor not found
 */
router.get(
  "/:id",
  instructorValidationRules(),
  validate,
  instructorController.getInstructorById
);

/**
 * @swagger
 * /instructor:
 *   post:
 *     summary: Create a new instructor
 *     tags: [Instructors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - course
 *               - gender
 *               - age
 *               - email
 *               - qualification
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               course: { type: string }
 *               gender: { type: string }
 *               age: { type: number }
 *               email: { type: string }
 *               qualification: { type: string }
 *     responses:
 *       201:
 *         description: The created instructor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instructor'
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  instructorValidationRules(),
  validate,
  instructorController.createInstructor
);


/**
 * @swagger
 * /instructor/{id}:
 *   put:
 *     summary: Update an instructor by ID
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The instructor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Instructor'
 *     responses:
 *       200:
 *         description: The updated instructor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instructor'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Instructor not found
 */
router.put(
  "/:id",
  instructorValidationRules(),
  validate,
  instructorController.updateInstructor
);

/**
 * @swagger
 * /instructor/{id}:
 *   delete:
 *     summary: Delete an instructor by ID
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The instructor ID
 *     responses:
 *       200:
 *         description: Instructor deleted successfully
 *       404:
 *         description: Instructor not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Instructor:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         course: { type: string }
 *         gender: { type: string }
 *         age: { type: number }
 *         email: { type: string }
 *         qualification: { type: string }
 *         createdAt: { type: string, format: "date-time" }
 */
router.delete(
  "/:id",
  instructorValidationRules(),
  validate,
  instructorController.deleteInstructor
);

module.exports = router;
