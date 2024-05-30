const User = require('../models/UserModel');


exports.create = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.create({
            username,
            email,
            password,
            role: 'user'
        });

        res.status(201).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};



exports.getAll = async (res) => {
    try {
        const users = await User.findAll();

        if(!users){
            res.status(400).send(error);
        }
        
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.get = async(res) => {
        try {
            const user = await User.findByPk(req.params.id);

            res.status(200).send(user);
        } catch (error) {
            res.status(500).send(error);
        }
    
}