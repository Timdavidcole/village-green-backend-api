var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var slug = require("slug");
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
    childNotices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notice"
      }
    ],
    parentNotice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notice"
    },
    pinCount: {
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
    },
    location: {
      type: { type: String },
      coordinates: []
    }
  },
  {
    timestamps: true
  }
);

NoticeSchema.index({ location: "2dsphere" });

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

NoticeSchema.methods.updatePinCount = function() {
  var notice = this;

  return User.countDocuments({
    pinned: {
      $in: [notice._id]
    }
  }).then(function(count) {
    notice.pinnedCount = count;

    return notice.save();
  });
};

NoticeSchema.methods.updateUpVoteCount = function() {
  var notice = this;

  return User.countDocuments({
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

  return User.countDocuments({
    downVoted: {
      $in: [notice._id]
    }
  }).then(function(count) {
    notice.downVotesCount = count;

    return notice.save();
  });
};

NoticeSchema.methods.toJSONFor = function(user) {
  console.log(this.body);
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    image: this.image,
    comments: this.comments,
    pinnedCount: this.pinnedCount,
    upVotesCount: this.upVotesCount,
    downVotesCount: this.downVotesCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    author: this.author.toProfileJSONFor(user),
    isPinned: user ? user.isPinned(this._id) : false,
    isUpVoted: user ? user.isUpVoted(this._id) : false,
    isDownVoted: user ? user.isDownVoted(this._id) : false,
    id: this._id,
    location: this.location
  };
};

mongoose.model("Notice", NoticeSchema);
