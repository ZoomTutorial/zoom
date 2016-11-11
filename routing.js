var express = require('express')
var app = express()
var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname , ext : '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

var string = '/'

app.get(string, function (req, res) {
  	res.send('hello')
})



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})