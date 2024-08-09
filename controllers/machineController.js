import STUDENT from "../models/studentModel.js";
import SUBJECT from "../models/subjectModel.js";
import COURSE from "../models/courseModel.js";
import STUDENTATTENDENCE from "../models/studentAttendenceModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
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

  // Get Courses List
  async createStudentAttendanceData(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      let validation = new Validator(request, {
        student_id: "required",
        type: "required",
        semester_id: "required",
        roll_no: "required",
        course_id: "required",
        subject_id: "required",
        a_date: "required",
        attendance_status:"required",
        machine_id: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.status(409).json(reply.failed(validation.errors.first(err_key)));
      }
      let exist = await STUDENTATTENDENCE.findOne({
        student_id: request.student_id,
        type: request.type,
        subject_id: request.subject_id,
        a_date: request.a_date,
      });
      if (exist) {
        return res.status(409).send({
          message:
            "This student attendence are already exists for this subject type.",
        });
      }
      let studentAttendence = await STUDENTATTENDENCE.create(request);
      return res.status(200).send({
        studentAttendence: studentAttendence,
        message: "Student Attendence created successfully",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  async createStudentBioMetricData(req, res) {
    try {
      let request = req.body;
      console.log("k1");
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      console.log("k2");
      console.log(Object.keys(request).length == 0);
      let validation = new Validator(request, {
        student_id: "required",
        finger_id: "required",
        face_id: "required",
      });
      console.log(validation);
      if (validation.fails()) {
        console.log('test')
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      let exist = await STUDENTATTENDENCE.findOne({
        student_id: request.student_id,
      });
      console.log("exist");
      if (exist) {
        return res.status(409).send({
          message: "This student biometric are already exists.",
        });
      }
      let studentBiometric = await STUDENTATTENDENCE.create(request);
      return res.status(200).send({
        studentAttendance: studentBiometric,
        message: "Student Biometric created successfully",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
