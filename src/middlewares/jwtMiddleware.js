const jwt = require('jsonwebtoken');
require('dotenv').config()

exports.verifyToken = async(req, res, next) => {
    try{
        const token = req.headers['authorization'];
        if(token !== undefined) {
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(token,process.env.JWT_KEY,(error,decoded) => {
                if(error) {
                    reject(error);
                    }else {
                        resolve(decoded);
                    }
                });
            });
            req.user = payload;
            next();
        }else{
            res.status(403).status(403).json({message:"Acces interdit: token manquant"});
        }   
    }catch(error){
        console.log(error);
        res.status(403).json({message:"Acces interdit : token invalide"});
    }
}

exports.verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'User is not an admin' });
    }
    next();
};