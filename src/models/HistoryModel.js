const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./ProductModel');
const User = require('./UserModel');

const History = sequelize.define('History', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
}, {
    tableName: 'history',
    timestamps: true,
    underscored: true
});

// Association avec Product
Product.hasMany(History, {
    foreignKey: 'productId',
    as: 'productHistories' // Utilisation d'un alias unique
});

History.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// Association avec User
User.hasMany(History, {
    foreignKey: 'userId',
    as: 'userHistories' // Utilisation d'un alias unique
});

History.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

(async () => {
    try {
        await History.sync({ force: false });
        console.log("Modèle Table History synchronisé avec la base de données.");
    } catch (error) {
        console.error("Erreur lors de la synchronisation du modèle Table: History", error);
    }
})();

module.exports = History;
