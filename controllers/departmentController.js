import Department from "../models/departmentModel.js";
import User from "../models/userModel.js";
import Teacher from "../models/teacherModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";

export default {
  //Department create
  async createDepartment(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("Name input is required!"));
      }
      let validation = new Validator(request, {
        name: "required|string",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      // let TeacherInfo = await USER.findById(request.hod);
      // let id = request.hod;
      // let finalData = {
      //   name: TeacherInfo.name,
      //   email: TeacherInfo.email,
      //   phone_no: TeacherInfo.phone_no,
      //   password: TeacherInfo.password,
      //   role: "2",
      // };
      // let done = await USER.findByIdAndUpdate(id, finalData);
      let exist = await Department.findOne({ name: request.name });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This department name is already exists!" });
      }
      let department = await Department.create(request);
      return res.status(201).send({
        status_code: 201,
        department: department,
        message: "Department created successfully.",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Departments List
  async getDepartmentList(req, res) {
    try {
      const departments = await Department.find();
      const hodUser = await User.find({ role: "2" });
      const hodIds = hodUser.map((d) => d._id.toString());
      const teachers = await Teacher.find({});
      if (teachers.length > 0) {
        const filteredA2 = teachers?.filter((record) =>
          hodIds.includes(record.user_id)
        );
        const transformedA1 = departments?.map((a1Item) => {
          const matchingA2 = filteredA2.find(
            (a2Item) => a2Item.department_id === a1Item._id.toString()
          );
          return {
            ...a1Item,
            hod: matchingA2 ? matchingA2.name : "", // Use A2.name if matched, otherwise keep existing hod
          };
        });
        return res.status(200).json(transformedA1);
      }
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Department
  async deleteDepartment(req, res) {
    try {
      let id = req.query.id;
      const department = await Department.findByIdAndRemove(id);
      if (!department) {
        return res.status(404).send({ message: "Department not found." });
      }
      return res
        .status(200)
        .send({ id: id, message: "Department deleted successfully." });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Update Department
  async updateDepartment(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const department = await Department.findById(_id);
      if (!department) {
        return res.status(404).send({ message: "Department not found" });
      }
      await Department.findByIdAndUpdate(_id, request);
      return res
        .status(201)
        .send({ message: "Department updated successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Department By Id
  async getDepartmentById(req, res) {
    try {
      const department = await Department.findById(req.body.id);
      return res.status(200).json(department);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
