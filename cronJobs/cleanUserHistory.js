// Importations nécessaires
const cron = require('node-cron');
const User = require('../src/models/UserModel');
const History = require('../src/models/HistoryModel');

// Définition de la tâche Cron pour nettoyer l'historique des utilisateurs
cron.schedule('0 * * * *', async () => {
    try {
        const users = await User.findAll(); // Récupérer tous les utilisateurs

        for (const user of users) {
            const userId = user.id;

            // Récupérer les entrées d'historique de l'utilisateur
            const userHistory = await History.findAll({ where: { userId }, order: [['updatedAt', 'DESC']] });

            const maxHistoryEntries = 20;
            // Supprimer les entrées excédant le maximum autorisé
            if (userHistory.length > maxHistoryEntries) {
                const entriesToDelete = userHistory.slice(maxHistoryEntries);
                await History.destroy({ where: { id: entriesToDelete.map(entry => entry.id) } });
            }
        }
    } catch (error) {
        console.error("Erreur lors de l'exécution de la tâche Cron pour nettoyer l'historique des utilisateurs:", error);
    }
});
