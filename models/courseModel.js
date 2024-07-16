
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String
    }
},
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Course = mongoose.model('courses', CourseSchema)

export default Course;