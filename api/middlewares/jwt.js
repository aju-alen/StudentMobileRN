import jwt from 'jsonwebtoken'
export const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ message: "You are not authenticated!" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "You are not authenticated!" });

    jwt.verify(token,process.env.SECRET_KEY,async(err,payload)=>{
       
        if(err) return res.status(403).json({ message: "Token is not valid" });
        req.userId = payload.userId;
        req.userType = payload.userType;
        // Derive isTeacher and isAdmin from userType for backward compatibility
        req.isTeacher = payload.userType === 'TEACHER';
        req.isAdmin = payload.userType === 'ADMIN';
        req.email = payload.email;
        next()
    });
}