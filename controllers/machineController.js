import STUDENT from "../models/studentModel.js";
import SUBJECT from "../models/subjectModel.js";
import COURSE from "../models/courseModel.js";
import STUDENTATTENDENCE from "../models/studentAttendenceModel.js";
// import LASTUPDATE from "../models/lastUpdateAttendanceModel.js";
import SEMESTER from "../models/semesterModel.js";
import Validator from "validatorjs";
import BIOMETRIC from "../models/biometricModel.js";
import USER from "../models/userModel.js";
import TEACHER from "../models/teacherModel.js";
import reply from "../common/reply.js";
import LastUpdatedAttendance from "../models/lastUpdateAttendanceModel.js";
import TeacherAttendence from "../models/teacherAttendenceModel.js";
import StudentAttendence from "../models/studentAttendenceModel.js";
function findHighestDate(data) {
  let highestDate = null;
  for (const item of data) {
    const date = item.a_date;
    if (!highestDate || date > highestDate) {
      highestDate = date;
    }
  }
  return highestDate;
}
function mergeArrays(filteredData, bios) {
  const mergedArray = [];
  filteredData.forEach(async (attendance) => {
    const matchingStudent = bios.find(
      (student) => student._id.toHexString() === attendance.student_id
    );
    if (matchingStudent) {
      mergedArray.push({
        ...attendance,
        roll_no: matchingStudent._doc.roll_no,
        batch: matchingStudent._doc.batch,
      });
    } else {
      mergedArray.push(attendance);
    }
  });
  return mergedArray;
}
function mergeTArrays(filteredData, bios) {
  const mergedArray = [];
  filteredData.forEach(async (attendance) => {
    const matchingStudent = bios.find(
      (student) => student._id.toHexString() === attendance.teacher_id
    );
    if (matchingStudent) {
      mergedArray.push({
        ...attendance,
        emp_id: matchingStudent._doc.emp_id,
      });
    } else {
      mergedArray.push(attendance);
    }
  });
  return mergedArray;
}
export default {
  // Get Student List
  async fetchStudentsData(req, res) {
    try {
      let students = await STUDENT.find({}).select(
        "roll_no name _id semester_id"
      );
      return res.status(200).json(students);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  // Get Subjects List
  async fetchSubjectsData(req, res) {
    try {
      let subjects = await SUBJECT.find({}).select(
        "_id name theory practical others clinical"
      );
      return res.status(200).json(subjects);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  // Get Courses List
  async fetchCoursesData(req, res) {
    try {
      let courses = await COURSE.find({}).select("_id name");
      return res.status(200).json(courses);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Phases List
  async fetchPhasesData(req, res) {
    try {
      let phases = await SEMESTER.find({}).select("_id name course_id");
      return res.status(200).json(phases);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Courses List
  async createStudentAttendanceData(req, res) {
    try {
      let request = req.body;
      const bodyData = req.body;
      const students = await STUDENT.find({});
      const final = mergeArrays(bodyData, students);
      for (const item of final) {
        let exit = await STUDENTATTENDENCE.findOne({ item });
        if (!exit) {
          const attendance = new STUDENTATTENDENCE(item);
          await attendance.save();
        }
      }
      let highestDate = findHighestDate(request);
      if (highestDate) {
        await LastUpdatedAttendance.findOne({
          machine_id: request[0].machine_id,
        }).then(async (doc) => {
          if (doc) {
            let id = doc._id;
            let uLastData = {
              machine_id: request[0].machine_id,
              role: "Student",
              lastUpdate: highestDate,
            };
            await LastUpdatedAttendance.findOneAndUpdate(
              { _id: id },
              uLastData
            );
            return res.status(200).send({
              message: "Student Attendence created successfully",
            });
          } else {
            let lastData = {
              machine_id: request[0].machine_id,
              lastUpdate: highestDate,
              role: "Student",
            };
            const lastUdpate = new LastUpdatedAttendance(lastData);
            await lastUdpate.save();
            return res.status(200).send({
              message: "Student Attendence created successfully",
            });
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },

  async createTeacherAttendanceData(req, res) {
    try {
      let request = req.body;
      const bodyData = req.body;
      const teachers = await TEACHER.find({});
      const final = mergeTArrays(bodyData, teachers);
      for (const item of final) {
        let exit = await TeacherAttendence.findOne({ item });
        if (!exit) {
          const attendance = new TeacherAttendence(item);
          await attendance.save();
        }
      }
      let highestDate = findHighestDate(request);
      if (highestDate) {
        await LastUpdatedAttendance.findOne({
          machine_id: request[0].machine_id,
        }).then(async (doc) => {
          if (doc) {
            let id = doc._id;
            let uLastData = {
              machine_id: request[0].machine_id,
              role: "Teacher",
              lastUpdate: highestDate,
            };
            await LastUpdatedAttendance.findOneAndUpdate(
              { _id: id },
              uLastData
            );
            return res.status(200).send({
              message: "Teacher Attendence created successfully",
            });
          } else {
            let lastData = {
              machine_id: request[0].machine_id,
              lastUpdate: highestDate,
              role: "Teacher",
            };
            const lastUdpate = new LastUpdatedAttendance(lastData);
            await lastUdpate.save();
            return res.status(200).send({
              message: "Teacher Attendence created successfully",
            });
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },

  async getLastUpdate(req, res) {
    try {
      await LastUpdatedAttendance.findOne({
        machine_id: req.body.machine_id,
        role: req.body.role,
      }).then(async (doc) => {
        if (doc) {
          return res.status(200).send({
            ...doc._doc,
          });
        } else {
          return res.status(200).send({
            machine_id: req.body.machine_id,
            role: req.body.role,
            lastUpdate: null,
          });
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  },

  async createStudentBioMetricData(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      let validation = new Validator(request, {
        student_id: "required",
        finger_id_1: "required",
        finger_id_2: "required",
        finger_id_3: "required",
        face_id: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      let exist = await BIOMETRIC.findOne({
        student_id: request.student_id,
      });
      if (exist) {
        return res.status(409).send({
          message: "This student biometric are already exists.",
        });
      }
      let studentBiometric = await BIOMETRIC.create(request);
      return res.status(200).send({
        studentAttendance: studentBiometric,
        message: "Student Biometric created successfully",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async getTeacherDetails(req, res) {
    try {
      const teacher = await TEACHER.find();
      const user = await USER.find({});
      const combinedUserArray = user.map((user) => {
        const matchingProfile = teacher.find(
          (profile) => profile.user_id === user._id.toString()
        ); // Ensure correct user_id comparison

        if (matchingProfile) {
          return {
            id: user._id,
            name: user.name,
            emp_id: matchingProfile.emp_id || null, // Include emp_id if present, otherwise null
            password: user.password,
            email: user.email,
          };
        }

        // Handle cases where there's no matching profile
        return null; // Or provide a default object with null/placeholder values
      });
      const filteredCombinedUserArray = combinedUserArray.filter(
        (user) => user !== null
      ); // Remove null entries
      // console.log(filteredCombinedUserArray);
      return res.status(200).json(filteredCombinedUserArray);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async getStundentAttendance(req, res) {
    try {
      const stundentAttendance = await STUDENTATTENDENCE.find({});
      return res.status(200).json(stundentAttendance);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
