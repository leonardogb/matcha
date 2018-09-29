var mysql     = require('mysql');
var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'testroot'
});
con.connect();
console.log('Connected!');
module.exports = con;