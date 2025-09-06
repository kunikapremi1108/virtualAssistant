import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    assistantName:{
        type:String
    },
    assistantImage:{
        type:String
    },
    preferences: {
        defaultMode: { type: String, default: 'default' },
        voiceLanguage: { type: String, default: 'auto' },
        speechRate: { type: String, default: 'normal' },
        voiceStyle: { type: String, default: 'friendly' }
    }, 
    
    history:[{
        type:String
    }],
    stats: {
        totalConversations: { type: Number, default: 0 },
        favoriteMode: { type: String, default: 'default' },
        averageResponseTime: { type: Number, default: 0 }
    },


},{timestamps:true})

userSchema.index({ email: 1 })
userSchema.index({ 'stats.totalConversations': -1 })

const User = mongoose.model("User", userSchema)
export default User;