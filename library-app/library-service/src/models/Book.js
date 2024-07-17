const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  authors: {
    type: String,
    required: true
  },
  favorite: {
    type: Boolean,
    default: false
  },
  fileCover: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Book', bookSchema);