require('dotenv').config();

const app = require('./app');

const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');

        return sequelize.sync();
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error:', err);
    });
