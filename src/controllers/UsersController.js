const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

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

exports.create = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Vérification des données d'entrée
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Tous les champs doivent être remplis." });
        }

        // Validation de l'email
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "L'email n'est pas valide." });
        }

        // Vérification de l'unicité de l'email
        const existingUserWithEmail = await User.findOne({ where: { email } });
        if (existingUserWithEmail) {
            return res.status(400).json({ message: "L'email est déjà utilisé." });
        }

        // Vérification de l'unicité du nom d'utilisateur
        const existingUserWithUsername = await User.findOne({ where: { username } });
        if (existingUserWithUsername) {
            return res.status(400).json({ message: "Le nom d'utilisateur est déjà utilisé." });
        }


        // Vérification de la sécurité du mot de passe
        if (!isSecurePassword(password)) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial parmi @$!%*?&, et avoir une longueur minimale de 8 caractères." });
        }

        // Vérification si les mots de passe correspondent
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }

        // Création de l'utilisateur
        const user = await User.create({
            username,
            email,
            password,
            role: 'user'
        });

        // Génération du token JWT
        const token = jwt.sign({ id: user.id}, process.env.JWT_KEY, { expiresIn: '1h' });

        res.status(201).json({ token: token, details: "Vous êtes connecté." });
    } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la création de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Vérification si l'utilisateur existe
        if (!email || !password) {
            return res.status(401).json({ message: 'Vous devez remplir tous les champs.' });
        }
        // Recherche de l'utilisateur dans la base de données
        const user = await User.findOne({ where: { email } });

        // Vérification si l'utilisateur existe
        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }


        // Vérification de la validité du mot de passe
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        // Génération du token JWT
        const token = jwt.sign({ id: user.id}, process.env.JWT_KEY, { expiresIn: '1h' });

        // Réponse avec le token
        res.status(200).json({ token, details: "Vous êtes connecté." });
    } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la connexion de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.getUserIdFromToken = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({ message: "Accès interdit: token manquant" });
        }

        const payload = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(decoded);
                }
            });
        });

        res.status(200).json({ id: payload.id });
    } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        res.status(403).json({ message: "Accès interdit : token invalide" });
    }
};

exports.get = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(401).json({ message: 'Cet utilisateur n\'existe pas' });
        }

        res.status(200).send(user);
    } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la connexion de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }

}

exports.modify = async (req, res) => {
    try {

        const userId = req.params.id;
        // Recherche de l'utilisateur dans la base de données
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }        const { username, email } = req.body;

        // Vérification des données d'entrée
        if (!username || !email) {
            return res.status(400).json({ message: "Tous les champs doivent être remplis." });
        }

        if (user.email != email) {
            // Vérification de l'unicité de l'email
            const existingUserWithEmail = await User.findOne({ where: { email } });
            if (existingUserWithEmail) {
                return res.status(400).json({ message: "L'email est déjà utilisé." });
            }
        }
        if (user.username != username) {

            // Vérification de l'unicité du nom d'utilisateur
            const existingUserWithUsername = await User.findOne({ where: { username } });
            if (existingUserWithUsername) {
                return res.status(400).json({ message: "Le nom d'utilisateur est déjà utilisé." });
            }
        }

        // Validation de l'email
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "L'email n'est pas valide." });
        }

        // Sauvegarde des modifications dans la base de données
        await User.update({ username: username, email: email }, { where: { id: userId } });

        res.status(200).json({ message: "Utilisateur mis à jour avec succès." });
    } catch (error) {
        console.error("Erreur lors de la modification de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.modifyPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

      // Recherche de l'utilisateur dans la base de données
      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

        // Vérification des données d'entrée
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Tous les champs doivent être remplis." });
        }

  

        // Vérification si le mot de passe actuel correspond
        const isPasswordValid = await user.validatePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe actuel incorrect." });
        }

        // Vérification si les nouveaux mots de passe correspondent
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Les nouveaux mots de passe ne correspondent pas." });
        }

        // Vérification de la sécurité du nouveau mot de passe
        if (!isSecurePassword(newPassword)) {
            return res.status(400).json({ message: "Le nouveau mot de passe ne respecte pas les critères de sécurité minimum." });
        }

        await User.update({ password: newPassword }, { where: { id: userId } });

        res.status(200).json({ message: "Mot de passe modifié avec succès." });
    } catch (error) {
        console.error("Erreur lors de la modification du mot de passe de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { confirmPassword } = req.body;

        // Recherche de l'utilisateur dans la base de données
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        // Vérification des données d'entrée
        if (!confirmPassword) {
            return res.status(401).json({ message: "Mot de passe est incorrect." });
        }

        // Vérification si le mot de passe actuel correspond
        const isPasswordValid = await user.validatePassword(confirmPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe est incorrect." });
        }
        // Suppression de l'utilisateur
        await User.destroy({ where: { id: userId } });

        res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};
