var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Notice = mongoose.model('Notice');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var auth = require('../auth');

router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  var limit = 9;
  var offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== 'undefined') {
    query.tagList = {
      "$in": [req.query.tag]
    };
  }

  Promise.all([
    req.query.author ? User.findOne({
      username: req.query.author
    }) : null,
    req.query.favorited ? User.findOne({
      username: req.query.favorited
    }) : null
  ]).then(function(results) {
    var author = results[0];
    var favoriter = results[1];

    if (author) {
      query.author = author._id;
    }

    if (favoriter) {
      query._id = {
        $in: favoriter.favorites
      };
    } else if (req.query.favorited) {
      query._id = {
        $in: []
      };
    }

    return Promise.all([
      Notice.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({
        createdAt: 'desc'
      })
      .populate('author')
      .exec(),
      Notice.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
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
  }).catch(next);
});

router.get('/feed', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }

    Promise.all([
      Article.find({
        author: {
          $in: user.following
        }
      })
      .limit(Number(limit))
      .skip(Number(offset))
      .populate('author')
      .exec(),
      Article.count({
        author: {
          $in: user.following
        }
      })
    ]).then(function(results) {
      var articles = results[0];
      var articlesCount = results[1];

      return res.json({
        articles: articles.map(function(article) {
          return article.toJSONFor(user);
        }),
        articlesCount: articlesCount
      });
    }).catch(next);
  });
});

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }

    var notice = new Notice(req.body.notice);

    notice.author = user;

    return notice.save().then(function() {
      return res.json({
        notice: notice.toJSONFor(user)
      });
    });
  }).catch(next);
});

router.get('/:notice', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.notice.populate('author').execPopulate()
  ]).then(function(results) {
    var user = results[0];

    return res.json({
      notice: req.notice.toJSONFor(user)
    });
  }).catch(next);
});

router.put('/:notice', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (req.notice.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.notice.title !== 'undefined') {
        req.notice.title = req.body.notice.title;
      }

      if (typeof req.body.notice.description !== 'undefined') {
        req.notice.description = req.body.notice.description;
      }

      if (typeof req.body.notice.body !== 'undefined') {
        req.notice.body = req.body.notice.body;
      }

      if (typeof req.body.notice.image !== 'undefined') {
        req.notice.image = req.body.notice.image;
      }

      if (typeof req.body.notice.tagList !== 'undefined') {
        req.notice.tagList = req.body.notice.tagList;
      }

      req.notice.save().then(function(notice) {
        return res.json({
          notice: notice.toJSONFor(user)
        });
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

router.delete('/:notice', auth.required, function(req, res, next) {
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

router.post('/:notice/comments', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
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
  }).catch(next);
});

router.get('/:notice/comments', auth.optional, function(req, res, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user) {
    return req.notice.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function(notice) {
      return res.json({
        comments: req.notice.comments.map(function(comment) {
          return comment.toJSONFor(user);
        })
      });
    });
  }).catch(next);
});

router.delete('/:notice/comments/:comment', auth.required, function(req, res, next) {
  console.log(req.comment.author)
  if (req.comment.author.toString() === req.payload.id.toString()) {
    req.notice.comments.remove(req.comment._id);
    req.notice.save()
      .then(Comment.find({
        _id: req.comment._id
      }).remove().exec())
      .then(function() {
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

router.put('/:notice/comments/:comment', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {

    if (req.comment.author._id.toString() === req.payload.id.toString()) {

      if (typeof req.body.comment.body !== 'undefined') {
        req.comment.body = req.body.comment.body;
      }

      req.comment.save()
      req.comment.populate('author').execPopulate()
        .then(function(commentNew) {
          return res.json({
            comments: req.comment.toJSONFor(user)
          });
        }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

router.post('/:notice/favorite', auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id).then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }

    return user.favorite(noticeId).then(function() {
      return req.notice.updateFavoriteCount().then(function(notice) {
        return res.json({
          notice: notice.toJSONFor(user)
        });
      });
    });
  }).catch(next);
});

router.post('/:notice/upvote', auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id).then(function(user) {
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
  }).catch(next);
});

router.post('/:notice/downvote', auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id).then(function(user) {
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
  }).catch(next);
});

router.delete('/:notice/favorite', auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id).then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }

    return user.unfavorite(noticeId).then(function() {
      return req.notice.updateFavoriteCount().then(function(notice) {
        return res.json({
          notice: notice.toJSONFor(user)
        });
      });
    });
  }).catch(next);
});

router.delete('/:notice/upvote', auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id).then(function(user) {
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
  }).catch(next);
});

router.delete('/:notice/downvote', auth.required, function(req, res, next) {
  var noticeId = req.notice._id;

  User.findById(req.payload.id).then(function(user) {
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
  }).catch(next);
});

router.param('notice', function(req, res, next, slug) {
  Notice.findOne({
      slug: slug
    })
    .populate('author')
    .then(function(notice) {
      if (!notice) {
        return res.sendStatus(404);
      }

      req.notice = notice;

      return next();
    }).catch(next);
});

router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment) {
    if (!comment) {
      return res.sendStatus(404);
    }

    req.comment = comment;

    return next();
  }).catch(next);
});

module.exports = router;