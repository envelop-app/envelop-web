var express = require('express');
var router = express.Router();
const GaiaFile = require('../lib/gaia_file');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Envelop' });
});

router.get('/d/:username/:filename', function(req, res, next) {
  var username = req.params.username;
  if (!username.includes('.')) {
    username += '.id.blockstack';
  }

  new GaiaFile(req.app.get('appDomain'), username, req.params.filename)
    .fetch()
    .then(file => res.render('download', file))
    .catch(() => res.status(404).send('Not Found'));
});

module.exports = router;
