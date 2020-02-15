var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var secret = require("../config").secret;

console.log("USER MODEL IS BEING READ");

var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true
    },
    name: String,
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    address: String,
    bio: String,
    location: {
      type: { type: String },
      coordinates: []
    },
    dob: String,
    image: String,
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notice"
      }
    ],
    upVoted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notice"
      }
    ],
    downVoted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notice"
      }
    ],
    hash: String,
    salt: String
  },
  {
    timestamps: true
  }
);

UserSchema.index({ location: "2dsphere" });

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000)
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image:
      this.image || "https://static.productionready.io/images/smiley-cyrus.jpg",
    address: this.address,
    location: this.location,
    id: this._id
  };
};

UserSchema.methods.toProfileJSONFor = function(user) {
  return {
    username: this.username,
    bio: this.bio,
    image:
      this.image || "https://static.productionready.io/images/smiley-cyrus.jpg",
    address: this.address,
    location: this.location,
    id: this._id,
    following: false
  };
};

UserSchema.methods.favorite = function(id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites.push(id);
  }

  return this.save();
};

UserSchema.methods.unfavorite = function(id) {
  this.favorites.remove(id);
  return this.save();
};

UserSchema.methods.isFavorite = function(id) {
  return this.favorites.some(function(favoriteId) {
    return favoriteId.toString() === id.toString();
  });
};

UserSchema.methods.upVote = function(id) {
  if (this.upVoted.indexOf(id) === -1) {
    this.upVoted.push(id);
  }

  return this.save();
};

UserSchema.methods.removeUpVote = function(id) {
  this.upVoted.remove(id);
  return this.save();
};

UserSchema.methods.isUpVoted = function(id) {
  return this.upVoted.some(function(upVotedId) {
    return upVotedId.toString() === id.toString();
  });
};

UserSchema.methods.downVote = function(id) {
  if (this.downVoted.indexOf(id) === -1) {
    this.downVoted.push(id);
  }

  return this.save();
};

UserSchema.methods.removeDownVote = function(id) {
  this.downVoted.remove(id);
  return this.save();
};

UserSchema.methods.isDownVoted = function(id) {
  return this.downVoted.some(function(downVotedId) {
    return downVotedId.toString() === id.toString();
  });
};

UserSchema.plugin(uniqueValidator, {
  message: "is already taken."
});

mongoose.model("User", UserSchema);
