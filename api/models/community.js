import mongoose from "mongoose";
const { Schema } = mongoose;

const CommunitySchema = new Schema(
    {   
        communityProfileImage:{
            type:String,
            required:true
        },
        communityName: {
            type: String,
            required: true
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        messages: [
            {
                senderId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                text: {
                    type: String,
                    required: true
                },
                messageId: {
                    type: String,
                    required: true
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

const Community = mongoose.model("Community", CommunitySchema);
export default Community;