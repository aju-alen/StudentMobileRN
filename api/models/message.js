import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
   senderId:{
    type:String,
    required:true
   },
    text:{
     type:String,
     required:true
    },
  },
  {
    timestamps: true,
  }
);

const Message =  mongoose.model("Message", MessageSchema);
export default Message;