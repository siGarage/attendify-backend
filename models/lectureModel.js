import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema(
  {
    client_id: {
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
    start_time: {
      type: String,
      default: null,
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
