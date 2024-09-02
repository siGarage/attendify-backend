import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    theory: {
      type: Boolean,
    },
    practical: {
      type: Boolean,
    },
    others: {
      type: Boolean,
    },
    ece: {
      type: Boolean,
    },
    aetcom: {
      type: Boolean,
    },
    fap: {
      type: Boolean,
    },
    clinical: {
      type: Boolean,
    },
    elective: {
      type: Boolean,
    },
    status: {
      type: String,
    },
    description: {
      type: String,
    },
    semester_id: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Subject = mongoose.model("subjects", SubjectSchema);

export default Subject;
