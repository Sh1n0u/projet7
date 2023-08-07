const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

exports.signup = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({ message: 'Utilisateur créé' });
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de l'inscription" });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ userId: user._id, token });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la connexion' });
    }
};
