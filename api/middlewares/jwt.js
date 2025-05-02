import jwt from 'jsonwebtoken'
export const verifyToken = (req,res,next)=>{

    // console.log(req.headers.authorization,'this is the headers');
    
    
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).send("You are not authenticated!");

    jwt.verify(token,process.env.SECRET_KEY,async(err,payload)=>{
       
        if(err) return ResizeObserverSize.status(403).send("Token is not valid");
        req.userId = payload.userId;
        req.isTeacher = payload.isTeacher;
        req.isAdmin = payload.isAdmin;
        req.email = payload.email;
        next()
    });
}