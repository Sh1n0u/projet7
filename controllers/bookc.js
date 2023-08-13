const Book = require('../models/Book');

// création de livre
exports.createBook = (request, response, next) => {
    const bookObject = JSON.parse(request.body.book);
    delete bookObject._id;
    delete bookObject.userId;

    const book = new Book({
        ...bookObject,
        userId: request.auth.userId,
        imageUrl: `${request.protocol}://${request.get('host')}/images/${request.file.filename}`,
    });

    book.save()
        .then(() => {
            response.status(201).json({ message: 'Objet enregistré !' });
        })
        .catch((error) => {
            response.status(400).json({ error });
        });
};


// Affichage de tout les livres
exports.getAllBook = (request, response, next) => {
    Book.find()
        .then((books) => response.status(200).json(books))
        .catch((error) => response.status(500).json({ error }));
};


// Affichage d'un livre sélectionné
exports.getOneBook = (request, response, next) => {
    const bookId = request.params.id;

    Book.findById(bookId)
        .then((book) => {
            response.status(200).json(book);
        })
        .catch((error) => {
            response.status(400).json({ error });
        });
};

exports.deleteBook = (request, response, next) => {
    const bookId = request.params.id;

    Book.findById(bookId)
        .then((book) => {
            if (!book) {
                return response.status(404).json({ message: 'Livre non trouvé !' });
            }

            // Vérifier si l'utilisateur courant est celui qui a posté le livre
            if (book.userId !== request.auth.userId) {
                return response
                    .status(403)
                    .json({ message: "Accès interdit. Vous n'êtes pas autorisé à supprimer ce livre." });
            }

            // Si l'utilisateur est autorisé, supprimer le livre
            Book.findByIdAndRemove(bookId)
                .then(() => {
                    response.status(200).json({ message: 'Livre supprimé avec succès.' });
                })
                .catch((error) => {
                    response.status(500).json({ error });
                });
        })
        .catch((error) => {
            response.status(500).json({ error });
        });
};

//

exports.updateBook = (request, response, next) => {
    const bookId = request.params.id;

    // Vérifier si l'utilisateur courant est celui qui a posté le livre
    Book.findOne({ _id: bookId, userId: request.auth.userId })
        .then((book) => {
            if (!book) {
                return response.status(404).json({ message: 'Livre non trouvé ou accès interdit !' });
            }

            // Si une image est téléchargée, mettre à jour l'imageUrl du livre
            if (request.file) {
                book.imageUrl = `${request.protocol}://${request.get('host')}/images/${request.file.filename}`;
            }

            // Mettre à jour les champs du livre avec les nouvelles données
            if (request.body.book) {
                const bookObject = JSON.parse(request.body.book);
                book.title = bookObject.title;
                book.author = bookObject.author;
                book.year = bookObject.year;
                book.genre = bookObject.genre;
            } else {
                // Si les informations du livre sont directement dans le corps de la requête
                book.title = request.body.title;
                book.author = request.body.author;
                book.year = request.body.year;
                book.genre = request.body.genre;
            }

            // Sauvegarder les modifications dans la base de données en utilisant findOneAndUpdate avec l'option overwrite: true
            Book.findOneAndUpdate({ _id: bookId }, book, { overwrite: true })
                .then(() => {
                    response.status(200).json({ message: 'Livre mis à jour avec succès.' });
                })
                .catch((error) => {
                    response.status(500).json({ error });
                });
        })
        .catch((error) => {
            response.status(500).json({ error });
        });
};

exports.getTopRatedBooks = (request, response, next) => {
    Book.aggregate([
        {
            $match: { averageRating: { $gt: 0 } }, // Filtrer les livres avec une note moyenne supérieure à zéro
        },
        {
            $project: {
                _id: 1,
                title: 1,
                author: 1,
                imageUrl: 1,
                year: 1,
                genre: 1,
                averageRating: 1,
            },
        },
        {
            $sort: { averageRating: -1 }, // Trier par ordre décroissant de la note moyenne
        },
        {
            $limit: 3, // Récupérer les trois premiers livres après le tri
        },
    ])
        .then((topRatedBooks) => {
            response.status(200).json(topRatedBooks);
        })
        .catch((error) => {
            response.status(500).json({ error });
        });
};

// exports.addRating = (request, response, next) => {
//     const bookId = request.params.id;
//     const { userId, grade } = request.body;

//     Book.findById()
// };
