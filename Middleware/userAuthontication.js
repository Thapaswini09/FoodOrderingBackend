const jwt=require('jsonwebtoken');
const userAuthontication=(req,res,next)=>{
    try {
        const token = req.headers['x-access-token'];
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decoded = jwt.verify(token,process.env.USER_SECRET_KEY);
        req.user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

const adminAuthomtication=(req,res,next)=>{
    try {
        const token = req.headers['x-access-token'];
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decoded = jwt.verify(token,process.env.ADMIN_SECRET_KEY);
        req.admin = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
module.exports={adminAuthomtication,userAuthontication}