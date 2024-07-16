
import mongoose from 'mongoose';

const BiometricSchema = new mongoose.Schema({
    face: {
        type: String
    },
    finger: {
        type: String
    },
    user_id: {
        type: String
    },
},
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Biometric = mongoose.model('biometrics', BiometricSchema)

export default Biometric;