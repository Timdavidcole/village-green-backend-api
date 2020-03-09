var mongoose = require("mongoose");
var router = require("express").Router();
var passport = require("passport");
var User = mongoose.model("User");
var auth = require("../auth");
var geocoding = require("../../models/Geocoding");

router.post("/users", function(req, res, next) {
  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);
  user.address = req.body.user.address;


  geocoding
    .getCoordinates(user.address)
    .then(data => {
      user.location = {
        type: "Point",
        coordinates: [
          data.results[0].geometry.location.lat,
          data.results[0].geometry.location.lng
        ]
      };
    })
    .then(data => {
      user.save().then(function() {
        return res.json({
          user: user.toAuthJSON()
        });
      });
    })
    .catch(next);
});

router.post("/users/login", function(req, res, next) {
  if (!req.body.user.email) {
    return res.status(422).json({
      errors: {
        email: "can't be blank"
      }
    });
  }

  if (!req.body.user.password) {
    return res.status(422).json({
      errors: {
        password: "can't be blank"
      }
    });
  }

  passport.authenticate(
    "local",
    {
      session: false
    },
    function(err, user, info) {
      if (err) {
        return next(err);
      }

      if (user) {
        user.token = user.generateJWT();
        return res.json({
          user: user.toAuthJSON()
        });
      } else {
        return res.status(422).json(info);
      }
    }
  )(req, res, next);
});

router.get("/user", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return res.json({
        user: user.toAuthJSON()
      });
    })
    .catch(next);
});

router.put("/user", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.bio !== "undefined") {
        user.bio = req.body.user.bio;
      }
      if (typeof req.body.user.image !== "undefined") {
        user.image = req.body.user.image;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }
      if (typeof req.body.user.name !== "undefined") {
        user.name = req.body.user.name;
      }
      if (typeof req.body.user.dob !== "undefined") {
        user.dob = req.body.user.dob;
      }

      if (typeof req.body.user.address !== "undefined") {
        user.address = req.body.user.address;
        geocoding
          .getCoordinates(user.address)
          .then(data => {
            user.homeXCoord = data.results[0].geometry.location.lat;
            user.homeYCoord = data.results[0].geometry.location.lng;
          })
          .then(date => {
            user.save().then(function() {
              return res.json({
                user: user.toAuthJSON()
              });
            });
          })
          .catch(next);
      } else {
        return user.save().then(function() {
          User.findById(req.payload.id).then(function(userNew) {
            return res.json({
              user: userNew.toAuthJSON()
            });
          });
        });
      }
    })
    .catch(next);
});

module.exports = router;
