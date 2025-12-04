import jwt from 'jsonwebtoken'
export const verifyToken = (req,res,next)=>{

    // console.log(req.headers.authorization,'this is the headers');
    
    
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).send("You are not authenticated!");

    jwt.verify(token,process.env.SECRET_KEY,async(err,payload)=>{
       
        if(err) return res.status(403).send("Token is not valid");
        req.userId = payload.userId;
        req.userType = payload.userType;
        // Derive isTeacher and isAdmin from userType for backward compatibility
        req.isTeacher = payload.userType === 'TEACHER';
        req.isAdmin = payload.userType === 'ADMIN';
        req.email = payload.email;
        next()
    });
}