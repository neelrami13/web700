/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Neel Hiteshkumar Rami Student ID: 154568232 Date: 31/07/2024
*
* Online (Heroku) Link: https://enigmatic-sands-27256-132c140ddab2.herokuapp.com/
*
********************************************************************************/

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const collegeData = require('./collegeDATA.js');

const app = express();
const PORT = process.env.PORT || 8080;

// Register Handlebars helpers
const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

hbs.handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

// Set Handlebars as the template engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

// Middleware to handle the static files
app.use(express.static('public'));

// Middleware to parse URL-encoded bodies (from form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to set the active route
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo', { title: 'HTML Demo' });
});

app.get("/students/add", (req, res) => {
    collegeData.getCourses().then((data) => {
        res.render("addStudent", { courses: data });
    }).catch(() => {
        res.render("addStudent", { courses: [] });
    });
});


// Data-related routes
app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            if (data.length > 0) {
                res.render("courses", { courses: data });
            } else {
                res.render("courses", { message: "no results" });
            }
            
        })
        .catch((err) => {
            res.render('courses', { message: "no results" });
        });
});

app.get('/students', (req, res) => {
    collegeData.getAllStudents()
        .then((students) => {
            res.render('students', { students: students });
        })
        .catch((error) => {
            res.status(500).send("Unable to retrieve students: " + error);
        });
});


app.get('/course/:id', (req, res) => {
    const id = req.params.id;
    collegeData.getCourseById(id)
        .then((course) => {
            res.render('course', { course: course });
        })
        .catch((err) => {
            res.render('course', { message: "No results" });
        });
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};
    
    collegeData.getStudentByNum(req.params.studentNum).then((studentData) => {
        viewData.student = studentData || null;
    }).catch(() => {
        viewData.student = null;
    }).then(collegeData.getCourses)
    .then((coursesData) => {
        viewData.courses = coursesData || [];
        viewData.courses.forEach(course => {
            if (course.courseId == viewData.student.course) {
                course.selected = true;
            }
        });
    }).catch(() => {
        viewData.courses = [];
    }).then(() => {
        if (!viewData.student) {
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData });
        }
    });
});

app.get('/students/update/:studentNum', async (req, res) => {
    try {
        console.log("Fetching student with studentNum:", req.params.studentNum);
        const student = await collegeData.Student.findOne({ where: { studentNum: req.params.studentNum }, raw: true });
        const courses = await collegeData.Course.findAll({ raw: true });
        //console.log("Student fetched:", student);
        //console.log("Courses fetched:", courses);
      if (student) {
        res.render('updateStudent', { student, courses });
      } else {
        res.status(404).send("Student not found");
      }
    } catch (err) {
        console.error("Error retrieving student:", err);
      res.status(500).send("Error retrieving student");
    }
  });

  app.post('/students/update/:studentNum', async (req, res) => {
    try {
        const studentData = {
            studentNum: req.params.studentNum,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            addressStreet: req.body.addressStreet,
            addressCity: req.body.addressCity,
            addressProvince: req.body.addressProvince,
            TA: req.body.TA, // Ensure proper handling of boolean values
            status: req.body.status,
            course: req.body.course
        };

        await collegeData.updateStudent(studentData);
        res.redirect('/students');
    } catch (err) {
        console.error("Error updating student:", err);
        res.status(500).send("Error updating student");
    }
});
  

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
      .then(() => {
        res.redirect("/students");
      })
      .catch((error) => {
        console.error("Add Student Error:", error);
        res.status(500).send("Unable to add student");
      });
});

app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((err) => {
            console.error("Add Student Error:", err);
            res.status(500).send("Unable to Add Course: ");
        });
});

app.get('/courses/update/:id', async (req, res) => {
    try {
        console.log("Fetching course with id:", req.params.id);
        //const student = await collegeData.Student.findOne({ where: { studentNum: req.params.studentNum }, raw: true });
        const course = await collegeData.Course.findOne({ where: { courseId: req.params.id }, raw: true });
        //console.log("Student fetched:", student);
        console.log("Courses fetched:", course);
      if (course) {
        res.render('updateCourse', { course });
      } else {
        res.status(404).send("Course not found");
      }
    } catch (err) {
        console.error("Error retrieving course:", err);
      res.status(500).send("Error retrieving course");
    }
  });

app.post('/courses/update/:id', async (req, res) => {
    try {
        const courseData = {
            courseId: req.params.id,
            courseCode: req.body.courseCode,
            courseDescription: req.body.courseDescription,
        };

        await collegeData.updateCourse(courseData);
        res.redirect('/courses');
    } catch (err) {
        console.error("Error updating course:", err);
        res.status(500).send("Error updating course");
    }
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((data) => {
            if (data) {
                res.render("course", { course: data });
            } else {
                res.status(404).send("Course Not Found");
            }
        })
        .catch(() => res.status(500).send("Error retrieving course"));
});

// app.get("/course/delete/:id", (req, res) => {
//     collegeData.deleteCourseById(req.params.id)
//         .then(() => res.redirect("/courses"))
//         .catch(() => res.status(500).send("Unable to Remove Course!"));
// });

app.get('/course/delete/:id', async (req, res) => {
    try {
        const courseId = parseInt(req.params.id, 10);  // Ensure courseId is an integer

        if (isNaN(courseId)) {
            throw new Error("Invalid course ID");
        }

        const deletedCount = await collegeData.Course.destroy({
            where: { courseId: courseId }
        });

        if (deletedCount > 0) {
            res.redirect('/courses');
        } else {
            res.status(404).send("Course not found");
        }
    } catch (err) {
        console.error("Error deleting course:", err);
        res.status(500).send("Error deleting course");
    }
});


app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum).then(() => {
        res.redirect("/students");
    }).catch((error) => {
        res.status(500).send("Unable to Remove Student / Student not found");
    });
});

// Start the server
collegeData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(`Unable to start server: ${err}`);
    });
