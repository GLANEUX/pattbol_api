const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

const bcrypt = require('bcryptjs');


const User = sequelize.define('User', {
    username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
              msg: 'Please enter your username',
            },
          },
    },
    email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        isEmail: true,        
    },
    password: {
        type: Sequelize.STRING,
        set(value) {
            const hash = bcrypt.hashSync(value, 10);
            this.setDataValue('password', hash);
        },
        allowNull: false
    },
    
    role: {
        type: Sequelize.STRING,
        defaultValue: 'user',
        allowNull: false,
        isIn: [['user', 'admin']],
    },
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

(async () => {
    try {
        await User.sync({ force: false });
        console.log("Modèle Table Users synchronisé avec la base de données.");
    } catch (error) {
        console.error("Erreur lors de la synchronisation du modèle Table: Users", error);
    }
})();

User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = User;