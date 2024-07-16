import COURSE from "../models/courseModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";

export default {
  //Course create
  async createCourse(req, res) {
    try {
      let request = req.body;
      let exist = await COURSE.findOne({ name: request.name });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This course is already exist." });
      }
      let course = await COURSE.create(request);
      return res.status(201).send({
        status_code: 201,
        course: course,
        message: "Course created successfully.",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Courses List
  async getCourseList(req, res) {
    try {
      const courses = await COURSE.find();
      return res.status(200).json(courses);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Course
  async deleteCourse(req, res) {
    try {
      let id = req.query.id;
      const course = await COURSE.findByIdAndRemove(id);
      if (!course) {
        return res.status(404).send({ message: "Course not found." });
      }
      return res
        .status(200)
        .send({ id: id, message: "Course deleted successfully." });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Update Course
  async updateCourse(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const course = await COURSE.findById(_id);
      if (!course) {
        return res.status(404).send({ message: "Course not found" });
      }
      await COURSE.findByIdAndUpdate(_id, request);
      return res.status(201).send({ message: "Course updated successfully" });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Course By Id
  async getCourseById(req, res) {
    try {
      const course = await COURSE.findById(req.body.id);
      return res.status(200).json(course);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
