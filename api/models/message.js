import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    conversationId:{
    type:String,
    required:true
   },
   senderId:{
    type:String,
    required:true
   },
    text:{
     type:String,
     required:false,
    },
  },
  {
    timestamps: true,
  }
);

const Message =  mongoose.model("Message", MessageSchema);
export default Message;