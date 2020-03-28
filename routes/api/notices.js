var router = require("express").Router();
var mongoose = require("mongoose");
var Notice = mongoose.model("Notice");
var Comment = mongoose.model("Comment");
var User = mongoose.model("User");
var auth = require("../auth");

router.get("/", auth.optional, function(req, res, next) {
  var query = {};
  var limit = 8;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.coords !== "undefined") {
    coords = JSON.parse(req.query.coords);
  } else coords = { lat: 51.508402, lng: -0.126326 };

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== "undefined") {
    query.tagList = {
      $in: [req.query.tag]
    };
  }

  Promise.all([
    req.query.author
      ? User.findOne({
          username: req.query.author
        })
      : null,
    req.query.pinned
      ? User.findOne({
          username: req.query.pinned
        })
      : null
  ])
    .then(function(results) {
      var author = results[0];
      var pinner = results[1];
      if (author) {
        query.author = author._id;
      }

      if (pinner) {
        query._id = {
          $in: pinner.pinned
        };
      } else if (req.query.pinned) {
        query._id = {
          $in: []
        };
      }
      if (pinner) {
        return Promise.all([
          Notice.find()
            .where("_id")
            .in(pinner.pinned)
            .limit(Number(limit))
            .skip(Number(offset))
            .populate("author")
            .exec(),
          Notice.countDocuments(query).exec(),
          req.payload ? User.findById(req.payload.id) : null
        ]).then(function(results) {
          var notices = results[0];
          var noticesCount = results[1];
          var user = results[2];
          return res.json({
            notices: notices.map(function(notice) {
              return notice.toJSONFor(user);
            }),
            noticesCount: noticesCount
          });
        });
      } else {
        return Promise.all([
          Notice.find({
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [coords.lng, coords.lat]
                }
              }
            },
            parent: "global"
          })
            .limit(Number(limit))
            .skip(Number(offset))
            .populate("author")
            .exec(),
          Notice.countDocuments(query).exec(),
          req.payload ? User.findById(req.payload.id) : null
        ]).then(function(results) {
          var notices = results[0];
          var noticesCount = results[1];
          var user = results[2];
          return res.json({
            notices: notices.map(function(notice) {
              return notice.toJSONFor(user);
            }),
            noticesCount: noticesCount
          });
        });
      }
    })
    .catch(next);
});

router.post("/", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var notice = new Notice(req.body.notice);

      notice.author = user;
      notice.location = {
        type: "Point",
        coordinates: [
          user.location.coordinates[0],
          user.location.coordinates[1]
        ]
      };

      if (req.body.notice.parentNotice !== undefined) {
        Notice.findOne({
          slug: req.body.notice.parentNotice
        })
          .populate("author")
          .then(function(noticeParent) {
            if (!noticeParent) {
              return res.sendStatus(404);
            }
            notice.parent = noticeParent.slug;
            noticeParent.noticeChildren.push(notice);

            return next();
          })
          .catch(next);
      } else {
        notice.parent = 'global'
      }

      return notice.save().then(function(notice1) {
        console.log(notice1);
        return res.json({
          notice: notice.toJSONFor(user)
        });
      });
    })
    .catch(next);
});

router.get("/:notice", auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.notice.populate("author").execPopulate()
  ])
    .then(function(results) {
      var user = results[0];

      return res.json({
        notice: req.notice.toJSONFor(user)
      });
    })
    .catch(next);
});

router.put("/:notice", auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (req.notice.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.notice.title !== "undefined") {
        req.notice.title = req.body.notice.title;
      }

      if (typeof req.body.notice.description !== "undefined") {
        req.notice.description = req.body.notice.description;
      }

      if (typeof req.body.notice.body !== "undefined") {
        req.notice.body = req.body.notice.body;
      }

      if (typeof req.body.notice.image !== "undefined") {
        req.notice.image = req.body.notice.image;
      }

      if (typeof req.body.notice.tagList !== "undefined") {
        req.notice.tagList = req.body.notice.tagList;
      }

      req.notice
        .save()
        .then(function(notice) {
          return res.json({
            notice: notice.toJSONFor(user)
          });
        })
        .catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

router.delete("/:notice", auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function() {
    if (req.notice.author._id.toString() === req.payload.id.toString()) {
      return req.notice.remove().then(function() {
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  });
});

router.get("/:notice/children", auth.optional, function(req, res, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null)
    .then(function(user) {
      return req.notice
        .populate({
          path: "noticeChildren",
          populate: {
            path: "author"
          },
          options: {
            sort: {
              createdAt: "desc"
            }
          }
        })
        .execPopulate()
        .then(function(notice) {
          console.log('notice with children')
          console.log(notice)
          return res.json({
            noticeChildren: req.notice.childNotices.map(function(notice) {
              console.log('map notices')
              return notice.toJSONFor(user);
            })
          });
        });
    })
    .catch(next);
});

router.post("/:notice/comments", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var comment = new Comment(req.body.comment);
      comment.notice = req.notice;
      comment.author = user;

      return comment.save().then(function() {
        req.notice.comments.push(comment);

        return req.notice.save().then(function(notice) {
          res.json({
            comment: comment.toJSONFor(user)
          });
        });
      });
    })
    .catch(next);
});

router.get("/:notice/comments", auth.optional, function(req, res, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null)
    .then(function(user) {
      return req.notice
        .populate({
          path: "comments",
          populate: {
            path: "author"
          },
          options: {
            sort: {
              createdAt: "desc"
            }
          }
        })
        .execPopulate()
        .then(function(notice) {
          return res.json({
            comments: req.notice.comments.map(function(comment) {
              return comment.toJSONFor(user);
            })
          });
        });
    })
    .catch(next);
});

router.delete("/:notice/comments/:comment", auth.required, function(
  req,
  res,
  next
) {
  if (req.comment.author.toString() === req.payload.id.toString()) {
    req.notice.comments.remove(req.comment._id);
    req.notice
      .save()
      .then(
        Comment.find({
          _id: req.comment._id
        })
          .remove()
          .exec()
      )
      .then(function() {
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

router.put("/:notice/comments/:comment", auth.required, function(
  req,
  res,
  next
) {
  User.findById(req.payload.id).then(function(user) {
    if (req.comment.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.comment.body !== "undefined") {
        req.comment.body = req.body.comment.body;
      }

      req.comment.save();
      req.comment
        .populate("author")
        .execPopulate()
        .then(function(commentNew) {
          return res.json({
            comments: req.comment.toJSONFor(user)
          });
        })
        .catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

router.post("/:notice/pin", auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.pin(noticeId).then(function() {
        return req.notice.updatePinCount().then(function(notice) {
          return res.json({
            notice: notice.toJSONFor(user)
          });
        });
      });
    })
    .catch(next);
});

router.post("/:notice/upvote", auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.upVote(noticeId).then(function() {
        return req.notice.updateUpVoteCount().then(function(notice) {
          return res.json({
            notice: notice.toJSONFor(user)
          });
        });
      });
    })
    .catch(next);
});

router.post("/:notice/downvote", auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.downVote(noticeId).then(function() {
        return req.notice.updateDownVoteCount().then(function(notice) {
          return res.json({
            notice: notice.toJSONFor(user)
          });
        });
      });
    })
    .catch(next);
});

router.delete("/:notice/pin", auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unpin(noticeId).then(function() {
        return req.notice.updatePinCount().then(function(notice) {
          return res.json({
            notice: notice.toJSONFor(user)
          });
        });
      });
    })
    .catch(next);
});

router.delete("/:notice/upvote", auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.removeUpVote(noticeId).then(function() {
        return req.notice.updateUpVoteCount().then(function(notice) {
          return res.json({
            notice: notice.toJSONFor(user)
          });
        });
      });
    })
    .catch(next);
});

router.delete("/:notice/downvote", auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.removeDownVote(noticeId).then(function() {
        return req.notice.updateDownVoteCount().then(function(notice) {
          return res.json({
            notice: notice.toJSONFor(user)
          });
        });
      });
    })
    .catch(next);
});

router.param("notice", function(req, res, next, slug) {
  Notice.findOne({
    slug: slug
  })
    .populate("author")
    .then(function(notice) {
      if (!notice) {
        return res.sendStatus(404);
      }

      req.notice = notice;

      return next();
    })
    .catch(next);
});

router.param("comment", function(req, res, next, id) {
  Comment.findById(id)
    .then(function(comment) {
      if (!comment) {
        return res.sendStatus(404);
      }

      req.comment = comment;

      return next();
    })
    .catch(next);
});

module.exports = router;
