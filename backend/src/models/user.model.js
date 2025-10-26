import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    auth0Id: {
         type: String, 
         required: true,
         unique: true 
    },fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    }
},
    {
        timestamps: true
    }
)

const userModel = mongoose.model("user", userSchema);

export default userModel;