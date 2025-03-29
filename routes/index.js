const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: GitHub OAuth2 Authentication
 *   description: Authentication endpoints using GitHub OAuth
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome page with GitHub authentication
 *     tags: [GitHub OAuth2 Authentication]
 *     responses:
 *       200:
 *         description: Returns a welcome message based on authentication status
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: |
 *                 Welcome to CSE341 - TEAM 9 WEB SERVICES API PROJECT!
 *                 <a href="/auth/github">Login with GitHub</a>
 *                 OR
 *                 Welcome, User! <a href="/auth/logout">Logout</a>
 */
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome, ${req.user.username || 'User'}! <a href="/auth/logout">Logout</a>`);
  } else {
    res.send('Welcome to CSE341 - TEAM 9 WEB SERVICES API PROJECT! <a href="/auth/github">Login with GitHub</a>');
  };
});

module.exports = router;