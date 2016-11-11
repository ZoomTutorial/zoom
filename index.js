var express = require('express')
var app = express()
//var string = ""

//GET resource
app.get('/', function (req,res) {
	res.send('root')
})

//serve static files
app.use(express.static('public'))

//listen to port
app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})

