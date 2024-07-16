
import mongoose from 'mongoose';

const TimeTableSchema = new mongoose.Schema({
    courseId: {
        type: Number
    },
    semesterId: {
        type: Number
    },
    file: {
        type: String
    },
    notes: {
        type: String
    },
    status: {
        type: Boolean
    }
},
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const TimeTable = mongoose.model('timeTables', TimeTableSchema)

export default TimeTable;