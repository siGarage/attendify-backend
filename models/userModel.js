import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      allowNull: false,
    },
    email: {
      type: String,
      allowNull: false,
    },
    phone_no: {
      type: Number,
      allowNull: false,
    },
    password: {
      type: String,
    },
    group: {
      type: String,
    },
    role: { 
      type: String 
    },
    status: {
      type: Boolean,
    },
  },

  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const User = mongoose.model("users", userSchema);

export default User;
