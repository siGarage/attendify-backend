import SEMESTER from "../models/semesterModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";

export default {
  //Semester create
  async createSemester(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("name & course_id input is required."));
      }
      let validation = new Validator(request, {
        name: "required",
        course_id: "required",
        status: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      const exist = await SEMESTER.findOne({
        $and: [{ course_id: request.course_id }, { name: request.name }],
      });
      if (exist) {
        return res.status(403).send({
          message: "This semester is already exist for this perticular course.",
        });
      }
      let semester = await SEMESTER.create(request);
      return res.status(201).send({
        status_code: 201,
        semester: semester,
        message: "Semester created successfully.",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Semesters List
  async getSemesterList(req, res) {
    try {
      const semesters = await SEMESTER.find();
      return res.status(200).json(semesters);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Semester
  async deleteSemester(req, res) {
    try {
      let id = req.query.id;
      const semester = await SEMESTER.findByIdAndRemove(id);
      if (!semester) {
        return res.status(404).send({ message: "Semester not found." });
      }
      return res
        .status(200)
        .send({ id: id, message: "Semester deleted successfully." });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Update Semester
  async updateSemester(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const semester = await SEMESTER.findById(_id);
      if (!semester) {
        return res.status(404).send({ message: "Semester not found" });
      }
      await SEMESTER.findByIdAndUpdate(_id, request);
      return res.status(201).send({
        semester_u: request,
        message: "Semester updated successfully",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Semester By Id
  async getSemesterById(req, res) {
    try {
      const semester = await SEMESTER.findById(req.body.id);
      return res.status(200).json(semester);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
