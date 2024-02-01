import mongoose from "mongoose";
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true

    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    messages: [
      {
       senderId:{
        type:String,
        required:true
       },
        text:{
         type:String,
         required:true
        },
        messageId:{
          type:String,
          required:true
         }, 
      },
      {
        timestamps: true,
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;