const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const logger = require('./src/utils/logger');
const { httpLogger, errorLogger, debugLogger } = require('./src/middleware/logger.middleware');
require('dotenv').config();
const { sequelize } = require('./src/models');


// SWAGGER 
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//ROUTES
const authRoutes = require('./src/routes/auth.route');
const StudentRoutes = require('./src/routes/student.route');
const courseRoutes = require('./src/routes/course.route');
const teacherRoutes = require('./src/routes/teacher.route');
const fingerprintRoutes = require('./src/routes/fingerprint.route');
const attendanceRoutes = require('./src/routes/attendance.route');
const mailRoutes = require('./src/routes/email.route');


//CORS OPTIONS
const allowedOrigins = [
    'http://localhost:3000'
];


const corsOptions = {
    fn: (origin, callback) => {
        // allow requests with no origin (like mobile apps, ESP8266, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}


app.use(express.json());

if (process.env.APP === 'Development') app.use(debugLogger);

app.use(httpLogger);

// Files    
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'src', 'uploads'))
);
app.use(cors({
    origin: corsOptions.fn,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {

    logger.info("Service started Successfully");
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString(),
        service: 'FingerPrint Service'
    });

});

// REQUEST BODY JSON ENCODING
// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/student', StudentRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/fingerprint', fingerprintRoutes);
app.use('/api/fingerprints', fingerprintRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/fingerprint', fingerprintRoutes);
app.use('/api/mail', mailRoutes)


process.on("SIGINT", async () => {
    try {
        console.log("Server shutting down...");
        await sequelize.close();
        console.log("Server shutdown successfully ...");
        process.exit(0);

    }
    catch (error) {
        console.error('Error closing database connection:', error);
    }
});

module.exports = app;   
