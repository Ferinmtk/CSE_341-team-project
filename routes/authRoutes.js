const express = require('express');
const router = express.Router();
const passport = require('passport');

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     responses:
 *       302:
 *         description: Redirects to GitHub login page
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: Handle GitHub OAuth callback
 *     responses:
 *       302:
 *         description: Redirects to home on success or failure
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirect to base route after login
  }
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out the current user
 *     responses:
 *       302:
 *         description: Redirects to home page after logout
 */
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get the current authenticated user
 *     responses:
 *       200:
 *         description: Returns the current user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router;