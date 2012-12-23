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

var data = {};

var cache = {};
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
setInterval(getBandwidthData, 1000);

getClientsData();
setInterval(getClientsData, 20000);

getWirelessBandsData();
setInterval(getWirelessBandsData, 10000);

getIPProtocolsData();
setInterval(getIPProtocolsData, 20000);

getPocData();
setInterval(getPocData, 30000);

getStreamingData();
setInterval(getStreamingData, 20000);

setInterval(writeData, 5000);

getOpenBeaconData();
setInterval(getOpenBeaconData, 20000);

getRadiationData();
setInterval(getRadiationData, 30000);

function writeData() {
    // wait for first successfull run of getBandwidthData();
    if (data.collectedData != null) {
        if (config.debug) { console.log("running writeData() -> writing data to memcache");
        };

        dateTemp = new Date;
        var unixtimeMs = dateTemp.getTime();
        var unixtime = parseInt(unixtimeMs / 1000);
        unixtime += 3600; // timezone offset (maybe you've to comment this out)

        memcacheConnection.set('backendData', JSON.stringify(data), function (error, result) {}, 600); // write data to memcache

        memcacheConnection.set('lastData', unixtime, function (error, result) {}, 600); // write last update time to memcache
    }
}

function getBandwidthData() {
    if (config.debug) { console.log("running getBandwidthData()");
    };

    if (!config.dummy) {

        child = exec("./scripts/juniper_bandwidth.sh down", function (error, tempbwdown, stderr) {
			   /*temp.last_bw_down = cache.bw.down;*/
		  /*cache.bw.0.value = parseInt(tempbwdown);*/
            // 32bit counter work arround - use 64bit counters(!)
		  /*if (temp.last_bw_down > cache.bw.0) {*/
		  /*cache.bw.0.value = parseInt(((4294967295 - temp.last_bw_down + cache.bw.0.value) / 10 / 1024 / 1024 * 8));*/
		  /*} else {*/
		  /*cache.bw.0.value = parseInt(((cache.bw.down - temp.last_bw_down) / 10 / 1024 / 1024 * 8));*/
		  /*}*/
        });
        child = exec("./scripts/juniper_bandwidth.sh up", function (error, tempbwup, stderr) {
			   /*temp.last_bw_up = cache.bw.1;*/
		  /*cache.bw_1.value = parseInt(tempbwup);*/
            // 32bit counter work arround - use 64bit counters(!)      
		  /*if (temp.last_bw_up > cache.bw.1) {*/
		  /**//*cache.bw.1.value = parseInt(((4294967295 - temp.last_bw_up + cache.bw.1.value) / 10 / 1024 / 1024 * 8));*/
		  /*} else {*/
		  /*cache.bw.1.value = parseInt(((cache.bw.up - temp.last_bw_up) / 10 / 1024 / 1024 * 8));*/
		  /*}*/
        });

	// change this so it represents your up/down limits 
	   /*if (cache.bw.1.value < 20000 && cache.bw.1.value > 0 && cache.bw.0.value < 20000 && cache.bw.0.value > 0) {*/
	   /*temp.collectedData = 1;*/
		  /*};*/

    } else {
        data.collectedData = 1;
	   
	   data.bw = {};
	   
 	   var now = new Date();

	   data.bw.value = [];
	   data.bw.value.push(parseInt(now.getMinutes()));
	   data.bw.value.push(parseInt(now.getMinutes()));
    
	   data.bw.name = 'Bandwidth';
	   data.bw.legend = [];
	   data.bw.legend.push("Upstream");
	   data.bw.legend.push("Downstream");
	   data.bw.type = [];
	   data.bw.type.push("mbit/s");
	   data.bw.type.push("mbit/s");
    
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
    
 data.clients = {};

 var now = new Date();

 data.clients.value = [];
 data.clients.value.push(parseInt(now.getMinutes()));
 data.clients.value.push(parseInt(now.getMinutes()));
     
 data.clients.name = 'Clients';
 data.clients.legend = [];
 data.clients.legend.push("Wireless");
 data.clients.legend.push("Wired");
 data.clients.type = [];
 data.clients.type.push("");
 data.clients.type.push("");
    
    
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
data.wireless = {};

 var now = new Date();

 data.wireless.value = [];
 data.wireless.value.push(parseInt(now.getMinutes()));
 data.wireless.value.push(parseInt(now.getMinutes()));
     
 data.wireless.name = 'Wireless';
 data.wireless.legend = [];
 data.wireless.legend.push("Wireless");
 data.wireless.legend.push("Wired");
 data.wireless.type = [];
 data.wireless.type.push("");
 data.wireless.type.push("");
    
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

	  data.protocols = {};

	   var now = new Date();

	   data.protocols.value = [];
	   data.protocols.value.push(parseInt(now.getMinutes()));
	   data.protocols.value.push(parseInt(now.getMinutes()));
	       
	   data.protocols.name = 'Protocols';
	   data.protocols.legend = [];
	   data.protocols.legend.push("Wireless");
	   data.protocols.legend.push("Wired");
	   data.protocols.type = [];
	   data.protocols.type.push("");
	   data.protocols.type.push("");
  
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

data.openbeacon = {};

 var now = new Date();

 data.openbeacon.value = [];
 data.openbeacon.value.push(parseInt(now.getMinutes()));
 data.openbeacon.value.push(parseInt(now.getMinutes()));
     
 data.openbeacon.name = 'OpenBeacon';
 data.openbeacon.legend = [];
 data.openbeacon.legend.push("Wireless");
 data.openbeacon.legend.push("Wired");
 data.openbeacon.type = [];
 data.openbeacon.type.push("");
 data.openbeacon.type.push("");

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
	   data.radiation = {};

	    var now = new Date();

	    data.radiation.value = [];
	    data.radiation.value.push(parseInt(now.getMinutes()));
	    data.radiation.value.push(parseInt(now.getMinutes()));
	        
	    data.radiation.name = 'Radiation';
	    data.radiation.legend = [];
	    data.radiation.legend.push("Wireless");
	    data.radiation.legend.push("Wired");
	    data.radiation.type = [];
	    data.radiation.type.push("");
	    data.radiation.type.push("");
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
	    data.poc = {};

	     var now = new Date();

		data.poc.value = [];
		data.poc.value.push(parseInt(now.getMinutes()));
		data.poc.value.push(parseInt(now.getMinutes()));
		    
		data.poc.name = 'POC';
		data.poc.legend = [];
		data.poc.legend.push("Wireless");
		data.poc.legend.push("Wired");
		data.poc.type = [];
		data.poc.type.push("");
		data.poc.type.push("");
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
		data.streaming = {};

		 var now = new Date();

		 data.streaming.value = [];
		 data.streaming.value.push(parseInt(now.getMinutes()));
		 data.streaming.value.push(parseInt(now.getMinutes()));
		     
		 data.streaming.name = 'Streaming';
		 data.streaming.legend = [];
		 data.streaming.legend.push("Wireless");
		 data.streaming.legend.push("Wired");
		 data.streaming.type = [];
		 data.streaming.type.push("");
		 data.streaming.type.push("");
     }

}
