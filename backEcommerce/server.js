const dotenv = require("dotenv");
dotenv.config();

const startServer = require("./app");
const port = process.env.PORT || 5000;

const init = async () => {
  const server = await startServer(); // ✅ await zaroori hai

  server.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });
};

init();
