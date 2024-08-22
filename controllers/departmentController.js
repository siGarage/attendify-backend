import DEPARTMENT from "../models/departmentModel.js";
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
      let exist = await DEPARTMENT.findOne({ name: request.name });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This department name is already exists!" });
      }
      let department = await DEPARTMENT.create(request);
      return res.status(201).send({
        status_code: 201,
        department: department,
        message: "Department created successfully.",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Departments List
  async getDepartmentList(req, res) {
    try {
      const departments = await DEPARTMENT.find();
      return res.status(200).json(departments);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Department
  async deleteDepartment(req, res) {
    try {
      let id = req.query.id;
      const department = await DEPARTMENT.findByIdAndRemove(id);
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
      const department = await DEPARTMENT.findById(_id);
      if (!department) {
        return res.status(404).send({ message: "Department not found" });
      }
      await DEPARTMENT.findByIdAndUpdate(_id, request);
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
      const department = await DEPARTMENT.findById(req.body.id);
      return res.status(200).json(department);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
