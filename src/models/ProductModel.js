const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

const Product = sequelize.define('Product', {
    title: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                message: 'Please enter a title',
            },
        },
    },
    statut: {
        type: Sequelize.STRING(50),
        allowNull: true,
    },
    quantity: {
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    quantityUnit: {
        type: Sequelize.STRING(50),
        allowNull: true,
    },
    barCode: {
        type: Sequelize.STRING(50),
        allowNull: true,
    },
    rate: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    link: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    conditioning: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    brand: {
        type: Sequelize.STRING(50),
        allowNull: true,
    },
    ingredientsList: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    alergens: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    ingredientsOrigin: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    manufacturingProcessingLocation: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    labelsCertifAwards: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    possibleTraces: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    addedAminoAcid: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    addedVitamins: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    addedMinerals: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    additives: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    picture: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    ingredientsPicture: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    nutricionalInformationPicture: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true
});

(async () => {
    try {
        await Product.sync({ force: false });
        console.log("Modèle Table Products synchronisé avec la base de données.");
    } catch (error) {
        console.error("Erreur lors de la synchronisation du modèle Table: products", error);
    }
})();

module.exports = Product;
