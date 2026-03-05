require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;
const isDevState = process.env.APP === 'Development';

async function startServer() {
    try {
        console.clear();
        await sequelize.authenticate();

        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log(`Database : ${process.env.DB_NAME} connected successfully`);
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

        if (isDevState) {
            await sequelize.sync();
            console.log("Database synced");
        }

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error("Error starting server:", err);
    }
}

startServer();