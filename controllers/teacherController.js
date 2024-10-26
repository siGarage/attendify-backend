import TEACHER from "../models/teacherModel.js";
import USER from "../models/userModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
import bcrypt from "bcryptjs";
import Teacher from "../models/teacherModel.js";
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
        role: request.role,
        password: password,
      };
      const user = await USER.create(userModelRequest);
      let nrequest = { ...request, user_id: user._id };
      let teacher = await TEACHER.create(nrequest);
      return res.status(201).send({
        status_code: 201,
        teacher: teacher,
        message: "Teacher created successfully",
      });
    } catch (err) {
      console.log(err);
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
  },
  async createTeacherByCsv(req, res) {
    try {
      var csvData = [];
      const requiredKeys = [
        "name",
        "emp_id",
        "current_address",
        "email",
        "permanent_address",
        "department_id",
        "gender",
        "dob",
        "permanent_address",
        "current_address",
        "phone_no",
      ];
      const jsonObj = await csv().fromFile(req.file.path);
      for (const item of jsonObj) {
        const result = checkMissingKeys(item, requiredKeys);
        if (result.length === 0) {
          csvData.push({
            name: item.name,
            emp_id: item.roll_no,
            phone_no: item.phone_no,
            current_address: item.current_address,
            permanent_address: item.permanent_address,
            gender: item.gender,
            dob: item.dob,
            email: item.email,
            department_id: item.department_id,
            designation: item.designation,
          });
        } else {
          return res.status(202).send({
            status_code: 202,
            message: `You have these missing fields in your csv: ${result}`,
          });
        }
      }
      console.log(csvData);
      let usersList = await USER.insertMany(csvData);
      console.log(usersList);
      await Teacher.insertMany(csvData);
      return res.status(201).send({
        status_code: 201,
        message: "Teacher created successfully",
      });
      // await csv()
      //   .fromFile(req.file.path)
      //   .then(async (jsonObj) => {
      //     for (var x = 0; x < jsonObj.length; x++) {
      //       const result = checkMissingKeys(jsonObj[x], requiredKeys);
      //       if (result?.length == 0) {
      //         csvData.push({
      //           name: jsonObj[x].name,
      //           roll_no: jsonObj[x].roll_no,
      //           father_name: jsonObj[x].father_name,
      //           phone_no: jsonObj[x].phone_no,
      //           guardian_no: jsonObj[x].guardian_no,
      //           current_address: jsonObj[x].current_address,
      //           permanent_address: jsonObj[x].permanent_address,
      //           batch: jsonObj[x].batch,
      //           gender: jsonObj[x].gender,
      //           dob: jsonObj[x].dob,
      //           email: jsonObj[x].email,
      //           course_id: req.body.course_id,
      //           semester_id: req.body.semester_id,
      //         });
      //       } else {
      //         return res.status(202).send({
      //           status_code: 202,
      //           message: `You have these missing fields in your csv ${result}`,
      //         });
      //       }
      //     }
      //     await STUDENT.insertMany(csvData);
      //     return res.status(204).send({
      //       status_code: 201,
      //       message: "Student created successfully",
      //     });
      //   });
    } catch (err) {
      console.log(err);
    }
  },
};
