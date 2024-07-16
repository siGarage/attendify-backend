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
    subject_id: {
      type: String,
      required: true,
    },
    department_id: {
      type: String,
      required: true,
    },
    semester_id: {
      type: String,
      required: true,
    },
    attendence_status: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const TeacherAttendence = mongoose.model(
  "teacherAttendences",
  TeacherAttendenceSchema
);

export default TeacherAttendence;
