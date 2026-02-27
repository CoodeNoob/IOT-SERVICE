require('dotenv').config();

const app = require('./app');

const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
    .then(() => {
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log(`Database : ${process.env.DB_NAME} : connected successfully`);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        return sequelize.sync();
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error:', err);
    });
