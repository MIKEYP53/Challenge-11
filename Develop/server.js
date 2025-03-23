// 
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests
app.use(express.static('public')); // Serves static files from the 'public' directory

// Notes Html Route
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// API Routes

// Get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading notes.' });
    }
    const notes = JSON.parse(data);
    res.json(notes); 
  });
});

// Save a new note
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  const newNote = {
    id: uuidv4(), // Make a unique id
    title,
    text,
  };

  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) throw err;
      res.json(newNote);
    });
  });
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read notes' });
    }

    let notes = JSON.parse(data);

    // Filter the note with its unique id
    notes = notes.filter(note => note.id !== noteId);

    fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      res.json({ message: 'Note deleted successfully' });
    });
  });
});

// Catch all route for the Index Html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
