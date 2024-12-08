import mongoose from "mongoose";

const StudentAttendenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    lecture_uid: {
      type: String,
      required: true,
    },
    student_id: {
      type: String,
      required: true,
    },
    roll_no: {
      type: String,
      required: true,
    },
    course_id: {
      type: String,
      required: true,
    },
    subject_id: {
      type: String,
      required: true,
    },
    lecture_id: {
      type: String,
      required: true,
    },
    semester_id: {
      type: String,
      required: true,
    },
    attendance_status: {
      type: String,
      required: true,
    },
    a_date: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
    },
    machine_id: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const StudentAttendence = mongoose.model(
  "studentAttendences",
  StudentAttendenceSchema
);

export default StudentAttendence;
