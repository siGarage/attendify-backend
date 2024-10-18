import TEACHER from "../models/teacherModel.js";
import USER from "../models/userModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
import bcrypt from "bcryptjs";
export default {
  //Teacher create
  async createTeacher(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
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
      let password = bcrypt.hashSync(request.dob);
      let userModelRequest = {
        name: request.name,
        email: request.email,
        phone_no: request.phone_no,
        role:request.role,
        password: password
      };
      console.log(userModelRequest,'userModelRequest');
      const user = await USER.create(userModelRequest);
      let nrequest = { ...request, user_id: user._id };
      let teacher = await TEACHER.create(nrequest);
      return res.status(201).send({
        status_code: 201,
        teacher: teacher,
        message: "Teacher created successfully",
      });
    } catch (err) {
      console.log(err)
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Teacher List
  async getTeacherList(req, res) {
    try {
      let students = await TEACHER.find();
      return res.status(200).json(students);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Teacher
  async deleteTeacher(req, res) {
    try {
      let id = req.query.id;
      const teacherId = await TEACHER.findById(id);
      if (teacherId) {
        await USER.findByIdAndRemove(teacherId.user_id);
        const teacher = await TEACHER.findByIdAndRemove(id);
        if (!teacher) {
          return res.status(404).send({ message: "Teacher not found." });
        }
        return res.status(204).send({
          status_code: 201,
          id: id,
          message: "Teacher deleted successfully.",
        });
      }
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  //Update Teacher
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

  // Get teacher By Id
  async getTeacherById(req, res) {
    try {
      const teacher = await TEACHER.findById(req.body.id);
      return res.status(200).json(teacher);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};


