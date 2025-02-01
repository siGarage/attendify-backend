import STUDENTATTENDENCE from "../models/studentAttendenceModel.js";
import STUDENT from "../models/studentModel.js";
import Lecture from "../models/lectureModel.js";
import Validator from "validatorjs";
import reply from "../common/reply.js";
import moment from "moment";
import fs from "fs";
import exceljs from "exceljs";
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
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function mergeArrays(arrA, arrB) {
  const mergedArray = [];

  for (const itemB of arrB) {
    const matchingItemA = arrA.find((itemA) => {
      const dateA = itemA.start_time.split(" ")[0]; // Extract date from start_time
      return dateA === itemB.a_date; // Compare dates
    });

    if (matchingItemA) {
      mergedArray.push({
        ...itemB, // Spread all properties of itemB
        uid: matchingItemA.uid, // Add the uid property from itemA
      });
    } else {
      mergedArray.push(itemB); // If no match is found in A, keep the original itemB
    }
  }

  return mergedArray;
}
export default {
  //Student Attendence create
  async createStudentAttendence(req, res) {
    try {
      let request = req.body;
      console.log(request);
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
      logger.error(err.stack);

      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async createStudentAttendenceByCsv(req, res) {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    try {
      // **REPLACE with your attendance collection name**

      const { Workbook } = exceljs; // Make sure exceljs is required
      const workbook = new Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.getWorksheet(1);

      const attendanceData = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const headerCell = worksheet.getCell(1, colNumber).value;
            rowData[headerCell] = cell.value;
          });
          attendanceData.push(rowData);
        }
      });

      const studentRolls = attendanceData.map((d) => d.roll_no);
      const students = await STUDENT.find({ roll_no: { $in: studentRolls } });

      const final = attendanceData.map((d) => ({
        ...d,
        student_id: students
          .find((t) => t.roll_no == d.roll_no)
          ?._id.toString(),
        batch: students.find((t) => t.roll_no == d.roll_no)?.batch,
        course_id: req.body.course_id,
        subject_id: req.body.subject_id,
        semester_id: req.body.semester_id,
        type: req.body.type,
        machine_id: "csv",
      }));

      const transformedData = [];
      const lectureData = [];

      for (const record of final) {
        const {
          roll_no,
          name,
          student_id,
          batch,
          machine_id,
          course_id,
          subject_id,
          semester_id,
          type,
          ...dates
        } = record;

        for (const dateString in dates) {
          const momentDate = moment(dateString);

          if (!momentDate.isValid()) {
            console.error("Invalid date:", dateString, "for roll_no:", roll_no);
            continue; // Skip invalid dates
          }

          const formattedDate = momentDate.format("YYYY-MM-DD");

          transformedData.push({
            roll_no,
            name,
            student_id,
            course_id,
            subject_id,
            semester_id,
            batch,
            machine_id,
            type,
            a_date: formattedDate,
            attendance_status: dates[dateString],
          });

          const uuid = generateUUID();
          lectureData.push({
            uid: uuid,
            course_id: req.body.course_id,
            end_time: `${formattedDate} 09:00:00`,
            is_done: true,
            roll_no: "", // Review if you need this field
            semester_id: req.body.semester_id,
            start_time: `${formattedDate} 10:00:00`,
            subject_id: req.body.subject_id,
            teacher_id: req.body.teacher_id,
            type: req.body.type, // Add the formatted date to lectureData
          });
        }
      }

      // Bulk write for Lectures (using upsert to avoid duplicates)
      const lectureOperations = lectureData.map((item) => ({
        updateOne: {
          filter: {
            start_time: item.start_time,
          }, // Define your unique key
          update: { $setOnInsert: item },
          upsert: true,
        },
      }));
      const lectureResult = await Lecture.bulkWrite(lectureOperations);
      console.log("Lecture bulk write result:", lectureResult);
      const combinedArray = [];
      for (const item1 of lectureData) {
        for (const item2 of transformedData) {
          if (item1.start_time.split(" ")[0] === item2.a_date) {
            // Your similarity criteria
            combinedArray.push({ lecture_uid: item1.uid, ...item2 });
            break; // Exit inner loop once a match is found
          }
        }
      }
      const attendanceOperations = combinedArray.map((item) => ({
        insertOne: { document: item },
      }));

      const attendanceResult = await STUDENTATTENDENCE.bulkWrite(
        attendanceOperations
      );
      console.log("Attendance bulk write result:", attendanceResult);

      return res.status(200).json({
        message: `File uploaded and processed. Lectures: ${lectureResult.insertedCount} inserted, Attendance: ${attendanceResult.insertedCount} inserted.`,
        lectureResult,
        attendanceResult,
      });
    } catch (error) {
      console.error("Error processing CSV:", error);
      return res
        .status(500)
        .json({ message: "Error processing file", error: error.message });
    }
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
      logger.error(err.stack);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student Attendence List
  async fetchTodayStudentAttendenceList(req, res) {
    try {
      let a = await STUDENTATTENDENCE.find();
      console.log(a);
      let s_date = moment().format("YYYY-MM-DD");
      const result = await STUDENTATTENDENCE.find({
        a_date: s_date,
      });
      return res.status(200).json(result);
    } catch (err) {
      logger.error(err.stack);
      console.log(err);
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
            date: { $toDate: "$a_date" },
          },
        },
        {
          $addFields: {
            month: { $month: "$date" },
          },
        },
        {
          $match: {
            month: desiredMonth,
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
      logger.error(err.stack);

      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  //Get student Attendence by Id
  async fetchSingleStudentAttendences(req, res) {
    let { id, type, month, year } = req.body;
    try {
      const currentMonth = month;
      const startOfMonth = moment()
        .month(currentMonth)
        .year(year)
        .startOf("month")
        .format("YYYY-MM-DD");
      const endOfMonth = moment()
        .month(currentMonth)
        .year(year)
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
      logger.error(err.stack);

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
      logger.error(err.stack);

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
      logger.error(err.stack);

      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Student Attendence By Id
  async getStudentAttendenceById(req, res) {
    try {
      const studentAttendence = await STUDENTATTENDENCE.findById(req.body.id);
      return res.status(200).json(studentAttendence);
    } catch (err) {
      logger.error(err.stack);

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
      logger.error(err.stack);

      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
