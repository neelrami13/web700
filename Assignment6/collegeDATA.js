const Sequelize = require('sequelize');

// Replace these values with your actual PostgreSQL credentials
const sequelize = new Sequelize('postgres', 'postgres', 'neel1321', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        //ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define models here
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'studentnum'
    },
    firstName: {
        type: Sequelize.STRING,
        field: 'firstname' // match the column name in your PostgreSQL table
    },
    lastName: {
        type: Sequelize.STRING,
        field: 'lastname' // match the column name in your PostgreSQL table
    },
    email: {
        type: Sequelize.STRING,
        field: 'email' // match the column name in your PostgreSQL table
    },
    addressStreet: {
        type: Sequelize.STRING,
        field: 'addressstreet' // match the column name in your PostgreSQL table
    },
    addressCity: {
        type: Sequelize.STRING,
        field: 'addresscity' // match the column name in your PostgreSQL table
    },
    addressProvince: {
        type: Sequelize.STRING,
        field: 'addressprovince' // match the column name in your PostgreSQL table
    },
    TA: {
        type: Sequelize.BOOLEAN,
        field: 'ta' // match the column name in your PostgreSQL table
    },
    status: {
        type: Sequelize.STRING,
        field: 'status' // match the column name in your PostgreSQL table
    },
    course: {
        type: Sequelize.INTEGER,
        field: 'course' // match the column name in your PostgreSQL table
    }
}, {
    tableName: 'students', // match the table name in your PostgreSQL database
    timestamps: false
});

const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'courseid'
    },
    courseCode: {
        type: Sequelize.STRING,
        field: 'coursecode'
    },
    courseDescription: {
        type: Sequelize.STRING,
        field: 'coursedescription'
    }
}, {
    tableName: 'courses', // match the table name in your PostgreSQL database
    timestamps: false
});

module.exports = {
    Student,
    Course,
    sequelize
};

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.authenticate()
            .then(() => resolve())
            .catch((err) => reject("Unable to sync the database: " + err));
    });
};

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then((students) => resolve(students))
            .catch((err) => reject("Unable to fetch students: " + err));
    });
};

module.exports.getStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.findOne({ where: { studentNum: studentNum } })
            .then((student) => resolve(student))
            .catch((err) => reject("Unable to fetch student: " + err));
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then((courses) => resolve(courses))
            .catch((err) => reject("Unable to fetch courses: " + err));
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findOne({ where: { courseId: id } })
            .then((course) => resolve(course))
            .catch((err) => reject("Unable to fetch course: " + err));
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        //console.log("Updating student with data:", studentData);

        // Ensure studentNum is defined
        if (!studentData.studentNum) {
            console.error("Missing studentNum in update data");
            return reject("Student number is missing");
        }

        Student.update({
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            addressStreet: studentData.addressStreet,
            addressCity: studentData.addressCity,
            addressProvince: studentData.addressProvince,
            TA: studentData.TA === 'on', // Handle boolean conversion if needed
            status: studentData.status,
            course: studentData.course
        }, {
            where: { studentNum: studentData.studentNum }
        })
        .then(([affectedRows]) => {
            if (affectedRows > 0) {
                resolve();
            } else {
                reject("No student found to update");
            }
        })
        .catch(err => {
            console.error("Error updating student:", err);
            reject("Unable to update student");
        });
    });
};


// module.exports.addStudent = function (studentData) {
//     return new Promise((resolve, reject) => {
//         Student.create(studentData)
//             .then(() => resolve())
//             .catch(() => reject("Unable to create student"));
//     });
// };

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        for (const key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }
        console.log("Student Data to be added: ", studentData);
        Student.create(studentData)
            .then(() => resolve())
            .catch((err) => {
                console.log("Error creating student: ", err);
                reject("Unable to create student: " + err.message);
            });
    });
};


// Ensure all blank values are set to null
module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (const key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }
        console.log("Course Data to be added: ", courseData);
        Course.create(courseData)
            .then(() => resolve())
            .catch((err) => {
                console.log("Error creating course: ", err);
                reject("Unable to create course: " + err.message);
            });
    });
};

// Ensure all blank values are set to null
// module.exports.updateCourse = function (courseData) {
//     return new Promise((resolve, reject) => {
//         for (const key in courseData) {
//             if (courseData[key] === "") {
//                 courseData[key] = null;
//             }
//         }
//         Course.update(courseData, {
//             where: { courseId: courseData.courseId }
//         })
//             .then(() => resolve())
//             .catch(() => reject("Unable to update course"));
//     });
// };
module.exports.updateCourse = function (courseData) {
    return new Promise(async (resolve, reject) => {
        // Log the courseData for debugging
        console.log("Updating course with data:", courseData);

        // Ensure courseId is defined
        if (!courseData.courseId) {
            console.error("Missing courseId in update data");
            return reject("Course ID is missing");
        }

        try {
            // Fetch the course to verify it exists
            const course = await Course.findByPk(courseData.courseId);
            if (!course) {
                return reject("No course found with the provided ID");
            }

            // Update the course
            const [affectedRows] = await Course.update({
                courseCode: courseData.courseCode,
                courseDescription: courseData.courseDescription,
            }, {
                where: { courseId: courseData.courseId }
            });

            if (affectedRows > 0) {
                resolve();
            } else {
                reject("No course found to update");
            }
        } catch (err) {
            console.error("Error updating course:", err);
            reject("Unable to update course");
        }
    });
};


module.exports.deleteCourseById = function (courseId) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: { courseId: courseId }
        })
            .then((result) => {
                if (result > 0) {
                    resolve();
                } else {
                    reject("Course not found");
                }
            })
            .catch((err) => {
                console.error("Error deleting course: ", err); // Log the error for debugging
                reject("Unable to delete course: " + err.message);
            });
    });
};


module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: { studentNum: studentNum }
        })
            .then((result) => {
                if (result > 0) {
                    resolve();
                } else {
                    reject("Student not found");
                }
            })
            .catch((error) => {
                reject("Unable to remove student: " + error);
            });
    });
};
