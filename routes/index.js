var express = require('express');
var router = express.Router();
const GaiaFile = require('../lib/gaia_file');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Envelop' });
});

router.get('/d/:username/:filename', function(req, res, next) {
  new GaiaFile(req.app.get('appDomain'), req.params.username, req.params.filename)
    .fetch()
    .then((file) => res.render('download', { file: JSON.parse(file) }))
    .catch(() => res.status(404).send('Not Found'));
});

module.exports = router;
