const http = require("http");
const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const initializeSocketServer = require("./src/services/socketService");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  await connectDatabase();

  const server = http.createServer(app);
  initializeSocketServer(server);

  server.listen(PORT, () => {
    console.log(`CampusHub API running on port ${PORT}`);
  });
};

bootstrap();
