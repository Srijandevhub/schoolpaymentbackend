const mongoose = require('mongoose');
const databaseConfig = async (url) => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Database connected at ${mongoose.connection.port}`);
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = databaseConfig;