import dotenv from "dotenv";
dotenv.config();



export const getMessages = async (req, res,next) => {
    console.log(req.params.conversationId);
  try{
    const messages = await Message.find({conversationId:req.params.conversationId});
    if(!messages){
      return res.status(404).json({message:"No messages found"});
    }
    return res.status(200).json(messages);

  }
  catch(err){
    next(err);
  }
}

export const createMessage = async (req, res,next) => {
  const {} =  req.body;
  const messages = {
    senderId:req.userId,
    message:"My Name is Alen"
  } 
    try{
      const findExistingMessage = await Message.findOne({conversationId:req.params.conversationId});

      if(findExistingMessage){
        findExistingMessage.messages.push(messages);
        const savedMessage = await findExistingMessage.save();
        if(!savedMessage){
          return res.status(404).json({message:"No messages found"});
        }
        return res.status(200).json(savedMessage);
      }
      else{const message = await Message.create({conversationId:req.params.conversationId, messages });
      if(!message){
        return res.status(404).json({message:"No messages found"});
      }
      return res.status(200).json(message);
    }

    }
    catch(err){
        next(err);
    }
}

export const openConversation = async (req, res,next) => {
    const {} =  req.body;
    const messages = {
      senderId:req.userId,
      message:"Hello"
    }
    try{
      const message = await Message.create({conversationId:req.params.conversationId, messages});
      if(!message){
        return res.status(404).json({message:"No messages found"});
      }
      return res.status(200).json(message);

    }
    catch(err){
        next(err);
    }
}



