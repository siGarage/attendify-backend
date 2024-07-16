import mongoose from 'mongoose';


const examSchema = new mongoose.Schema({
    name: {
        type: String,
        allowNull: false
    },
    description: {
        type: String,
        allowNull: false
    },
    elg_class: {
        type: String,
    },
    elg_age: {
        type: String,
    },
    elg_dob: {
        type: String
    },
    image: {
        type: String,
        allowNull: false
    },
    admission_process: {
        type: String
    },
    date_exam: {
        type: String
    },
    examSeats: {
        type: String
    },
    language: {
        type: String
    },
    shortName: {
        type: String
    }
},

    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }

)

const ExamModal = mongoose.model('exams', examSchema);

export default ExamModal;