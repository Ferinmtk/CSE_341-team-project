require("dotenv").config();
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CSE341 Web Services API",
      version: "1.0.0",
      description: "API documentation for CSE341 Web Services Project",
    },
    servers: [
      {
        url: "http://localhost:3000", // Local server URL
      },
    ],
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "apiKey", // This should match the key expected in your routes
          description: "Enter your API key here",
        },
      },
    },
    security: [{ apiKeyAuth: [] }], // Apply API key authentication globally
  },
  // apis: ["./routes/*.js"], // Path to the API docs
  apis: [
    "./routes/index.js",
    "./routes/studentRoutes.js",
    "./routes/instructorRoutes.js",
    "./routes/libraryRoutes.js",
    "./routes/playerRoutes.js",
    "./routes/courseRoutes.js",
    "./routes/attendanceRoutes.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
