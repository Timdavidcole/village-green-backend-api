var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Notice = mongoose.model('Notice');
var User = mongoose.model('User');
var auth = require('../auth');

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
      console.log(req.body)
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
  User.findById(req.payload.id).then(function(){
    if(req.notice.author._id.toString() === req.payload.id.toString()){
      return req.notice.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  });
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

module.exports = router;