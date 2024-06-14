/*********************************************************************************
* WEB700 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ______________________ Student ID: ______________ Date: ________________
*
********************************************************************************/

const express = require('express');
const path = require('path');
const collegeData = require('./collegeDATA');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Route to get all TAs
app.get('/tas', (req, res) => {
    collegeData.getTAs().then(tas => {
        res.json(tas);
    }).catch(err => {
        res.json({ message: "no results" });
    });
});

// Route to get all courses
app.get('/courses', (req, res) => {
    collegeData.getCourses().then(courses => {
        res.json(courses);
    }).catch(err => {
        res.json({ message: "no results" });
    });
});

// Route to get a single student by student number
app.get('/student/:num', (req, res) => {
    const studentNum = req.params.num;
    collegeData.getStudentByNum(studentNum).then(student => {
        res.json(student);
    }).catch(err => {
        res.json({ message: "no results" });
    });
});

// Route to return home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

// Route to return about.html
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Route to return htmlDemo.html
app.get('/htmlDemo', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/htmlDemo.html'));
});

// Catch-all route for unmatched routes
app.use((req, res) => {
    res.status(404).send("Page Not THERE, Are you sure of the path?");
});

// Initialize and start the server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on port ${HTTP_PORT}`);
    });
}).catch(err => {
    console.error(`Failed to initialize data: ${err}`);
});
