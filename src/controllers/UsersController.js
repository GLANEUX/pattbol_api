const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');


exports.create = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Vérification des données d'entrée
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: "Tous les champs doivent être remplis." });
        }

        // Validation de l'email
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "L'email n'est pas valide." });
        }

   // Vérification de l'unicité de l'email
const existingUserWithEmail = await User.findOne({ where: { email } });
if (existingUserWithEmail) {
    return res.status(400).json({ error: "L'email est déjà utilisé." });
}

// Vérification de l'unicité du nom d'utilisateur
const existingUserWithUsername = await User.findOne({ where: { username } });
if (existingUserWithUsername) {
    return res.status(400).json({ error: "Le nom d'utilisateur est déjà utilisé." });
}


        // Vérification de la sécurité du mot de passe
        if (!isSecurePassword(password)) {
            return res.status(400).json({ error: "Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial parmi @$!%*?&, et avoir une longueur minimale de 8 caractères." });
        }

        // Vérification si les mots de passe correspondent
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
        }

        // Création de l'utilisateur
        const user = await User.create({
            username,
            email,
            password,
            role: 'user'
        });

        // Génération du token JWT
        const token = jwt.sign({ id: user.id, email: user.email, pseudo: user.pseudo, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });

        res.status(201).json({ token: token, details: "Vous êtes connecté." });
    } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la création de l'utilisateur:", error);
        res.status(500).json({ error: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

function isValidEmail(email) {
    // Expression régulière pour valider le format de l'email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


function isSecurePassword(password) {
    // Validation des critères de sécurité du mot de passe
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Recherche de l'utilisateur dans la base de données
        const user = await User.findOne({ where: { email } });

        // Vérification si l'utilisateur existe
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        
        // Vérification de la validité du mot de passe
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Identifiantss invalides.' });
        }
        
        // Génération du token JWT
        const token = jwt.sign({ id: user.id, email: user.email, pseudo: user.pseudo, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });

        // Réponse avec le token
        res.status(200).json({ token, details: "Vous êtes connecté." });
    } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la connexion de l'utilisateur:", error);
        res.status(500).json({ error: "Une erreur est survenue lors du traitement de votre demande." });
    }
};



exports.getAll = async (req, res) => {
    try {
        const users = await User.findAll();

        if (!users) {
            res.status(400).send(error);
        }

        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.get = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }

}

