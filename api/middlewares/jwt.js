import jwt from 'jsonwebtoken'

const KNOWN_USER_TYPES = ['STUDENT', 'TEACHER', 'ADMIN', 'PARENT'];

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
        req.isParent = payload.userType === 'PARENT';
        req.email = payload.email;
        next()
    });
}

export const optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.split(' ')[1]) {
        return next();
    }
    return verifyToken(req, res, next);
};

export const requireRole = (...types) => {
    const allowed = types.map((type) => String(type).toUpperCase());
    const unknown = allowed.filter((type) => !KNOWN_USER_TYPES.includes(type));
    if (unknown.length > 0) {
        throw new Error(`Unknown user type(s) in requireRole: ${unknown.join(', ')}`);
    }

    return (req, res, next) => {
        if (!req.userId || !req.userType) {
            return res.status(401).json({ message: "You are not authenticated!" });
        }
        if (!allowed.includes(req.userType)) {
            return res.status(403).json({ message: "You are not allowed to perform this action" });
        }
        next();
    };
};

export const requireSelfParam = (paramName = 'userId') => {
    return (req, res, next) => {
        if (!req.userId) {
            return res.status(401).json({ message: "You are not authenticated!" });
        }
        const candidate = req.params?.[paramName] ?? req.body?.[paramName];
        if (!candidate || String(candidate) !== String(req.userId)) {
            return res.status(403).json({ message: "You are not allowed to perform this action" });
        }
        next();
    };
};