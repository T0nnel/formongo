const express = require('express');
const app = express();
const PORT = 3500;
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

app.use(express.json())

let db;

connectToDb((err) => {
    if (!err) {
        app.listen(PORT, () => {
            console.log("App listening on port " + PORT);
        });
        db = getDb();
    }
});

app.get('/bookie', (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database connection not established' });
    }

    const page = req.query.page || 0
    const booksPerPage = 3

    db.collection('bookie')
        .find()
        .sort({ author: 1 })
        .skip(page * booksPerPage)
        .limit(booksPerPage) 
        .toArray() // Convert the cursor to an array
        .then((bookie) => {
            res.status(200).json(bookie);
        })
        .catch((err) => {
            console.error("Error fetching books:", err);
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
});

app.get('/bookie/:id', (req, res) => {
    db.collection('bookie')
        .findOne({ _id: new ObjectId(req.params.id) }) // Add 'new' keyword here
        .then(doc => {
            if (!doc) {
                return res.status(404).json({ error: "Document not found" });
            }
            res.status(200).json(doc);
        })
        .catch(err => {
            console.error("Error fetching bookie:", err);
            res.status(500).json({ error: "Could not fetch the document" });
        });
});

app.post('/bookie' , (req , res) => {
    const book = req.body

    db.collection('bookie')
    .insertOne(book)
    .then(result => {
        res.status(201).json(result)
    })
    .catch(err => {
        res.status(500).json({error: "could not create a new docment"})
    })
})

app.delete('/bookie/:id', (req, res) => {
    db.collection('bookie')
        .deleteOne({ _id: new ObjectId(req.params.id) })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: "Document not found" });
            }
            res.status(200).json({ message: "Document deleted successfully" });
        })
        .catch(err => {
            console.error("Error deleting bookie:", err);
            res.status(500).json({ error: "Could not delete the document" });
        });
});

app.patch('/bookie/:id', (req, res) => {
    const updates = req.body;
    db.collection('bookie')
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
        .then(result => {
            if (result.modifiedCount === 0) {
                return res.status(404).json({ error: "Document not found or no updates applied" });
            }
            res.status(200).json({ message: "Document updated successfully" });
        })
        .catch(err => {
            console.error("Error updating bookie:", err);
            res.status(500).json({ error: "Could not update the document" });
        });
});
