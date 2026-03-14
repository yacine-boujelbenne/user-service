const mongoose = require('mongoose');

async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is missing in environment variables');
    }

    await mongoose.connect(uri, {
        family: 4,
        serverSelectionTimeoutMS: 5000,
    });
}

module.exports = { connectDB };
