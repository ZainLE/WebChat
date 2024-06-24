const { app, server } = require('./app');

const PORT = process.env.PORT || 3020;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
