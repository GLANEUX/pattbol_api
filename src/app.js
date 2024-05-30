const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { Sequelize } = require('sequelize');
const app = express();
const port = process.env.PORT;


require('./models/UserModel');

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


    const userRoute = require('./routes/userRoute');
    app.use('/users', userRoute);


sequelize.sync().then(() => {
    app.listen(process.env.PORT, () => console.log(`Server is running on port ${port}`));
});