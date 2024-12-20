import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema(
  {
    uid: {
      // reference id in the machine
      type: String,
    },
    teacher_id: {
      type: String,
    },
    course_id: {
      type: String,
    },
    semester_id: {
      type: String,
    },
    subject_id: {
      type: String,
    },
    type: {
      type: String,
    },
    roll_no: {
      type: String,
    },
    start_time: {
      type: String,
      default: null,
    },
    is_done: {
      type: Boolean,
      default: false,
    },
    end_time: {
      type: String,
      default: null,
    },
    status: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Lecture = mongoose.model("lectures", LectureSchema);

export default Lecture;
