const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8081;

// Enable CORS
app.use(cors());

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║   Frontend Server Running!             ║
║                                        ║
║   URL: http://localhost:${PORT}        ║
║                                        ║
║   Open this URL in your browser        ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});
