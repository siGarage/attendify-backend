import Lecture from "../models/lectureModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";

export default {
  //Course create
  async createLectures(req, res) {
    try {
      const lectures = req.body;
      await Lecture.bulkWrite(lectures.map(l => {
        return {
          updateOne: {
            filter: { uid : l.uid },
            update: { $set: l },
            upsert: true
          }
        };
      }));
      return res.status(200).send({
        error: false,
        data: lectures.length + " lecture(s) created successfully.",
      });
    } catch (err) {
      return res.status(200).send({
        error: true,
        message: err.message,
      });
    }
  },

  // Get Courses List
  async getLectureList(req, res) {
    try {
      const lecture = await Lecture.find();
      return res.status(200).json(lecture);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Course
  async deleteLecture(req, res) {
    try {
      let id = req.query.id;
      const lecture = await Lecture.findByIdAndRemove(id);
      if (!lecture) {
        return res.status(404).send({ message: "Lecture not found." });
      }
      return res
        .status(200)
        .send({ id: id, message: "Lecture deleted successfully." });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Course By Id
  async getLectureById(req, res) {
    try {
      const lecture = await Lecture.findById(req.body.id);
      return res.status(200).json(lecture);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
