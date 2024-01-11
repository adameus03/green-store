var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index.html', { title: 'Express' });
  res.send("Index");
});

router.get('/products', function(req, res, next) {
  //res.render('index.html', { title: 'Express' });
  res.setHeader('Content-Type', 'application/json');
  res.send(`[{"prod_id": 1}]`);
});

/*router.get('/transfer-gui', function(req,res, next) {
  res.render('transfer-gui.html', { title: 'Express'});
});*/

module.exports = router;
