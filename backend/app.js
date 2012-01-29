var fs = require('fs'),
    util = require('util'),
    http = require('http'),
    exec = require('child_process').exec,
    config = require('./config');

var child;

// change to non root if run as root

process.setgid(config.nodeUserGid);
process.setuid(config.nodeUserUid);

// temp data for calulating current bandwith

var temp = {}

temp.collectedData = null;
temp.last_bw_down = null;
temp.last_bw_up = null;

// initialzing data cache

var cache = {}

cache.bw = {}
cache.poc = {}
cache.streaming = {}
cache.geiger = {}
cache.wireless = {}
cache.clients = {}
cache.openbeacon = {}
cache.protocols = {}

// connect to memcache

var memcache = require('memcache');
var memcacheConnection = new memcache.Client(config.memcache.port, config.memcache.host);
memcacheConnection.connect();

// initial run + timing

getBandwidthData();
setInterval(getBandwidthData, 10000);

getClientsData();
setInterval(getClientsData, 20000);

getWirelessBandsData();
setInterval(getWirelessBandsData, 10000);

getIPProtocolsData();
setInterval(getIPProtocolsData, 20000);

getOpenBeaconData();
setInterval(getOpenBeaconData, 20000);

getRadiationData();
setInterval(getRadiationData, 30000);

getPocData();
setInterval(getPocData, 30000);

getStreamingData();
setInterval(getStreamingData, 20000);

setInterval(writeData, 5000);


function writeData() {
    // wait for first successfull run of getBandwidthData();
    if (cache.collectedData != null) {
        if (config.debug) { console.log("running writeData() -> writing data to memcache");
        };

        dateTemp = new Date;
        var unixtimeMs = dateTemp.getTime();
        var unixtime = parseInt(unixtimeMs / 1000);
        unixtime += 3600; // timezone offset (maybe you've to comment this out)

        memcacheConnection.set('backendData', JSON.stringify(cache), function (error, result) {}, 600); // write data to memcache

        memcacheConnection.set('lastData', unixtime, function (error, result) {}, 600); // write last update time to memcache
    }
}

function getBandwidthData() {
    if (config.debug) { console.log("running getBandwidthData()");
    };

    if (!config.dummy) {

        child = exec("./scripts/juniper_bandwidth.sh down", function (error, tempbwdown, stderr) {
            temp.last_bw_down = cache.bw.down;
            cache.bw.down = parseInt(tempbwdown);
            // 32bit counter work arround - use 64bit counters(!)
            if (temp.last_bw_down > cache.bw.down) {
                cache.bw.down = parseInt(((4294967295 - temp.last_bw_down + cache.bw.down) / 10 / 1024 / 1024 * 8));
            } else {
                cache.bw.down = parseInt(((cache.bw.down - temp.last_bw_down) / 10 / 1024 / 1024 * 8));
            }
        });
        child = exec("./scripts/juniper_bandwidth.sh up", function (error, tempbwup, stderr) {
            temp.last_bw_up = cache.bw.up;
            cache.bw_up = parseInt(tempbwup);
            // 32bit counter work arround - use 64bit counters(!)      
            if (temp.last_bw_up > cache.bw.up) {
                cache.bw.up = parseInt(((4294967295 - temp.last_bw_up + cache.bw.up) / 10 / 1024 / 1024 * 8));
            } else {
                cache.bw.up = parseInt(((cache.bw.up - temp.last_bw_up) / 10 / 1024 / 1024 * 8));
            }
        });

	// change this so it represents your up/down limits 
        if (cache.bw.up < 20000 && cache.bw.up > 0 && cache.bw.down < 20000 && cache.bw.down > 0) {
            temp.collectedData = 1;
        };

    } else {
        cache.collectedData = 1;
        cache.bw.up = parseInt(Math.random() * 1000)
        cache.bw.down = parseInt(Math.random() * 1000)
    }

}

function getClientsData() {
    if (config.debug) { console.log("running getClientsData()");
    };

    if (!config.dummy) {

        try {

            child = exec("./scripts/cisco_wlc_clients.sh", function (error, tempclientswireless, stderr) {
                cache.clients.wireless = parseInt(tempclientswireless);
            });
        } catch (e) {}

        try {
            child = exec("./scripts/icinga_wired_clients.sh", function (error, tempclientswired, stderr) {
                cache.clients.wired = parseInt(tempclientswired);
            });
        } catch (e) {}


    } else {
        cache.clients.wireless = parseInt(Math.random() * 1000)
        cache.clients.wired = parseInt(Math.random() * 1000)
    }

}

function getWirelessBandsData() {
    if (config.debug) { console.log("running getWirelessBandsData()");
    };

    if (!config.dummy) {

    try {
        child = exec("./scripts/cisco_wlc_bands.sh", function (error, tempwirelessbands, stderr) {
            var tempwirelessbandssplit = tempwirelessbands.split(":");
            cache.wireless.bandsA = parseInt(tempwirelessbandssplit[0]);
            cache.wireless.bandsG = parseInt(tempwirelessbandssplit[1]);
            cache.wireless.bands24N = parseInt(tempwirelessbandssplit[2]);
            cache.wireless.bands5N = parseInt(tempwirelessbandssplit[3]);
        });

    } catch (e) {}

    } else {
	cache.wireless.bandsA = parseInt(Math.random() * 1000);
        cache.wireless.bandsG = parseInt(Math.random() * 1000);        
	cache.wireless.bands24N = parseInt(Math.random() * 1000);
        cache.wireless.bands5N = parseInt(Math.random() * 1000);
    }
}

function getIPProtocolsData() {
    if (config.debug) { console.log("running getIPProtocolsData()");
    };
    
    if (!config.dummy) {    

    try {
        child = exec("./scripts/sflow_protocols.sh", function (error, tempprotocols, stderr) {
            var tempprotocolssplit = tempprotocols.split(":");
            cache.protocols.ipv4 = parseInt(tempprotocolssplit[0]);
            cache.protocols.ipv6 = parseInt(tempprotocolssplit[1]);
        });

    } catch (e) {}

  } else {
          cache.protocols.ipv4 = parseInt(Math.random() * 1000);
          cache.protocols.ipv6 = parseInt(Math.random() * 1000);        
  }

}

function getOpenBeaconData() {
    if (config.debug) { console.log("running getOpenBeaconData()");
    };

    if (!config.dummy) {    
    
    try {

        child = exec("./scripts/openbeacon.sh", function (error, tempopenbeacon, stderr) {
            cache.openbeacon.connected = parseInt(tempopenbeacon);
        });

    } catch (e) {}

  } else {
            cache.openbeacon.connected = parseInt(Math.random() * 1000);
  }
  
}

function getRadiationData() {
    if (config.debug) { console.log("running getRadiationData()");
    };
    
    if (!config.dummy) {    

    try {

        child = exec("./scripts/radiation.sh", function (error, tempgeigerpoc, stderr) {
            cache.geiger.poc = parseInt(tempgeigerpoc);
        });

    } catch (e) {}

   } else {
            cache.geiger.poc = parseInt(Math.random() * 1000);
   }

}

function getPocData() {
    if (config.debug) { console.log("running getPocData()");
    };
    
    if (!config.dummy) {    
    
    try {
        child = exec("./scripts/poc.sh", function (error, temppocconnected, stderr) {
            cache.poc.connected = parseInt(temppocconnected);
        });

    } catch (e) {}

    } else {
            cache.poc.connected = parseInt(Math.random() * 1000);
    }

}

function getStreamingData() {
    if (config.debug) { console.log("running getStreamingData()");
    };

    if (!config.dummy) {    

    try {
        http.get({
            host: 'stats.28c3.fem-net.de',
            port: 80,
            path: '/streams.json'
        }, function (response) {
            var data = "";
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                var streaming = JSON.parse(data);
                cache.streaming.saal1 = streaming.saal1;
                cache.streaming.saal2 = streaming.saal2;
                cache.streaming.saal3 = streaming.saal3;
            });

        });

    } catch (e) {}

    process.on('uncaughtException', function (err) {
        console.log(err);
    });
    
     } else {
          cache.streaming.saal1 = parseInt(Math.random() * 1000);
          cache.streaming.saal2 = parseInt(Math.random() * 1000);
          cache.streaming.saal3 = parseInt(Math.random() * 1000);          
     }

}
