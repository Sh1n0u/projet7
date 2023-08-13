const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookc');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.get('/books/bestrating', bookController.getTopRatedBooks);
router.post('/books', auth, multer, bookController.createBook); //route création de livre
router.get('/books', bookController.getAllBook); //route affichage de tout les livres
router.get('/books/:id', bookController.getOneBook); //route affichage d'un seul livre
router.delete('/books/:id', auth, bookController.deleteBook); //route suppression d'un livre
router.put('/books/:id', auth, multer, bookController.updateBook); //route modification livre


module.exports = router;
