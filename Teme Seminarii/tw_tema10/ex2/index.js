// Express Initialisation
const express = require("express");
const app = express();
const port = 3000;

// Sequelize Initialisation
const sequelize = require("./sequelize");

// Import created models
const University = require("./models/university");
const Student = require("./models/student");
const Course = require("./models/course");
const { Op } = require("sequelize");

// Express middleware
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// Define the model relationship.
University.hasMany(Student);
Student.belongsTo(University);

University.hasMany(Course);
Course.belongsTo(University);

Student.belongsToMany(Course, { through: 'enrollements' });
Course.belongsToMany(Student, { through: 'enrollements' });

// Kickstart the Express aplication
app.listen(port, () => {
  console.log("The server is running on http://localhost:" + port);
});

// Create a middleware to handle 500 status errors.
app.use((err, req, res, next) => {
  console.error("[ERROR]:" + err);
  res.status(500).json({ message: "500 - Server Error" });
});

/**
 * Create a special GET endpoint so that when it is called it will
 * sync our database with the models.
 */
app.get("/create", async (req, res, next) => {
  try {
    await sequelize.sync({ force: true });
    res.status(201).json({ message: "Database created with the models." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET all the universities from the database.
 */
app.get("/universities", async (req, res, next) => {
  try {
    const universities = await University.findAll();
    res.status(200).json(universities);
  } catch (err) {
    next(err);
  }
});

/**
 * POST a new university to the database.
 */
app.post("/university", async (req, res, next) => {
  try {
    await University.create(req.body);
    res.status(201).json({ message: "University Created!" });
  } catch (err) {
    next(err);
  }
});

/**
 * GET all students.
 */
app.get("/students", async (req, res, next) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (err) {
    next(err);
  }
});

/**
 * POST a new student into a university.
 */
app.post("/universities/:universityId/students", async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.universityId);
    if (university) {
      const student = new Student(req.body);
      student.universityId = university.id;
      await student.save();
      res.status(201).json({ message: 'Student crated!'});
    } else {
      res.status(404).json({ message: '404 - University Not Found'});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET all the students from a university using include.
 */
app.get("/universities/:universityId/students", async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.universityId, {
      include: [Student]
    });
    if (university) {
      res.status(200).json(university.students);
    } else {
      res.status(404).json({ message: '404 - University Not Found!'});
    }
  } catch(error) {
    next(error);
  }
});

// get specific student from a university

app.get("/universities/:universityId/students/:studentId", async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.universityId , {
        include: [{
            model: Student,
            where: { id: req.params.studentId }
        }]
    });

    if (!university) {
      res.status(404).json({ message: '404 - University Not Found!'});
      return res.status(404).json({ message: '404 - Student Not Found!'});
    }

    res.status(200).json(university.students[0]);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT in order to update a student from a university.
 */
app.put("/universities/:universityId/students/:studentId", async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.universityId);
    if (university) {
      const stundents = await university.getStudents({ id: req.params.studentId });
      const student = stundents.shift();
      if (student) {
        student.studentFullName = req.body.fullName;
        student.studentStatus = req.body.status;
        await student.save();
        res.status(202).json({ message: 'Student updated!' });
      } else {
        res.status(404).json({ message: '404 - Student Not Found!'});
      }
    } else {
      res.status(404).json({ message: '404 - University Not Found!'});
    }
  } catch (error) {
    next(error);
  }
});

//delete student from a university

app.delete("/universities/:universityId/students/:studentId", async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.universityId);

    if (!university) {
      return res.status(404).json({ message: "404 - University Not Found!" });
    }

    const students = await university.getStudents({
      where: { id: req.params.studentId }
    });

    const student = students[0];

    if (!student) {
      return res.status(404).json({ message: "404 - Student Not Found!" });
    }

    await student.destroy();
    res.status(202).json({ message: "Student deleted!" });

  } catch (error) {
    next(error);
  }
});

app.delete('/universities/:universityId/courses/:courseId/enrollements/:studentId', 
  async (request, response, next) => {
    try {

      const university = await University.findByPk(request.params.universityId);

      if (!university) {
        return response.sendStatus(404);
      }

      const courses = await university.getCourses({
        where: { id: request.params.courseId }
      });

      const course = courses[0];

      if (!course) {
        return response.sendStatus(404);
      }

 
      const students = await course.getStudents({
        where: { id: request.params.studentId }
      });

      const student = students[0];

      if (!student) {
        return response.sendStatus(404);
      }

      await course.removeStudent(student);

      return response.sendStatus(204);

    } catch (error) {
      next(error);
    }
});

// GET enrollements for a student in a university

app.get('/universities/:universityId/students/:studentId/enrollements', 
  async (req, res, next) => {
    try {

      const university = await University.findByPk(req.params.universityId);

      if (!university) {
        return res.status(404).json({ message: 'University Not Found' });
      }


      const students = await university.getStudents({
        where: { id: req.params.studentId }
      });

      const student = students[0];

      if (!student) {
        return res.status(404).json({ message: 'Student Not Found' });
      }


      const courses = await student.getCourses({
        attributes: ['id', 'name']
      });

      if (!courses.length) {
        return res.status(404).json({ message: 'No Enrollements Found' });
      }


      res.status(200).json(courses);

    } catch (error) {
      next(error);
    }
});

app.post("/course", async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.json(course);
  } catch (e) {
    res.json(e);
  }
});

// app.post("/enrol/:studentId/:courseId", async (req, res) => {
//   const student = await Student.findByPk(req.params.studentId);
//   const course = await Course.findByPk(req.params.courseId);

//   await student.addCourse(course);

//   res.json({ message: "Enrolled!" });
// });

// app.post("/universities/:universityId/students/:studentId/enrollements/:courseId",
//   async (req, res, next) => {
//     try {
//       const university = await University.findByPk(req.params.universityId);
//       if (!university) return res.status(404).json({ message: "University Not Found" });

//       const students = await university.getStudents({
//         where: { id: req.params.studentId }
//       });

//       const student = students[0];
//       if (!student) return res.status(404).json({ message: "Student Not Found" });

//       const courses = await university.getCourses({
//         where: { id: req.params.courseId }
//       });

//       const course = courses[0];
//       if (!course) return res.status(404).json({ message: "Course Not Found" });

//       await student.addCourse(course);

//       res.status(201).json({ message: "Student enrolled to course!" });

//     } catch (error) {
//       next(error);
//     }
// });

// app.get("/universities/:universityId/courses", async (req, res, next) => {
//   try {
//     const university = await University.findByPk(req.params.universityId, {
//       include: [Course]
//     });

//     if (!university) return res.status(404).json({ message: "University Not Found" });

//     res.status(200).json(university.courses);

//   } catch (error) {
//     next(error);
//   }
// });


app.post('/', async (req, res, next) => {
  try {
    const body = req.body;

    const university = await University.create({
      universityName: body.name
    });


    const registry = {};

    for (let s of body.students) {
      const student = await Student.create({
        studentFullName: `${s.firstName} ${s.lastName}`,
        studentStatus: "ACTIVE",
        universityId: university.id
      });

      registry[s.key] = student;
    }


    for (let c of body.courses) {
      const course = await Course.create({
        name: c.name,
        universityId: university.id
      });

      registry[c.key] = course;
    }


    for (let e of body.enrollements) {
      const student = registry[e.studentKey];
      const course = registry[e.courseKey];

      await student.addCourse(course);
    }

    res.status(201).json({ message: "Import completed!" });

  } catch (error) {
    next(error);
  }
});



app.get("/", async (req, res, next) => {
  try {
    const universities = await University.findAll({
      include: [
        { model: Student },   
        { model: Course }     
      ]
    });

    const result = [];

    for (const uni of universities) {
      const enrollements = [];

      for (const student of uni.students) {
        const courses = await student.getCourses();  

        for (const course of courses) {
          enrollements.push({
            studentId: student.id,
            courseId: course.id
          });
        }
      }

      result.push({
        id: uni.id,
        name: uni.universityName,

        students: uni.students.map(s => ({
          id: s.id,
          name: s.studentFullName,
          status: s.studentStatus
        })),

        courses: uni.courses.map(c => ({
          id: c.id,
          name: c.name
        })),

        enrollements 
      });
    }

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});
