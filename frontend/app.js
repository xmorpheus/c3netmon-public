var express = require('express'),
    fs = require('fs'),
    util = require('util'),
    config = require('./config');

var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
});

var connect = server.listen(config.listenPort, '::');

console.log('created listener on port' + config.listenPort);

// change to non root after binding port <1024
process.setgid(config.nodeUserGid);
process.setuid(config.nodeUserUid);

// bind views
app.get('/', function (req, res) { res.sendfile(__dirname + '/views/index.html'); });
app.get('/detail', function (req, res) { res.sendfile(__dirname + '/views/detail.html'); });

// creating socket io socket for connecting clients
io.configure('production', function () {
    io.enable('browser client minification'); // send minified client
    io.enable('browser client etag'); // apply etag caching logic based on version number
    io.enable('browser client gzip'); // gzip the file
    io.set('log level', 0);
    io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
});

// connect to memcache
var memcache = require('memcache');
var memcacheConnection = new memcache.Client(config.memcache.port, config.memcache.host);
memcacheConnection.connect();

var x = io.sockets.on('connection', function (socket) { /* nothing todo (yet) */ });

// save last graph generation and save time
var nextGraph = null;
var nextSave = null;
var lastData = null;

// check if history already exists (maybe node crashed)
try {
    console.log("opening history");
    var historyFile = fs.readFileSync("public/history.json", 'utf8');
    var historyData = JSON.parse(historyFile);
} catch (err) {
    var historyData = new Array();
    console.log("creating history");
}

setInterval(function () {
    memcacheConnection.get('lastData', function (error, result) {

        if (lastData < result) {
            lastData = result;

            var dateTemp = new Date;
            var unixtimeMs = dateTemp.getTime();
            var unixtime = parseInt(unixtimeMs / 1000);
            unixtime += 3600;
            var graph = null;

            memcacheConnection.get('backendData', function (error, result) {

                var data = JSON.parse(result);

                // do we need to graph?
                if (nextGraph < unixtime) {
                    graph = 1;
                    nextGraph = unixtime + 10;
                }

                // generate full data block	   
                data.graph = graph;
                data.unixtime = unixtime;

                // send data block on all sockets (to clients)
                x.emit('data', data);
                fs.writeFileSync("public/current.json", JSON.stringify(data), 'utf8');

                // do we need to save history block?
                if (nextSave < unixtime) {
                    historyData.push(data);
                    fs.writeFileSync("public/history.json", JSON.stringify(historyData), 'utf8');
                    nextSave = unixtime + 30;
                };



            });

        }
    })
}, 1000);
