import STUDENT from "../models/studentModel.js";
import SUBJECT from "../models/subjectModel.js";
import COURSE from "../models/courseModel.js";
import StudentAttendance from "../models/studentAttendenceModel.js";
// import LASTUPDATE from "../models/lastUpdateAttendanceModel.js";
import SEMESTER from "../models/semesterModel.js";
import Validator from "validatorjs";
import Biometric from "../models/biometricModel.js";
import USER from "../models/userModel.js";
import TEACHER from "../models/teacherModel.js";
import reply from "../common/reply.js";
import LastUpdatedAttendance from "../models/lastUpdateAttendanceModel.js";
import TeacherAttendance from "../models/teacherAttendenceModel.js";
function findHighestDate(data) {
  let highestDate = null;
  for (const item of data) {
    const date = item.a_date;
    if (!highestDate || date > highestDate) {
      highestDate = date;
    }
  }
  return highestDate;
}
function mergeArrays(filteredData, bios) {
  const mergedArray = [];
  filteredData.forEach(async (attendance) => {
    const matchingTeacher = bios.find(
      (teacher) => teacher?._id.toHexString() === attendance?.student_id
    );
    if (matchingTeacher) {
      mergedArray.push({
        ...attendance,
        roll_no: matchingTeacher?._doc?.roll_no,
        batch: matchingTeacher?._doc?.batch,
      });
    } else {
      mergedArray.push(attendance);
    }
  });
  return mergedArray;
}
function mergeTArrays(bodyData, teachers) {
  const mergedArray = [];
  bodyData?.forEach(async (attendance) => {
    const matchingTeacher = teachers.find(
      (teacher) => teacher?._id?.toHexString() === attendance?.teacher_id
    );
    if (matchingTeacher) {
      mergedArray.push({
        ...attendance,
        emp_id: matchingTeacher?.emp_id,
      });
    } else {
      mergedArray.push(attendance);
    }
  });
  return mergedArray;
}
export default {
  // Get Student List
  async fetchStudentsData(req, res) {
    try {
      let students = await STUDENT.find({}).select(
        "roll_no name _id semester_id"
      );
      return res.status(200).json(students);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  // Get Subjects List
  async fetchSubjectsData(req, res) {
    try {
      let subjects = await SUBJECT.find({}).select(
        "_id name theory practical others clinical"
      );
      return res.status(200).json(subjects);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  // Get Courses List
  async fetchCoursesData(req, res) {
    try {
      let courses = await COURSE.find({}).select("_id name");
      return res.status(200).json(courses);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Phases List
  async fetchPhasesData(req, res) {
    try {
      let phases = await SEMESTER.find({}).select("_id name course_id");
      return res.status(200).json(phases);
    } catch (err) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // Get Courses List
  async createStudentAttendanceData(req, res) {
    try {
      const studentIds = req.body.map((d) => d.student_id);
      const students = await STUDENT.find({ _id: { $in: studentIds } });
      const final = req.body.map((d) => ({
        ...d,
        roll_no: students.find((t) => t._id == d.student_id)?.roll_no,
        batch: students.find((t) => t._id == d.student_id)?.batch,
      }));
      const result = await StudentAttendance.insertMany(final);
      return res.status(200).send({
        message: `${result.length} records of Student Attendance created successfully`,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  },

  async createTeacherAttendanceData(req, res) {
    try {
      const teacherIds = req.body.map((d) => d.teacher_id);
      const teachers = await TEACHER.find({ _id: { $in: teacherIds } });
      const final = req.body.map((d) => ({
        ...d,
        emp_id: teachers.find((t) => t._id == d.teacher_id)?.emp_id,
      }));
      const result = await TeacherAttendance.insertMany(final);
      return res.status(200).send({
        message: `${result.length} records of Teacher Attendance created successfully`,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send({
        message: error,
      });
    }
  },

  async getLastUpdate(req, res) {
    try {
      const data = await (req.body.role == "Student"
        ? StudentAttendance
        : TeacherAttendance
      )
        .findOne({
          machine_id: req.body.machine_id,
        })
        .sort({ createdAt: -1 });
      return res.status(200).send({
        role: req.body.role,
        lastUpdate: data?.a_date,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  },

  async createBioMetricData(req, res) {
    try {
      console.log(req.body);
      let request = req.body;
      if (Object.keys(request).length == 0) {
        return res.json(reply.failed("All input is required!"));
      }
      let validation = new Validator(request, {
        user_id: "required",
        type: "required",
        finger_id_1: "required",
        finger_id_2: "required",
        finger_id_3: "required",
      });
      if (validation.fails()) {
        let err_key = Object.keys(Object.entries(validation.errors)[0][1])[0];
        return res.json(reply.failed(validation.errors.first(err_key)));
      }
      let exist = await Biometric.findOne({
        user_id: request.user_id,
        type: request.type,
      });
      if (exist) {
        let _id = req.body.id;
        await Biometric.findByIdAndUpdate(_id, request);
        return res.json({ message: "Biometric updated successfully" });
      }
      await Biometric.create(request);
      return res.status(200).send({
        message: "Biometric created successfully",
      });
    } catch (err) {
      return res.status(200).send({ message: "Internal Server Error: " + err.message });
    }
  },
  async getTeacherDetails(req, res) {
    try {
      const teacher = await TEACHER.find();
      const user = await USER.find({});
      const combinedUserArray = user.map((user) => {
        const matchingProfile = teacher.find(
          (profile) => profile.user_id === user._id.toString()
        ); // Ensure correct user_id comparison

        if (matchingProfile) {
          return {
            id: user._id,
            name: user.name,
            emp_id: matchingProfile.emp_id || null, // Include emp_id if present, otherwise null
            password: user.password,
            email: user.email,
          };
        }

        // Handle cases where there's no matching profile
        return null; // Or provide a default object with null/placeholder values
      });
      const filteredCombinedUserArray = combinedUserArray.filter(
        (user) => user !== null
      ); // Remove null entries
      // console.log(filteredCombinedUserArray);
      return res.status(200).json(filteredCombinedUserArray);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async getStundentAttendance(req, res) {
    try {
      const stundentAttendance = await StudentAttendance.find({});
      return res.status(200).json(stundentAttendance);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
