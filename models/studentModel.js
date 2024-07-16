
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roll_no: {
        type: Number,
        required:true
    },
    father_name: {
        type: String
    },
    phone_no: {
        type: Number,
        required:true
    },
    guardian_no: {
        type: Number,
        required:true
    },
    current_address: {
        type: String
    },
    permanent_address: {
        type: String,
        requried:true
    },
    batch: {
        type: String
    },
    user_id: {
        type: String
    },
    course_id: {
        type: String
    },
    semester_id: {
        type: String
    },
    dob: {
        type: String
    },
    gender: {
        type: String
    },
    email: {
        type: String,
        required:true
    },
    status: {
        type: Boolean
    },
},
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Student = mongoose.model('students', StudentSchema)

export default Student;