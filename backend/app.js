var fs = require('fs'),
    util = require('util'),
    http = require('http'),
    https = require('https'),
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

var cache = {}
cache.bw = {}
cache.bw.down = null;
cache.bw.up = null;
cache.bwreal = {}
cache.bwreal.down = null;
cache.bwreal.up = null;

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
setInterval(getBandwidthData, 30000);

/*
initClientsData();
getClientsData();
setInterval(getClientsData, 50000);

initWirelessBandsData();
getWirelessBandsData();
setInterval(getWirelessBandsData, 60000);

initPocData();
getPocData();
setInterval(getPocData, 120000);

initGSMData();
getGSMData();
setInterval(getGSMData, 30000);

initOHMStreamingData();
getOHMStreamingData();
setInterval(getOHMStreamingData, 60000);

initnat64Data();
getnat64Data();
setInterval(getnat64Data, 60000);

initprotocolsData();
getprotocolsData();
setInterval(getprotocolsData, 20000);

initengelData();
getengelData();
setInterval(getengelData, 60000);

initdashboardData();
getdashboardData();
setInterval(getdashboardData, 20000);
*/

setInterval(writeData, 10000);

/*initOpenBeaconData();*/
/*getOpenBeaconData();*/
/*setInterval(getOpenBeaconData, 20000);*/

/*initRadiationData();*/
/*getRadiationData();*/
/*setInterval(getRadiationData, 30000);*/

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
	info.bw.name = 'Uplink Bandwidth';
	info.bw.legend = [];
	info.bw.legend.push("Downstream");
	info.bw.legend.push("Upstream");
	info.bw.type = [];
	info.bw.type.push("mbit/s");
	info.bw.type.push("mbit/s");
}

function getBandwidthData() {
    if (config.debug) { console.log("running getBandwidthData()");
    };

    if (!config.dummy) {

           data.bw = {};
           data.bw.value = [];

           child = exec("./scripts/juniper_bandwidth.sh down", function (error, tempbwdown, stderr) {
		  temp.last_bw_down = cache.bw.down;
		  cache.bw.down = parseInt(tempbwdown);

	          // 32bit counter work arround - use 64bit counters(!)
		  if (temp.last_bw_down > cache.bw.down) {
		  cache.bwreal.down = parseInt(((4294967295 - temp.last_bw_down + cache.bw.down) / 30 / 1024 / 1024 * 8));
		  } else {
		  cache.bwreal.down = parseInt(((cache.bw.down - temp.last_bw_down) / 30 / 1024 / 1024 * 8));
		  }



        });
        child = exec("./scripts/juniper_bandwidth.sh up", function (error, tempbwup, stderr) {
	   	  temp.last_bw_up = cache.bw.up;
		  cache.bw.up = parseInt(tempbwup);

            	  // 32bit counter work arround - use 64bit counters(!)
		  if (temp.last_bw_up > cache.bw.up) {
		  cache.bwreal.up = parseInt(((4294967295 - temp.last_bw_up + cache.bw.up) / 30 / 1024 / 1024 * 8));
		  } else {
		  cache.bwreal.up = parseInt(((cache.bw.up - temp.last_bw_up) / 30 / 1024 / 1024 * 8));
		  }
        });

	console.log(cache.bwreal.up)
	console.log(cache.bwreal.down)

	// change this so it represents your up/down limits
	if (cache.bwreal.up < 30000 && cache.bwreal.up > 0 && cache.bwreal.down < 30000 && cache.bwreal.down > 0) {
           data.collectedData = 1;
        
           data.bw.value.push(parseInt(cache.bwreal.down));
           data.bw.value.push(parseInt(cache.bwreal.up));
	}

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
	info.clients.legend.push("Wireless");
	info.clients.type = [];
	info.clients.type.push("");
        info.clients.type.push("");
}

function getClientsData() {
    if (config.debug) { console.log("running getClientsData()");
    };

    if (!config.dummy) {

            data.collectedData = 1;

            data.clients = {};
            data.clients.value = [];

	try
	{

            child = exec("./scripts/cisco_wlc_clients.sh", function (error, tempclientswireless, stderr) {

 	    data.clients.value.push(parseInt(tempclientswireless));

	    });

        } catch (e) {}

    } else {



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

            data.wireless = {};

		  data.wireless.value = [];

            var tempwirelessbandssplit = tempwirelessbands.split(":");
            data.wireless.value.push(parseInt(tempwirelessbandssplit[0]));
            data.wireless.value.push(parseInt(tempwirelessbandssplit[1]));
            data.wireless.value.push(parseInt(tempwirelessbandssplit[2]));
            data.wireless.value.push(parseInt(tempwirelessbandssplit[3]));
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
	info.plugins.push("pocx");
	info.pocx = {};
	info.pocx.name = 'POC';
	info.pocx.legend = [];
	info.pocx.legend.push("POC (DECT) Registered");
	info.pocx.type = [];
	info.pocx.type.push("");
        info.pocx.type.push("");
}

function getPocData() {
    if (config.debug) { console.log("running getPocData()");
    };

    if (!config.dummy) {

    data.pocx = {};
    data.pocx.value = [];

    try {
        child = exec("./scripts/poc.sh", function (error, temppocconnected, stderr) {

	     data.pocx.value.push(parseInt(temppocconnected));
        });
    } catch (e) {}

    } else {
	    data.poc = {};

	     var now = new Date();

		data.pocx.value = [];
		data.pocx.value.push(parseInt(now.getMinutes()));
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
        info.streaming.type.push("");
}

function setStreamingData(streaming)
{
    data.streaming = {};
    data.streaming.value = [];

    data.streaming.value.push(parseInt(streaming.saal1));
    data.streaming.value.push(parseInt(streaming.saal4));
    data.streaming.value.push(parseInt(streaming.saal6));

}
function getStreamingData() {
    if (config.debug) { console.log("running getStreamingData()");
    };

    if (!config.dummy) {

    try {
        http.get({
            host: 'api.29c3.fem-net.de',
            port: 80,
            path: '/stats/current.json'
        }, function (response) {
            var data = "";
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                var streaming = JSON.parse(data);

		setStreamingData(streaming);
            });

        });

    } catch (e) {}

    process.on('uncaughtException', function (err) {
        console.log("streaming" + err);
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

function initGSMData()
{
        info.plugins.push("gsm");
        info.gsm = {};
        info.gsm.name = 'GSM';
        info.gsm.legend = [];
        info.gsm.legend.push("SMS Sent (MO)");
        info.gsm.legend.push("SMS Delivered (MT)");
        info.gsm.legend.push("Calls Issued (MO)");
        info.gsm.legend.push("Calls Delivered (MT)");
        info.gsm.type = [];
        info.gsm.type.push("");
        info.gsm.type.push("");
        info.gsm.type.push("");
        info.gsm.type.push("");
}

function setGSMData(gsm)
{

    data.gsm = {};
    data.gsm.value = [];

    data.gsm.value.push(parseInt(gsm.sms_submitted));
    data.gsm.value.push(parseInt(gsm.sms_delivered));
    data.gsm.value.push(parseInt(gsm.calls_mo));
    data.gsm.value.push(parseInt(gsm.calls_mt));

}

function getGSMData() {
    if (config.debug) { console.log("running getGSMData()");
    };

    if (!config.dummy) {

    try {
        http.get({
            host: '94.45.247.251',
            port: 4223,
            path: '/'
        }, function (response) {
            var data = "";
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                var gsm = JSON.parse(data);

		setGSMData(gsm);

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

function initnat64Data()
{
	info.plugins.push("nat64");
	info.nat64 = {};
	info.nat64.name = 'nat64 Users';
	info.nat64.legend = [];
	info.nat64.legend.push("nat64 Users");
	info.nat64.type = [];
        info.nat64.type.push("");
}

function getnat64Data() {
    if (config.debug) { console.log("running getnat64Data()");
    };

    if (!config.dummy) {

    data.nat64 = {};
    data.nat64.value = [];

    try {
        child = exec("./scripts/nat64.sh", function (error, tempnat64connected, stderr) {

	     data.nat64.value.push(parseInt(tempnat64connected));
        });
    } catch (e) {}

    } else {
	        data.nat64 = {};

	        var now = new Date();

		data.nat64.value = [];
		data.nat64.value.push(parseInt(now.getMinutes()));
                data.nat64.value.push(parseInt(now.getMinutes()));
    }
}

function initprotocolsData()
{
        info.plugins.push("protocols");
        info.protocols = {};
        info.protocols.name = 'protocols';
        info.protocols.legend = [];
        info.protocols.legend.push("IPv4");
        info.protocols.legend.push("IPv6");
        info.protocols.type = [];
        info.protocols.type.push("%");
        info.protocols.type.push("%");
}

function setprotocolsData(protocols)
{

    data.protocols = {};
    data.protocols.value = [];

    data.protocols.value.push(parseInt(protocols.ipv4));
    data.protocols.value.push(parseInt(protocols.ipv6));


}

function getprotocolsData() {
    if (config.debug) { console.log("running getprotocolsData()");
    };

    if (!config.dummy) {

    try {
        http.get({
            host: '94.45.226.61',
            port: 82,
            path: '/ipv6.txt'
        }, function (response) {
            var data = "";
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                var protocols = JSON.parse(data);

		setprotocolsData(protocols);

            });

        });

    } catch (e) {}

    process.on('uncaughtException', function (err) {
        console.log(err);
    });

     } else {

     }

}

function initengelData()
{
        info.plugins.push("engel");
        info.engel = {};
        info.engel.name = 'Engelsystem';
        info.engel.legend = [];
        info.engel.legend.push("Work Hours Done");
        info.engel.legend.push("Users Arrived");
        info.engel.type = [];
        info.engel.type.push("");
        info.engel.type.push("");

}

function setengelData(engel)
{

    data.engel = {};
    data.engel.value = [];

    data.engel.value.push(parseInt(engel.done_work_hours));
    data.engel.value.push(parseInt(engel.arrived_user_count));

}

function getengelData() {
    if (config.debug) { console.log("running getengelData()");
    };

    if (!config.dummy) {

    try {
        https.get({
            host: 'engelsystem.de',
            port: 443,
            path: '/29c3/?p=stats&api_key=VWJyAvXN4eyuoCplfc8N5Uq7k9BMTkvV'
        }, function (response) {
            var data = "";
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                var engel = JSON.parse(data);

		console.log(engel);

		setengelData(engel);

            });

        });

    } catch (e) {}

    process.on('uncaughtException', function (err) {
        console.log(err);
    });

     } else {

     }

}

function initdashboardData()
{
	info.plugins.push("dashboard");
	info.dashboard = {};
	info.dashboard.name = 'Dashboard Users';
	info.dashboard.legend = [];
	info.dashboard.legend.push("Current Users On Dashboard");
	info.dashboard.type = [];
        info.dashboard.type.push("");
}

function getdashboardData() {
    if (config.debug) { console.log("running getdashboardData()");
    };

    if (!config.dummy) {

    data.dashboard = {};
    data.dashboard.value = [];

    try {
        child = exec("./scripts/dashboard.sh", function (error, tempdashboardconnected, stderr) {

	     data.dashboard.value.push(parseInt(tempdashboardconnected));
        });
    } catch (e) {}

    } else {
	        data.dashboard = {};

	        var now = new Date();

		data.dashboard.value = [];
		data.dashboard.value.push(parseInt(now.getMinutes()));
                data.dashboard.value.push(parseInt(now.getMinutes()));
    }
}

function initOHMStreamingData()
{
        info.plugins.push("OHMstreaming");
        info.OHMstreaming = {};
        info.OHMstreaming.name = 'Streaming';
        info.OHMstreaming.legend = [];
        info.OHMstreaming.legend.push("Nifhack");
        info.OHMstreaming.type = [];
        info.OHMstreaming.type.push("viewers");
}

function getOHMStreamingData() {
    if (config.debug) { console.log("running getOHMStreamingData()");
    };

    if (!config.dummy) {

    data.OHMstreaming = {};
    data.OHMstreaming.value = [];

    try {
        child = exec("./scripts/streaming.sh", function (error, tempstreaming, stderr) {

	     data.OHMstreaming.value.push(parseInt(tempstreaming));
        });
    } catch (e) {}

    } else {
	   
	//

    }

}

