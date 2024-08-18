const jwt = require('jsonwebtoken');
// const errorHandler = require("../utilities/errorHandler");

const verifyToken = (req, res, next) => {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // console.log(token);

    if(!token) {
        return res.status(401).json({
            success: false,
            message : "you are not authorized",
        })
    }

    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {

        if(err){
            return res.status(403).json({
                success: false,
                message : "Invalid token",
            })
        }

        req.user = user;
        // console.log("user" , req.user);

        next();
    });
};


module.exports = {
    verifyToken
};