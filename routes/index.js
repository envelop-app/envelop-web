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

  const gaiaFile = new GaiaFile(req.app.get('appDomain'), username, req.params.filename);

  gaiaFile
    .fetchInfo()
    .then((infoJson) => {
      const info = JSON.parse(infoJson);
      
      gaiaFile
        .fetchFullUrl(info['url'])
        .then((fullUrl) => {
          res.render('download', {
            name: info.url.split('/').pop(),
            url: fullUrl,
            size: info.size
          });
        });
    })
    .catch(() => res.status(404).send('Not Found'));
});

module.exports = router;
