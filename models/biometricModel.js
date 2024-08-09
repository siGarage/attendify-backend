
import mongoose from 'mongoose';

const BiometricSchema = new mongoose.Schema({
    face_id: {
        type: String
    },
    finger_id: {
        type: String
    },
    student_id: {
        type: String
    },
},
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Biometric = mongoose.model('biometrics', BiometricSchema)

export default Biometric;