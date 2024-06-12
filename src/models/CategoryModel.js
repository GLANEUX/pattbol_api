const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./ProductModel');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'categories',
    timestamps: true,
    underscored: true
});

Product.hasMany(Category, {
    foreignKey: 'productId',
    as: 'Category'
});

Category.belongsTo(Product, {
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

module.exports = Category;
