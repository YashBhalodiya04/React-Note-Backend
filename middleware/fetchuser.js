const jwt = require("jsonwebtoken");
const jwt_secret = "hello!";
const fetchuser = (req, res, next) =>{

    // Get user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(400).send({error:"Please authenticate using a valid token"});
    }

    const data = jwt.verify(token,jwt_secret);
    req.user = data.user;


    next();
}

module.exports = fetchuser;
