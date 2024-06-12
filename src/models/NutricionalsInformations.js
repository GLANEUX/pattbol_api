const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./ProductModel');

const NutricionalsInformations = sequelize.define('NutricionalsInformations', {
    ref: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
}, {
    tableName: 'nutricionals_informations',
    timestamps: true,
    underscored: true
});


Product.hasMany(NutricionalsInformations, {
    foreignKey: 'productId',
    as: 'nutricionalInformations'
});

NutricionalsInformations.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});





(async () => {
    try {
        await Product.sync({ force: false });
        console.log("Modèle Table NutricionalsInformations synchronisé avec la base de données.");
    } catch (error) {
        console.error("Erreur lors de la synchronisation du modèle Table: NutricionalsInformations", error);
    }
})();
module.exports = NutricionalsInformations;
