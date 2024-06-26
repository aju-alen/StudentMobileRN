import dotenv from "dotenv";
import Conversation from "../models/conversation.js"

dotenv.config();

export const getAllConversations = async (req, res, next) => {
    console.log('req.params',req.params);
    console.log('inside conversation controller apiiiiiiiiiiiii');
    try{
        const conversations = await Conversation.find({$or: [
            {userId: req.params.userId},
            {clientId: req.params.userId}
          ]}).populate('userId','name').populate('clientId','name profileImage').populate('subjectId','subjectName').populate('userId','name profileImage');
          if(!conversations){
              return res.status(400).json({message:"No conversations found"});
          }
          return res.status(200).json(conversations);
    }
    catch(err){
        console.log(err);
        next(err);
    }

}
export const getSingleConversation = async (req, res, next) => {
    console.log('req.params for single convo',req.params);
    try {
        const conversation = await Conversation.findOne({_id:req.params.conversationId}).populate('clientId','name profileImage').populate('userId', 'name profileImage');
        if (!conversation) {
            return res.status(400).json({ message: "No conversation found" });
        }
        return res.status(200).json(conversation);

    }
    catch (err) {
        console.log(err);
        next(err);
    }
}
export const createConversation = async (req, res, next) => {
    
}
    
