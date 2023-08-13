const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

exports.signup = async (request, response) => {
    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10);
        const user = new User({
            email: request.body.email,
            password: hashedPassword,
        });
        await user.save();
        response.status(201).json({ message: 'Utilisateur créé' });
    } catch (error) {
        response.status(500).json({ error: "Une erreur est survenue lors de l'inscription" });
    }
};

exports.login = async (request, response) => {
    try {
        const user = await User.findOne({ email: request.body.email });
        if (!user) {
            return response.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
        const isPasswordValid = await bcrypt.compare(request.body.password, user.password);
        if (!isPasswordValid) {
            return response.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        response.status(200).json({ userId: user._id, token });
    } catch (error) {
        response.status(500).json({ error: 'Une erreur est survenue lors de la connexion' });
    }
};
