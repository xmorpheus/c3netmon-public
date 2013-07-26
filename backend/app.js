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

// initialzing data & info cache
var data = {}
var info = {}
info.plugins = []

// connect to memcache
var memcache = require('memcache');
var memcacheConnection = new memcache.Client(config.memcache.port, config.memcache.host);
memcacheConnection.connect();

// initial run + timing
initBandwidthData();
getBandwidthData();
setInterval(getBandwidthData, 1000);

initClientsData();
getClientsData();
setInterval(getClientsData, 20000);

initWirelessBandsData();
getWirelessBandsData();
setInterval(getWirelessBandsData, 10000);

initIPProtocolsData();
getIPProtocolsData();
setInterval(getIPProtocolsData, 20000);

initPocData();
getPocData();
setInterval(getPocData, 30000);

initStreamingData();
getStreamingData();
setInterval(getStreamingData, 20000);

setInterval(writeData, 5000);

initOpenBeaconData();
getOpenBeaconData();
setInterval(getOpenBeaconData, 20000);

initRadiationData();
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

  	   memcacheConnection.set('backendInfo', JSON.stringify(info), function (error, result) {}, 600); // write data to memcache

        memcacheConnection.set('lastData', unixtime, function (error, result) {}, 600); // write last update time to memcache
    }
}

function initBandwidthData()
{
	info.plugins.push("bw");
	info.bw = {};
	info.bw.name = 'Bandwidth';
	info.bw.legend = [];
	info.bw.legend.push("Upstream");
	info.bw.legend.push("Downstream");
	info.bw.type = [];
	info.bw.type.push("mbit/s");
	info.bw.type.push("mbit/s");
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
    
    }

}

function initClientsData()
{
	info.plugins.push("clients");
	info.clients = {};
	info.clients.name = 'Clients';
	info.clients.legend = [];
	info.clients.legend.push("Wired");
	info.clients.legend.push("Wireless");
	info.clients.type = [];
	info.clients.type.push("");
	info.clients.type.push("");
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
    }

}

function initWirelessBandsData()
{
	info.plugins.push("wireless");
	info.wireless = {};
	info.wireless.name = 'Wireless Bands';
	info.wireless.legend = [];
	info.wireless.legend.push("A");
	info.wireless.legend.push("G");
	info.wireless.legend.push("N (2,4)");
	info.wireless.legend.push("N (5)");
	info.wireless.type = [];
	info.wireless.type.push("");
	info.wireless.type.push("");
        info.wireless.type.push("");
        info.wireless.type.push("");
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
        data.wireless.value.push(parseInt(now.getMinutes()));
        data.wireless.value.push(parseInt(now.getMinutes()));     
    }
}

function initIPProtocolsData()
{
	info.plugins.push("protocols");
	info.protocols = {};
	info.protocols.name = 'IP Protocol Distribution';
	info.protocols.legend = [];
	info.protocols.legend.push("IPv4");
	info.protocols.legend.push("IPv6");
	info.protocols.type = [];
	info.protocols.type.push("%");
	info.protocols.type.push("%");
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
	       
  }

}

function initOpenBeaconData()
{
	info.plugins.push("openbeacon");
	info.openbeacon = {};
	info.openbeacon.name = 'OpenBeacon';
	info.openbeacon.legend = [];
	info.openbeacon.legend.push("r0kets");
	info.openbeacon.type = [];
	info.openbeacon.type.push("");
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

  }
  
}

function initRadiationData()
{
	info.plugins.push("radiation");
	info.radiation = {};
	info.radiation.name = 'Radiation';
	info.radiation.legend = [];
	info.radiation.legend.push("Radiation");
	info.radiation.type = [];
	info.radiation.type.push("");
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

   }

}

function initPocData()
{
	info.plugins.push("poc");
	info.poc = {};
	info.poc.name = 'POC / NOC';
	info.poc.legend = [];
	info.poc.legend.push("POC");
	info.poc.legend.push("MOC");
	info.poc.type = [];
	info.poc.type.push("POC");
	info.poc.type.push("MOC");
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
    }

}

function initStreamingData()
{
	info.plugins.push("streaming");
	info.streaming = {};
	info.streaming.name = 'Streaming';
	info.streaming.legend = [];
	info.streaming.legend.push("Saal 1");
	info.streaming.legend.push("Saal 4");
	info.streaming.legend.push("Saal 6");
	info.streaming.type = [];
	info.streaming.type.push("");
	info.streaming.type.push("");
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
                 data.streaming.value.push(parseInt(now.getMinutes()));
		     
     }

}
