import STUDENT from "../models/studentModel.js";
import USER from "../models/userModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import csv from "csvtojson";


export default {
  //Student create
  async createStudent(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      request.avatar =
        req?.file == undefined
          ? null
          : req?.file?.filename != undefined && req?.file?.filename;
      let validation = new Validator(request, {
        name: "required|string",
        email: "required|email",
        phone_no: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      let exist = await USER.findOne({ email: request.email });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This email is already exists!" });
      }
      const user = await USER.create(request);
      let nrequest = { ...request, user_id: user._id };
      let student = await STUDENT.create(nrequest);
      return res.status(201).send({
        status_code: 201,
        student: student,
        message: "Student created successfully",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student List
  async getStudentList(req, res) {
    try {
      let students = await STUDENT.find();
      return res.status(200).json(students);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Student
  async deleteStudent(req, res) {
    try {
      let id = req.query.id;
      const studentId = await STUDENT.findById(id);
      if (studentId) {
        await User.findByIdAndRemove(studentId.user_id);
        const student = await STUDENT.findByIdAndRemove(id);
        if (!student) {
          return res.status(404).send({ message: "Student not found." });
        }
        return res.status(204).send({
          status_code: 201,
          id: id,
          message: "Student deleted successfully.",
        });
      }
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  //Update Student
  // async updateStudent(req, res) {
  //     try {
  //         let request = req.body;
  //         const image = req?.file?.filename;
  //         if (!request) {
  //             return res.json(reply.failed("All input is required"));
  //         }
  //         const examMain = await Exam.findById({ _id: req.body.id });
  //         if (!examMain) {
  //             return res.json(reply.failed("Exam not found!!"))
  //         }
  //         var exam = await Exam.findOneAndUpdate(
  //             { _id: req.body.id },
  //             {
  //                 $set: {
  //                     image: image,
  //                     name: req.body.name,
  //                     description: req.body.description,
  //                     elg_class: req.body.elg_class,
  //                     elg_dob: req.body.elg_dob,
  //                     admission_process: req.body.admission_process,
  //                     language: req.body.language,
  //                     examSeats: req.body.examSeats,
  //                     date_exam: req.body.date_exam,
  //                     shortName: req.body.shortName
  //                 },
  //             }
  //         );
  //         if (exam) {
  //             return res.status(200).send({ "exam": exam, message: "Exam updated successfully." });
  //         }
  //         return res.status(200).send({users: request, message: "Exam updated successfully." });
  //     } catch (err) {
  //         console.log(err);
  //         return res.status(400).send(err)
  //     }
  // },

  // Get Student By Id
  async getStudentById(req, res) {
    try {
      const student = await STUDENT.findById(req.body.id);
      return res.status(200).json(student);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async createStudentByCsv(req, res) {
    var csvData = [];
    csv()
      .fromFile(req.file.path)
      .then(async (jsonObj) => {
        for (var x = 0; x < jsonObj.length; x++) {
          csvData.push({
            name: jsonObj[x].name,
            roll_no: jsonObj[x].roll_no,
            father_name: jsonObj[x].father_name,
            phone_no: jsonObj[x].phone_no,
            guardian_no: jsonObj[x].guardian_no,
            current_address: jsonObj[x].current_address,
            permanent_address: jsonObj[x].permanent_address,
            batch: jsonObj[x].batch,
            gender: jsonObj[x].gender,
            dob: jsonObj[x].dob,
            email: jsonObj[x].email,
            course_id: req.body.course_id,
            semester_id: req.body.semester_id
          });
        }
        await STUDENT.insertMany(csvData);
        return res.status(204).send({
          status_code: 201,
          message: "Student created successfully",
        });
      });
  },
};