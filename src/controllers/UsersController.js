const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');


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



exports.getAll = async (req, res) => {
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

exports.get = async(req, res) => {
        try {
            const user = await User.findByPk(req.params.id);

            res.status(200).send(user);
        } catch (error) {
            res.status(500).send(error);
        }
    
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        const isPasswordValid = await user.validatePassword(password);

        if (!user) {
            return res.status(401).send({ message: 'Invalid creditentials'});
        }


        if (!isPasswordValid) {
            return res.status(401).send('Invalid creditentials');
        }

        const token = jwt.sign({ id: user.id, email: user.email, pseudo: user.pseudo, role: user.role  }, process.env.JWT_KEY, { expiresIn: '1h' });

        res.status(200).send({ message: `Logged in successfully ${token}` });
    } catch (error) {
        res.status(500).send({ message: 'error login', message: error });
    }
}