var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug'); // package we'll use to auto create URL slugs

var NoticeSchema = new mongoose.Schema({
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  title: String,
  description: String,
  body: String,
  image: String,
  upVotes: {
    type: Number,
    default: 0
  },
  downVotes: {
    type: Number,
    default: 0
  },
  tagList: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

NoticeSchema.plugin(uniqueValidator, {
  message: 'is already taken'
});

NoticeSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

NoticeSchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

NoticeSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    image: this.image,
    upVotes: this.upVotes,
    downVotes: this.downVotes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Notice', NoticeSchema);