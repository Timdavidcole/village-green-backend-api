var mongoose = require('mongoose');
var User = mongoose.model('User');
var Notice = mongoose.model('Notice');
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug'); // package we'll use to auto create URL slugs
var User = mongoose.model('User');

var CommentSchema = new mongoose.Schema({
  body: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }
}, {
  timestamps: true
});

// Requires population of author
CommentSchema.methods.toJSONFor = function(user) {

  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user),
  };
};

mongoose.model('Comment', CommentSchema);