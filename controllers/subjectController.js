import SUBJECT from "../models/subjectModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";

export default {
  //Subject create
  async createSubject(req, res) {
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
      let exist = await SUBJECT.findOne({ name: request.name });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This subject name is already exists!" });
      }
      let subject = await SUBJECT.create(request);
      return res.status(201).send({
        status_code: 201,
        subject: subject,
        message: "Subject created successfully.",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Subjects List
  async getSubjectList(req, res) {
    try {
      const subjects = await SUBJECT.find();
      return res.status(200).json(subjects);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Subject
  async deleteSubject(req, res) {
    try {
        let id = req.query.id;
      const subject = await SUBJECT.findByIdAndRemove(id);
      if (!subject) {
        return res.status(404).send({ message: "Subject not found." });
      }
      return res
        .status(200)
        .send({ id: id, message: "Subject deleted successfully." });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Update Subject
  async updateSubject(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const subject = await SUBJECT.findById(_id);
      if (!subject) {
        return res.status(404).send({ message: "Subject not found" });
      }
      await SUBJECT.findByIdAndUpdate(_id, request);
      return res.status(201).send({ message: "Subject updated successfully" });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Subject By Id
  async getSubjectById(req, res) {
    try {
      const subject = await SUBJECT.findById(req.body.id);
      return res.status(200).json(subject);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
