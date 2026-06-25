const http = require("http");
const app = require("./src/app");
const connectDatabase = require("./src/config/database");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  await connectDatabase();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`CampusHub API running on port ${PORT}`);
  });
};

bootstrap();

