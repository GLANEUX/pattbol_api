const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const sequelize = require('./src/config/database'); // Import de la configuration de la base de données

const app = express();
const port = process.env.PORT;


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


    // Définir le chemin du répertoire d'uploads
    const uploadsDirectory = path.join(__dirname, './src/uploads');
    // Définir une route pour servir les fichiers statiques dans le répertoire d'uploads
    app.use('/uploads', express.static(uploadsDirectory));


    
require('./src/models/UserModel');
require('./src/models/ProductModel');
require('./src/models/NutricionalsInformations');

    const userRoute = require('./src/routes/UserRoutes');
    app.use('/users', userRoute);

    const productRoute = require('./src/routes/ProductRoutes');
    app.use('/products', productRoute);



    sequelize.sync()
        .then(() => {
            app.listen(port, () => console.log(`Server is running on port ${port}`));
        })
        .catch(err => console.log('Error synchronizing the database: ' + err));