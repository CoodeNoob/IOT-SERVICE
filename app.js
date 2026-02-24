const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

//ROUTES
const authRoutes = require('./src/routes/auth.route');
const StudentRoutes = require('./src/routes/student.route');



//CORS OPTIONS
const allowOrigin = [
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


// APP ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/student', StudentRoutes);

module.exports = app;   