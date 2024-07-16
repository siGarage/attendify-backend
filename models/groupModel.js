
import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    description: {
        type: String
    },
    status: {
        type: String
    },
    members: {
        type: Array
    },
    facultyAttedenceViewPermission: {
        type: Boolean
    },
    studentAttendenceViewPermision: {
        type: Boolean
    },
    facultyAttendeceUpdatePermission: {
        type: Boolean
    },
    studentAttendenceUpdatePermission: {
        type: Boolean
    }
},
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Group = mongoose.model('groups', GroupSchema)

export default Group;