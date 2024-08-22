
import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone_no: {
        type: Number,
        required: true
    },
    alternate_no: {
        type: Number
    },
    current_address: {
        type: String
    },
    permeanent_address: {
        type: String,
        requried: true
    },
    department_id: {
        type: String,
        required: true
    },
    designation: {
        type: String
    },
    user_id: {
        type: String
    },
    dob: {
        type: Date
    },
    gender: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    status: {
        type: Boolean
    },
},
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Teacher = mongoose.model('teachers', TeacherSchema)

export default Teacher;