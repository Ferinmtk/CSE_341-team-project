module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ["<rootDir>/__tests__/helpers/testSetup.js"],
  testTimeout: 30000, // 30 seconds timeout for individual tests
};