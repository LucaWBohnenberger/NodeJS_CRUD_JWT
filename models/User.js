import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    nickName: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', UserSchema);
