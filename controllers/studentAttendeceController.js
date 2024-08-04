import STUDENTATTENDENCE from "../models/studentAttendenceModel.js";
import STUDENT from "../models/studentModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
import moment from "moment";
import fs from "fs";
// import { parse } from "csv-parse";
import csv from "csvtojson";
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
  //Student Attendence create
  async createStudentAttendence(req, res) {
    try {
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      let validation = new Validator(request, {
        subject_id: "required",
        student_id: "required",
        date: "required",
        type: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      let exist = await STUDENTATTENDENCE.findOne({
        subject_id: request.subject_id,
        student_id: request.student_id,
        date: request.date,
      });
      if (exist) {
        return res
          .status(403)
          .send({ message: "This student attendence is already exists!" });
      }
      let studentAttendence = await STUDENTATTENDENCE.create(request);
      return res.status(204).send({
        status_code: 201,
        studentAttendence: studentAttendence,
        message: "Student Attendence created successfully",
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async createStudentAttendenceByCsv(req, res) {
    var csvData = [];
    csv()
      .fromFile(req.file.path)
      .then(async (jsonObj) => {
        for (var x = 0; x < jsonObj.length; x++) {
          const getStudentId = await STUDENT.findOne({
            roll_no: jsonObj[x]?.roll_no,
          });
          csvData.push({
            student_id: getStudentId._id,
            roll_no: jsonObj[x].roll_no,
            attendence_status: jsonObj[x].attendence_status,
            a_date: moment(jsonObj[x].a_date).format("YYYY-MM-DD"),
            course_id: req.body.course_id,
            subject_id: req.body.subject_id,
            semester_id: req.body.semester_id,
            type: req.body.type,
          });
        }
        await STUDENTATTENDENCE.insertMany(csvData);
        return res.status(201).send({
          status_code: 201,
          message: "Student attendence submitted successfully.",
        });
      });
  },

  // Get Student Attendence List
  async fetchStudentAttendenceList(req, res) {
    const filterQuery = buildFilterQuery(req.body);
    try {
      let studentAttendences = await STUDENTATTENDENCE.find(filterQuery);
      const filteredData = [];
      for (let i = 0; i < studentAttendences.length; i++) {
        const currentDate = studentAttendences[i].a_date;
        if (
          currentDate >= req.body.fromdate &&
          currentDate <= req.body.endDate
        ) {
          filteredData.push(studentAttendences[i]);
        }
      }
      return res.status(200).json(filteredData);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student Attendence List
  async fetchTodayStudentAttendenceList(req, res) {
    try {
      let s_date = moment().format("YYYY-MM-DD");
      const result = await STUDENTATTENDENCE.find({
        a_date: s_date,
      });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student Attendence List
  async fetchMonthlyAttendenceList(req, res) {
    let desiredMonth = req.body.month;
    try {
      STUDENTATTENDENCE.aggregate([
        {
          $addFields: {
            date: { $toDate: "$a_date" }, // Replace 'yourDateField' with your field name
          },
        },
        {
          $addFields: {
            month: { $month: "$date" },
          },
        },
        {
          $match: {
            month: desiredMonth, // Replace desiredMonth with the desired month (1-12)
          },
        },
      ]).exec((err, results) => {
        if (err) {
          console.error(err);
        } else {
          return res.status(200).json(results);
        }
      });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  //Get student Attendence by Id
  async fetchSingleStudentAttendences(req, res) {
    let { id, type, month } = req.body;
    try {
      const currentMonth = month;
      const startOfMonth = moment()
        .month(currentMonth)
        .startOf("month")
        .format("YYYY-MM-DD");
      const endOfMonth = moment()
        .month(currentMonth)
        .endOf("month")
        .format("YYYY-MM-DD");
      let studentAttendences = await STUDENTATTENDENCE.find({
        a_date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
        student_id: id,
        type: type,
      });
      return res.status(200).json(studentAttendences);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Delete Student Attendence
  async deleteStudentAttendence(req, res) {
    try {
      let id = req.query.id;
      const studentAttendence = await STUDENTATTENDENCE.findByIdAndRemove(id);
      if (!studentAttendence) {
        return res
          .status(404)
          .send({ message: "Student Attendence not found." });
      }
      return res
        .status(204)
        .send({ id: id, message: "Student Attendence deleted successfully." });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Update Student Attendence
  async updateStudentAttendence(req, res) {
    try {
      let request = req.body;
      if (!request) {
        return res.send("All input is required!");
      }
      let _id = req.body.id;
      const studentAttendence = await STUDENTATTENDENCE.findById(_id);
      if (!studentAttendence) {
        return res
          .status(404)
          .send({ message: "Student Attendence not found" });
      }
      await STUDENTATTENDENCE.findByIdAndUpdate(_id, request);
      return res
        .status(201)
        .send({ message: "Student Attendence updated successfully" });
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student Attendence By Id
  async getStudentAttendenceById(req, res) {
    try {
      const studentAttendence = await STUDENTATTENDENCE.findById(req.body.id);
      return res.status(200).json(studentAttendence);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student Attendence By Id
  async getStudentAttendencebyValues(req, res) {
    try {
      const obj = req.body;
      // Define your filter criteria
      const filter = {};
      const objectValues = req.body;
      // Assuming you have five search values
      Object.keys(objectValues).forEach((key) => {
        const value = objectValues[key];
        console.log(value);
        if (value !== null && value !== undefined && value) {
          filter[key] = value; // Assuming the object is nested under a field called 'user'
        }
      });
      STUDENTATTENDENCE.find(
        { kartik_id: "1a2s3d4f4tg6h6" },
        (err, results) => {
          if (err) {
            console.error("Error:", err);
            return;
          }
          return res.status(200).json(results);
        }
      );
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
