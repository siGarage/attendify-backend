import STUDENT from "../models/studentModel.js";
import USER from "../models/userModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import csv from "csvtojson";
function checkMissingKeys(obj, requiredKeys) {
  const missingKeys = requiredKeys.filter(
    (key) => !obj.hasOwnProperty(key) || obj[key].trim() === ""
  );

  if (missingKeys.length > 0) {
    return missingKeys.join(", ");
  } else {
    return missingKeys;
  }
}
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
      let exist = await STUDENT.findOne({ email: request.email });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This email is already exists!" });
      }
      let password = bcrypt.hashSync(request.dob);
      let phone_no = request.phone_no;
      const user = await USER.create({
        ...request,
        password: password,
        phone_no: phone_no,
      });
      let nrequest = { ...request, user_id: user._id };
      let student = await STUDENT.create(nrequest);
      return res.status(201).send({
        status_code: 201,
        student: student,
        message: "Student created successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student List
  async getStudentList(req, res) {
    try {
      let students = await STUDENT.find({}).sort({ roll_no: -1 });
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

  // Update Student
  async updateStudent(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const student = await STUDENT.findById(_id);
      if (!student) {
        return res.status(404).send({ message: "Student not found" });
      }
      await STUDENT.findByIdAndUpdate(_id, request);
      return res.status(201).send({ message: "Student updated successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

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
    try {
      var csvData = [];
      const requiredKeys = [
        "name",
        "roll_no",
        "batch",
        "father_name",
        "email",
        "gender",
        "dob",
        "permanent_address",
        "current_address",
        "phone_no",
        "guardian_no",
      ];
      const jsonObj = await csv().fromFile(req.file.path);
      for (const item of jsonObj) {
        const result = checkMissingKeys(item, requiredKeys);
        if (result.length === 0) {
          let password = bcrypt.hashSync(item.dob);
          csvData.push({
            name: item.name,
            roll_no: item.roll_no,
            father_name: item.father_name,
            phone_no: item.phone_no,
            guardian_no: item.guardian_no,
            current_address: item.current_address,
            permanent_address: item.permanent_address,
            batch: item.batch,
            password: password,
            gender: item.gender,
            dob: item.dob,
            email: item.email,
            course_id: req.body.course_id,
            semester_id: req.body.semester_id,
            role: "4",
          });
        } else {
          return res.status(202).send({
            status_code: 202,
            message: `You have these missing fields in your csv: ${result}`,
          });
        }
      }
      const usersList = await User.insertMany(csvData);
      const finalData = csvData.map((tea) => {
        const usersListAfterMerge = usersList.find(
          (user) => user.email === tea.email
        );
        return {
          ...tea,
          user_id: usersListAfterMerge._id.toString(),
        };
      });
      STUDENT.insertMany(finalData);
      return res.status(201).send({
        status_code: 201,
        message: "Student created successfully",
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
