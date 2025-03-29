const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { playerValidationRules, validate } = require('../controllers/validator');

/**
 * @swagger
 * 
 * # PLAYER MANAGEMENT ROUTES
 * 
 * /player:
 *   get:
 *     summary: Retrieve a list of players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: A list of players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 */
router.get('/', playerController.getPlayers);

/**
 * @swagger
 * /player/{id}:
 *   get:
 *     summary: Retrieve a single player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The player ID
 *     responses:
 *       200:
 *         description: A single player
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Player not found
 */
router.get('/:id', playerValidationRules(), validate, playerController.getPlayerById);

/**
 * @swagger
 * /player:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       201:
 *         description: The created player
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Validation error
 */
router.post('/', playerValidationRules(), validate, playerController.createPlayer);

/**
 * @swagger
 * /player/{id}:
 *   put:
 *     summary: Update a player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: The updated player
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Player not found
 */
router.put('/:id', playerValidationRules(), validate, playerController.updatePlayer);

/**
 * @swagger
 * /player/{id}:
 *   delete:
 *     summary: Delete a player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Player deleted successfully
 *       404:
 *         description: Player not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         countryName:
 *           type: string
 *         gender:
 *           type: string
 *         age:
 *           type: number
 *         position:
 *           type: string
 *         goals:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */

router.delete('/:id', playerValidationRules(), validate, playerController.deletePlayer);

module.exports = router;