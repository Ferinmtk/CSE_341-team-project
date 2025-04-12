## Adding Unit Tests with Jest

This section outlines the steps taken to introduce unit testing to the project using Jest, focusing on testing the basic GET endpoints for all collections.

### Getting Started: Tools and Setup

The goal was to ensure our API endpoints were working as expected. We chose **Jest** as our testing framework because it's popular and comes with many features built-in. To actually *call* our API endpoints from within the tests, we needed **Supertest**, a library designed for testing HTTP servers.

1.  **Dependencies:** We first checked `package.json` and saw Jest was already there. We added Supertest by running `npm install --save-dev supertest`.
2.  **Running Tests:** We updated the `test` script in `package.json` to simply be `"test": "jest"`, allowing us to run all tests easily with `npm test`.

### Challenges and Refactoring

Running tests against a live Express server isn't always straightforward. We hit a couple of snags:

1.  **Port Already In Use (`EADDRINUSE`):** When Jest ran multiple test files, each one tried to import our `server.js` and start the server, causing errors because the port (e.g., 3000) was already taken by the first test file.
    *   **Fix:** We modified `server.js` so that the `app.listen()` part (which starts the server) only runs if the file is executed directly (`node server.js`). If it's just being imported (`require('./server')`) by a test file, it *doesn't* try to start listening. We also made sure to export the `app` instance and the database connection functions (`connectDB`, `closeDB`) so our tests could use them.
2.  **Authentication Block:** Our API routes require users to be logged in (using `ensureAuthenticated` middleware). This meant our basic tests, which run without logging in, were getting blocked with a `401 Unauthorized` error instead of reaching the actual route handler.
    *   **Fix:** We decided the tests *should* bypass authentication for simplicity right now. To make this easier, we moved the `ensureAuthenticated` function out of `server.js` and into its own file (`middleware/auth.js`). This separation allowed us to use Jest's mocking feature.

### Mocking Authentication

In each test file (`tests/*.test.js`), we added this block near the top:

```javascript
jest.mock("../middleware/auth", () => ({
  ensureAuthenticated: (req, res, next) => next(),
}));
```

This tells Jest: "Whenever any code tries to import `ensureAuthenticated` from `../middleware/auth`, don't give them the real function. Instead, give them this fake function that just calls `next()`." This effectively skips the authentication check *only* during testing.

### ESLint & Test Structure

*   **ESLint:** We had to tell ESLint about Jest's special functions (`describe`, `it`, `expect`, etc.) by adding the Jest environment to our `eslint.config.js`. This stopped ESLint from complaining about undefined variables.
*   **Test Files:** We created a `tests/` directory and added separate files for each collection (`instructors.test.js`, `library.test.js`, etc.). Inside each:
    *   We used `beforeAll` to connect to the database before tests run.
    *   We used `afterAll` to disconnect from the database after tests finish.
    *   We grouped tests using `describe` and wrote individual test cases using `it`.
    *   We used `supertest` (`request(app).get(...)`) to make requests.
    *   We used `expect` to check if the status code and response body were correct.

### Debugging: The Library Route Mystery

Our tests for instructors, players, and students started passing, but the library tests failed with a `404 Not Found`. We checked `server.js` (`app.use('/library', ...)`), which looked correct. Then we checked `routes/libraryRoutes.js` and realized the actual routes were defined as `/books` *within* that file. So the full paths were `/library/books` and `/library/books/:id`.

*   **Fix:** We updated the paths in `tests/library.test.js` from `/library` to `/library/books`, and the tests passed!

### Conclusion

After these steps, we had a working test setup using Jest and Supertest. The tests cover the basic GET functionality for all collections, handle database connections cleanly, and bypass authentication using mocking. We can now run `npm test` to verify these endpoints.
