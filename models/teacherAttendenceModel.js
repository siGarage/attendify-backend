import mongoose from "mongoose";

const TeacherAttendenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    teacher_id: {
      type: String,
      required: true,
    },
    emp_id:{
      type: String,
      required: true,
    },
    course_id: {
      type: String,
    },
    subject_id: {
      type: String,
      required: true,
    },
    semester_id: {
      type: String,
      required: true,
    },
    lecture_id: {
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
    machine_id: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const TeacherAttendence = mongoose.model(
  "teacherAttendences",
  TeacherAttendenceSchema
);

export default TeacherAttendence;
