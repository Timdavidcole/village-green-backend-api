var router = require('express').Router();
var mongoose = require('mongoose');
var Notice = mongoose.model('Notice');

router.get('/', function(req, res, next) {
  Notice.find().distinct('tagList').then(function(tags) {
    return res.json({
      tags: tags
    });
  }).catch(next);
});

module.exports = router;