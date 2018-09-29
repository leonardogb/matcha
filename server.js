require('./config/setup');

//var app = require('./app'); poner
var debug = require('debug')('matcha:server');
//var http = require('http'); poner

//var server = http.createServer(app); poner


var app = require('./app');
var server = require('http').Server(app);
var io = require('./io.js')(server);

server.listen(8080);
server.on('error', onError);
server.on('listening', onListening);

//app.use((req, res, next)=>{ res.locals['io'] = io; next(); });

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
  

/**
 * Socket.io
 */

// var socketApi = require('./socketApi');
// var io = socketApi.io;
// io.attach(server);


  /**
   * Event listener for HTTP server "listening" event.
   */
  
  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }

// app.get('/', function(req, res)
// {
//     res.render('pages/index.ejs');
// });

// app.get('/signup', function(req, res)
// {
//     res.render('pages/signup.ejs');
// });

// app.use(function(req, res, next){
//     res.setHeader('Content-Type', 'text/html');
//     res.status(404);
//     res.render('pages/404.ejs');
//     res.end();
// });

// io.on('connection', function(socket)
// {
//     console.log("una conexión");
// });

// server.listen(8080);