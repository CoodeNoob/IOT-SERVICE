const express = require('express');
const path = require('path');
const app = express();

//ROUTES
const authRoutes = require('./src/routes/auth.route');
const StudentRoutes = require('./src/routes/student.route');

app.use(express.json());

// Files    
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'src', 'uploads'))
);
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