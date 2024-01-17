import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    conversationId: {
        type: String,
        required: true,
    },
    messages: [
        {
            senderId: {
                type: String,
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
  },
 
);

const Message =  mongoose.model("Message", MessageSchema);
export default Message;