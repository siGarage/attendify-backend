import mongoose from "mongoose";

const lastUpdatedAttendanceSchema = new mongoose.Schema(
  {
    machine_id: {
      type: String,
      allowNull: false,
    },
    lastUpdate: {
      type: String,
      allowNull: false,
    },
  },

  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const LastUpdatedAttendance = mongoose.model(
  "lastUpdatedAttendance",
  lastUpdatedAttendanceSchema
);

export default LastUpdatedAttendance;
