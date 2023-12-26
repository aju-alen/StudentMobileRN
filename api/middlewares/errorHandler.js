export const errorHandler =(error,req,res,next)=>{
    const errorStatus = error.status || 500
    const errorMessage = error.message || "Something ewent wrong"
    
    return res.status(errorStatus).send(errorMessage)
  }

