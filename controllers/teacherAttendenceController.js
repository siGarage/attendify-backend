import TEACHERATTENDENCE from "../models/teacherAttendenceModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
function buildFilterQuery(body) {
  const query = {};
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      const value = body[key];
      if (value === "all") {
        // No filtering for this field
      } else if (value) {
        // Apply filter logic based on value type
        if (typeof value === "string") {
          query[key] = new RegExp(value, "i"); // Case-insensitive search
        } else if (typeof value === "object") {
          // Handle complex filters if needed (e.g., $gt, $lt)
        } else {
          query[key] = value; // Default filter (e.g., exact match)
        }
      }
    }
  }
  return query;
}

export default {
  //Teacher Attendence create
  async createTeacherAttendence(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      let validation = new Validator(request, {
        subject_id: "required",
        teacher_id: "required",
        date: "required",
        type: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      let exist = await TEACHERATTENDENCE.findOne({
        subject_id: request.subject_id,
        teacher_id: request.teacher_id,
        date: request.date,
      });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This teacher attendence is already exists!" });
      }
      let teacherAttendence = await TEACHERATTENDENCE.create(request);
      return res.status(201).send({
        status_code: 201,
        teacherAttendence: teacherAttendence,
        message: "Teacher Attendence created successfully",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  async fetchSingleTeacherAttendences(req, res) {
    let { id, date } = req.body;
    try {
      let teacherAttendences = await TEACHERATTENDENCE.find({
        a_date: date,
        teacher_id: id,
      });
      return res.status(200).json(teacherAttendences);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async getTeacherAttendenceList(req, res) {
    const filterQuery = buildFilterQuery(req.body);
    try {
      let teacherAttendences = await TEACHERATTENDENCE.find(filterQuery);
      const filteredData = [];
      for (let i = 0; i < teacherAttendences.length; i++) {
        const currentDate = teacherAttendences[i].a_date;
        if (
          currentDate >= req.body.fromdate &&
          currentDate <= req.body.endDate
        ) {
          filteredData.push(teacherAttendences[i]);
        }
      }
      return res.status(200).json(filteredData);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Teacher Attendence
  async deleteTeacherAttendence(req, res) {
    try {
      let id = req.query.id;
      const teacherAttendence = await TEACHERATTENDENCE.findByIdAndRemove(id);
      if (!teacherAttendence) {
        return res
          .status(404)
          .send({ message: "Teacher Attendence not found." });
      }
      return res
        .status(204)
        .send({ id: id, message: "Teacher Attendence deleted successfully." });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Update Teacher Attendence
  async updateTeacherAttendence(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const teacherAttendence = await TEACHERATTENDENCE.findById(_id);
      if (!teacherAttendence) {
        return res
          .status(404)
          .send({ message: "Teacher Attendence not found" });
      }
      await TEACHERATTENDENCE.findByIdAndUpdate(_id, request);
      return res
        .status(201)
        .send({ message: "Teacher Attendence updated successfully" });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Teacher Attendence By Id
  async getTeacherAttendenceById(req, res) {
    try {
      const teacherAttendence = await TEACHERATTENDENCE.findById(req.body.id);
      return res.status(200).json(teacherAttendence);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
