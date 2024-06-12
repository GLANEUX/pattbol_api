const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { Sequelize } = require('sequelize');
const app = express();
const port = process.env.PORT;


require('./src/models/UserModel');
require('./src/models/ProductModel');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));


    const path = require('path');
    // Définir le chemin du répertoire d'uploads
    const uploadsDirectory = path.join(__dirname, './src/uploads');
    // Définir une route pour servir les fichiers statiques dans le répertoire d'uploads
    app.use('/uploads', express.static(uploadsDirectory));


    

    const userRoute = require('./src/routes/UserRoutes');
    app.use('/users', userRoute);

    const productRoute = require('./src/routes/ProductRoutes');
    app.use('/products', productRoute);


sequelize.sync().then(() => {
    app.listen(process.env.PORT, () => console.log(`Server is running on port ${port}`));
});