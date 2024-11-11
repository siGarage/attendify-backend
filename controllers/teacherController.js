import Teacher from "../models/teacherModel.js";
import Users from "../models/userModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
import bcrypt from "bcryptjs";
import csv from "csvtojson";
import User from "../models/userModel.js";
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
      let exist = await Users.findOne({ email: request.email });
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
      const user = await Users.create(userModelRequest);
      let nrequest = { ...request, user_id: user._id };
      let teacher = await Teacher.create(nrequest);
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
      let students = await Teacher.find();
      return res.status(200).json(students);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Teacher
  async deleteTeacher(req, res) {
    try {
      let id = req.query.id;
      const teacherId = await Teacher.findById(id);
      if (teacherId) {
        await Users.findByIdAndRemove(teacherId.user_id);
        const teacher = await Teacher.findByIdAndRemove(id);
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
  async updateTeacher(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const reqTeacher = await Teacher.findById(_id);
      if (!reqTeacher) {
        return res.status(404).send({ message: "Teacher not found" });
      }
      const teachers = await Teacher.find({});
      const teacherList = teachers?.filter(
        (d) => d.department_id == req.body.department_id
      );
      const teacherUserIds = teacherList.map((d) => d.user_id);
      const Users = await User.find({});
      if (req.body.role == "2") {
        const filteredA2 = Users.filter(
          (record) =>
            teacherUserIds.includes(record._id.toString()) &&
            record.role === "2"
        );
        await User.findOneAndUpdate(
          { phone_no: filteredA2[0].phone_no },
          { $set: { role: "3" } },
          { new: true }
        );
        console.log(reqTeacher);
        await User.findOneAndUpdate(
          { phone_no: reqTeacher.phone_no },
          { $set: { role: "2" } },
          { new: true }
        );
        await Teacher.findByIdAndUpdate(_id, request);
        return res
          .status(201)
          .send({ teacher: request, message: "Teacher updated successfully" });
      } else {
        await Teacher.findByIdAndUpdate(_id, request);
        return res
          .status(201)
          .send({ teacher: request, message: "Teacher updated successfully" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get teacher By Id
  async getTeacherById(req, res) {
    try {
      const teacher = await Teacher.findById(req.body.id);
      return res.status(200).json(teacher);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  async createTeacherByCsv(req, res) {
    try {
      const csvData = [];
      const requiredKeys = [
        "name",
        "emp_id",
        "email",
        "permanent_address",
        "department_id",
        "gender",
        "dob",
        "permanent_address",
        "current_address",
        "phone_no",
      ];
      const parsedCsv = await csv().fromFile(req.file.path);
      for (const item of parsedCsv) {
        const errors = checkMissingKeys(item, requiredKeys);
        if (errors.length === 0) {
          let password = bcrypt.hashSync(item.dob);
          csvData.push({
            name: item.name,
            emp_id: item.emp_id,
            phone_no: item.phone_no,
            current_address: item.current_address,
            permanent_address: item.permanent_address,
            gender: item.gender,
            password: password,
            dob: item.dob,
            email: item.email,
            department_id: item.department_id,
            designation: item.designation,
            role: "3",
          });
        } else {
          return res.status(202).send({
            status_code: 202,
            message: `You have these missing fields in your csv: ${errors}`,
          });
        }
      }
      const usersList = await Users.insertMany(csvData);
      const finalData = csvData.map((tea) => {
        const usersListAfterMerge = usersList.find(
          (user) => user.email === tea.email
        );
        return {
          ...tea,
          user_id: usersListAfterMerge._id.toString(),
        };
      });
      // console.log(usersList,"katuikk");
      Teacher.insertMany(finalData);
      // const [usersList, _] = await Promise.all([
      //   Users.insertMany(csvData),
      //   Teacher.insertMany(csvData)
      // ]);
      // console.log(usersList);
      return res.status(201).send({
        status_code: 201,
        message: "Teacher created successfully",
      });
      // await csv()
      //   .fromFile(req.file.path)
      //   .then(async (parsedCsv) => {
      //     for (var x = 0; x < parsedCsv.length; x++) {
      //       const errors = checkMissingKeys(parsedCsv[x], requiredKeys);
      //       if (errors?.length == 0) {
      //         csvData.push({
      //           name: parsedCsv[x].name,
      //           roll_no: parsedCsv[x].roll_no,
      //           father_name: parsedCsv[x].father_name,
      //           phone_no: parsedCsv[x].phone_no,
      //           guardian_no: parsedCsv[x].guardian_no,
      //           current_address: parsedCsv[x].current_address,
      //           permanent_address: parsedCsv[x].permanent_address,
      //           batch: parsedCsv[x].batch,
      //           gender: parsedCsv[x].gender,
      //           dob: parsedCsv[x].dob,
      //           email: parsedCsv[x].email,
      //           course_id: req.body.course_id,
      //           semester_id: req.body.semester_id,
      //         });
      //       } else {
      //         return res.status(202).send({
      //           status_code: 202,
      //           message: `You have these missing fields in your csv ${errors}`,
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
