const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const userRoutes = require('./routes/userr');
const bookRoutes = require('./routes/bookr');

const app = express();

//GEstion du CORS
app.use(cors());
app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.setHeader('Access-Control-Allow-Credentials', true); // Si vous utilisez des cookies pour l'authentification
    next();
});

// connexion à la DB
mongoose
    .connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.log('Connexion à MongoDB échouée !', error));
process.env.IMAGE_DIR = __dirname + '/images/';
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', bookRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
