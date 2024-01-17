import dotenv from "dotenv";
import Message from "../models/message.js";
dotenv.config();



export const getMessages = async (req, res,next) => {
    console.log(req.params.conversationId);
  try{
    const messages = await Message.find({conversationId:req.params.conversationId});
    if(!messages){
      return res.status(404).json({message:"No messages found"});
    }
    res.status(200).json(messages);

  }
  catch(err){
    next(err);
  }
}

export const createMessage = async (req, res,next) => {
    const {} =  req.body;
    try{

    }
    catch(err){
        next(err);
    }
}
