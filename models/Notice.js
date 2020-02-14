var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var slug = require("slug"); // package we'll use to auto create URL slugs
var User = mongoose.model("User");

var NoticeSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      lowercase: true,
      unique: true
    },
    title: String,
    description: String,
    body: String,
    image: String,
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    favoritesCount: {
      type: Number,
      default: 0
    },
    upVotesCount: {
      type: Number,
      default: 0
    },
    downVotesCount: {
      type: Number,
      default: 0
    },
    tagList: [
      {
        type: String
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

NoticeSchema.plugin(uniqueValidator, {
  message: "is already taken"
});

NoticeSchema.methods.slugify = function() {
  this.slug =
    slug(this.title) +
    "-" +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

NoticeSchema.pre("validate", function(next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

NoticeSchema.methods.updateFavoriteCount = function() {
  var notice = this;

  return User.count({
    favorites: {
      $in: [notice._id]
    }
  }).then(function(count) {
    notice.favoritesCount = count;

    return notice.save();
  });
};

NoticeSchema.methods.updateUpVoteCount = function() {
  var notice = this;
  console.log("running updateUpVoteCount");

  return User.count({
    upVoted: {
      $in: [notice._id]
    }
  }).then(function(count) {
    notice.upVotesCount = count;

    return notice.save();
  });
};

NoticeSchema.methods.updateDownVoteCount = function() {
  var notice = this;

  return User.count({
    downVoted: {
      $in: [notice._id]
    }
  }).then(function(count) {
    notice.downVotesCount = count;

    return notice.save();
  });
};

NoticeSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    image: this.image,
    comments: this.comments,
    favoritesCount: this.favoritesCount,
    upVotesCount: this.upVotesCount,
    downVotesCount: this.downVotesCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    author: this.author.toProfileJSONFor(user),
    isFavorite: user ? user.isFavorite(this._id) : false,
    isUpVoted: user ? user.isUpVoted(this._id) : false,
    isDownVoted: user ? user.isDownVoted(this._id) : false,
    id: this._id
  };
};

mongoose.model("Notice", NoticeSchema);
