import dotenv from "dotenv";
import Conversation from "../models/conversation.js"

dotenv.config();

export const getAllConversations = async (req, res, next) => {
    console.log(req.params.conversationId)
    try{
        const conversations = await Conversation.find({userId:req.userId}).populate('clientId');
        res.status(200).json(conversations);
    }
    catch(err){
        next(err);
    }


}

export const createConversation = async (req, res, next) => {
    const {userId,clientId} = req.body;
    console.log(userId,clientId,'userId,clientId');
        try{
            const checkIfConversationExists = await Conversation.findOne({userId,clientId});
            console.log(checkIfConversationExists,'checkIfConversationExists');
            if(checkIfConversationExists){
                return res.status(200).json({message:"Conversation Already Exists, Go chat"});
            }
            const newConversation = new Conversation({
               userId,
               clientId
            });
            const savedConversation = await newConversation.save();
            res.status(202).json({message:"Conversation Created",savedConversation});
    
        }
        catch(err){
            next(err);
        }
}