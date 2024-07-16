import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        allowNull: false
    },
    password: {
        type: String
    },
    group: {
        type: String
    }, 
    status: {
        type: Boolean
    }

},

    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }

)

const User = mongoose.model('users', userSchema)

export default User;