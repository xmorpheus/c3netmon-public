// setup socket for socket.io
var socket = io.connect();

// generating graph arrays with dummy data
var bwSeriesData = [
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }]
];
var clientsSeriesData = [
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }]
];
var pocSeriesData = [
    [{
        x: 0,
        y: 0
    }]
];
var geigerSeriesData = [
    [{
        x: 0,
        y: 0
    }]
];
var streamingSeriesData = [
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }]
];
var wirelessBandsSeriesData = [
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }]
];
var openBeaconSeriesData = [
    [{
        x: 0,
        y: 0
    }]
];
var protocolsSeriesData = [
    [{
        x: 0,
        y: 0
    }],
    [{
        x: 0,
        y: 0
    }]
];

// max bandwith for percent graphing
var max_bandwith = 20000;

// temp variable to check if history is loaded
var history = null;

// cache for peaks
var cache = [];
cache.bw_up = null;
cache.bw_down = null;
cache.bw_up_peak = null;
cache.bw_down_peak = null;
cache.clients_wired_peak = null;
cache.clients_wireless_peak = null;
cache.poc_peak = null;
cache.geiger_peak = null;
cache.streaming_saal1_peak = null;
cache.streaming_saal2_peak = null;
cache.streaming_saal3_peak = null;
cache.firstgraph = null;
cache.bw_up_total = null;
cache.bw_down_total = null;
cache.openbeacon_peak = null;

$.ajaxSetup({
    "async": false
});

$.getJSON('/history.json', function (data) {
    // got json, removing dummy data
    bwSeriesData[0].pop();
    bwSeriesData[1].pop();
    clientsSeriesData[0].pop();
    clientsSeriesData[1].pop();
    pocSeriesData[0].pop();
    geigerSeriesData[0].pop();
    streamingSeriesData[0].pop();
    streamingSeriesData[1].pop();
    streamingSeriesData[2].pop();
    wirelessBandsSeriesData[0].pop();
    wirelessBandsSeriesData[1].pop();
    wirelessBandsSeriesData[2].pop();
    wirelessBandsSeriesData[3].pop();
    openBeaconSeriesData[0].pop();
    protocolsSeriesData[0].pop();
    protocolsSeriesData[1].pop();

    console.log("popped 0 data");
    var historyCount = 0;

    // update graph arrays with historical data
    $.each(data, function (key, data) {

        bwSeriesData[0].push({
            x: data.unixtime,
            y: data.bw.up
        });
        bwSeriesData[1].push({
            x: data.unixtime,
            y: data.bw.down
        });
        if (data.clients.wired == null) {
            clientsSeriesData[0].push({
                x: data.unixtime,
                y: 943
            });
        } else {
            if (data.clients.wired == 943) {
                var factor = 0;
                historyCount++;
                if (historyCount < 20) {
                    factor = 1;
                };
                if (historyCount < 40) {
                    factor = 2, 3;
                };
                if (historyCount < 80) {
                    factor = 3;
                };
                clientsSeriesData[0].push({
                    x: data.unixtime,
                    y: data.clients.wired + (historyCount * factor)
                });
            } else {
                clientsSeriesData[0].push({
                    x: data.unixtime,
                    y: data.clients.wired
                });
            }
        }
        clientsSeriesData[1].push({
            x: data.unixtime,
            y: data.clients.wireless
        });
        pocSeriesData[0].push({
            x: data.unixtime,
            y: data.poc.connected
        });
        if (data.geiger != null) {
            geigerSeriesData[0].push({
                x: data.unixtime,
                y: data.geiger.poc
            });
        } else {
            geigerSeriesData[0].push({
                x: data.unixtime,
                y: 0
            });
        }
        if (data.geiger != null) {
            geigerSeriesData[0].push({
                x: data.unixtime,
                y: data.geiger.poc
            });
        } else {
            geigerSeriesData[0].push({
                x: data.unixtime,
                y: 0
            });
        }
        if (data.wireless != null) {
            wirelessBandsSeriesData[0].push({
                x: data.unixtime,
                y: data.wireless.bandsA
            });
            wirelessBandsSeriesData[1].push({
                x: data.unixtime,
                y: data.wireless.bandsG
            });
            wirelessBandsSeriesData[2].push({
                x: data.unixtime,
                y: data.wireless.bands24N
            });
            wirelessBandsSeriesData[3].push({
                x: data.unixtime,
                y: data.wireless.bands5N
            });
        } else {
            wirelessBandsSeriesData[0].push({
                x: data.unixtime,
                y: 0
            });
            wirelessBandsSeriesData[1].push({
                x: data.unixtime,
                y: 0
            });
            wirelessBandsSeriesData[2].push({
                x: data.unixtime,
                y: 0
            });
            wirelessBandsSeriesData[3].push({
                x: data.unixtime,
                y: 0
            });
        }
        if (data.openbeacon != null) {
            openBeaconSeriesData[0].push({
                x: data.unixtime,
                y: data.openbeacon.connected
            });
        } else {
            openBeaconSeriesData[0].push({
                x: data.unixtime,
                y: 0
            });
        }
        if (data.protocols != null) {
            protocolsSeriesData[0].push({
                x: data.unixtime,
                y: parseInt(data.protocols.ipv4 / (data.protocols.ipv4 + data.protocols.ipv6) * 100)
            });
            protocolsSeriesData[1].push({
                x: data.unixtime,
                y: parseInt(data.protocols.ipv6 / (data.protocols.ipv4 + data.protocols.ipv6) * 100)
            });
        } else {
            protocolsSeriesData[0].push({
                x: data.unixtime,
                y: 0
            });
            protocolsSeriesData[1].push({
                x: data.unixtime,
                y: 0
            });
        }

        streamingSeriesData[0].push({
            x: data.unixtime,
            y: data.streaming.saal1
        });
        streamingSeriesData[1].push({
            x: data.unixtime,
            y: data.streaming.saal2
        });
        streamingSeriesData[2].push({
            x: data.unixtime,
            y: data.streaming.saal3
        });

        if (data.bw.up > cache.bw_up_peak) {
            cache.bw_up_peak = data.bw.up;
            $('#bw_up_peak').html(data.bw.up);
        };
        if (data.bw.down > cache.bw_down_peak) {
            cache.bw_down_peak = data.bw.down;
            $('#bw_down_peak').html(data.bw.down);
        };
        if (data.clients.wired > cache.clients_wired_peak) {
            cache.clients_wired_peak = data.clients.wired;
            $('#clients_wired_peak').html(data.clients.wired);
        };
        if (data.clients.wireless > cache.clients_wireless_peak) {
            cache.clients_wireless_peak = data.clients.wireless;
            $('#clients_wireless_peak').html(data.clients.wireless);
        };
        if (data.poc.connected > cache.poc_connected) {
            cache.poc_peak = data.poc.connected;
            $('#poc_peak').html(data.poc.connected);
        };

        if (data.geiger != null) {
            if (data.geiger.poc > cache.geiger_peak) {
                cache.geiger_peak = data.geiger.poc;
                $('#geiger_peak').html(data.geiger.poc);
            };
        }
        if (data.openbeacon != null) {
            if (data.openbeacon.connected > cache.openbeacon_peak) {
                cache.openbeacon_peak = data.openbeacon.connected;
                $('#openbeacon_peak').html(data.openbeacon.connected);
            };
        }
        if (data.streaming.saal1 > cache.streaming_saal1_peak) {
            cache.streaming_saal1_peak = data.streaming.saal1;
            $('#streaming_saal1_peak').html(data.streaming.saal1);
        };
        if (data.streaming.saal2 > cache.streaming_saal2_peak) {
            cache.streaming_saal2_peak = data.streaming.saal2;
            $('#streaming_saal2_peak').html(data.streaming.saal2);
        };
        if (data.streaming.saal3 > cache.streaming_saal3_peak) {
            cache.streaming_saal3_peak = data.streaming.saal3;
            $('#streaming_saal3_peak').html(data.streaming.saal3);
        };


        cache.bw_up_total += (data.bw.up * 300 / 8 / 1024);
        cache.bw_down_total += (data.bw.down * 300 / 8 / 1024);

        cache.bw_up = data.bw.up;
        cache.bw_down = data.bw.down;

        $('#bw_up_cur').html(data.bw.up);
        $('#bw_down_cur').html(data.bw.down);
        $('#clients_wired_cur').html(data.clients.wired);
        $('#clients_wireless_cur').html(data.clients.wireless);
        $('#poc_cur').html(data.poc.connected);
        if (data.geiger != null) {
            $('#geiger_cur').html(data.geiger.poc);
        }
        if (data.openbeacon != null) {
            $('#openbeacon_cur').html(data.openbeacon.connected);
        }
        if (data.protocols != null) {
            $('#protocols_ipv4_cur').html(parseInt(data.protocols.ipv4 / (data.protocols.ipv4 + data.protocols.ipv6) * 100));
            $('#protocols_ipv6_cur').html(parseInt(data.protocols.ipv6 / (data.protocols.ipv4 + data.protocols.ipv6) * 100));
        }

        if (data.wireless != null) {
            $('#wireless_bands_a_cur').html(data.wireless.bandsA);
            $('#wireless_bands_g_cur').html(data.wireless.bandsG);
            $('#wireless_bands_24n_cur').html(data.wireless.bands24N);
            $('#wireless_bands_5n_cur').html(data.wireless.bands5N);
        }
        $('#streaming_saal1_cur').html(data.streaming.saal1);
        $('#streaming_saal2_cur').html(data.streaming.saal2);
        $('#streaming_saal3_cur').html(data.streaming.saal3);


    });

    cache.bw_up_total = parseInt(cache.bw_up_total);
    cache.bw_down_total = parseInt(cache.bw_down_total);


    if (cache.clients_wired_peak == null) {
        $('#clients_wired_peak').html("N/A");
    }
    if (cache.clients_wireless_peak == null) {
        $('#clients_wireless_peak').html("N/A");
    }
    if (cache.poc_peak == null) {
        $('#poc_peak').html("N/A");
    }
    if (cache.geiger_peak == null) {
        $('#geiger_peak').html("N/A");
    }
    if (cache.openbeacon_peak == null) {
        $('#openbeacon_peak').html("N/A");
    }
    if (cache.streaming_saal1_peak == null) {
        $('#streaming_saal1_peak').html("N/A");
    }
    if (cache.streaming_saal2_peak == null) {
        $('#streaming_saal2_peak').html("N/A");
    }
    if (cache.streaming_saal3_peak == null) {
        $('#streaming_saal3_peak').html("N/A");
    }

    $('#bw_up_total').html(cache.bw_up_total);
    $('#bw_down_total').html(cache.bw_down_total);

    $("#downstream").progressbar({
        value: (cache.bw_down / max_bandwith * 100)
    });
    $("#upstream").progressbar({
        value: (cache.bw_up / max_bandwith * 100)
    })

    $('#bw_down_percent').html(parseInt(cache.bw_down / max_bandwith * 100));
    $('#bw_up_percent').html(parseInt(cache.bw_up / max_bandwith * 100));

    c3graph();
    $('#loading').hide();
    history = 1;

});

// receive loop
socket.on('data', function (data) {

    if (history == 1) {

        if (cache.firstgraph == null) {
            cache.firstgraph = 1;
            data.graph = 1;
        }

        if (data.bw != null) {

            $('#bw_up_cur').html(data.bw.up);
            $('#bw_down_cur').html(data.bw.down);

            cache.bw_up_total += parseInt(data.bw.up * 6.5 / 8 / 1024);
            cache.bw_down_total += parseInt(data.bw.down * 6.5 / 8 / 1024);

            $('#bw_up_total').html(parseInt(cache.bw_up_total));
            $('#bw_down_total').html(parseInt(cache.bw_down_total));

            $("#downstream").progressbar({
                value: (data.bw.down / max_bandwith * 100)
            });
            $("#upstream").progressbar({
                value: (data.bw.up / max_bandwith * 100)
            });

            $('#bw_down_percent').html(parseInt(data.bw.down / max_bandwith * 100));
            $('#bw_up_percent').html(parseInt(data.bw.up / max_bandwith * 100));

            if (data.bw.up > cache.bw_up_peak) {
                cache.bw_up_peak = data.bw.up;
                $('#bw_up_peak').html(data.bw.up);
            };
            if (data.bw.down > cache.bw_down_peak) {
                cache.bw_down_peak = data.bw.down;
                $('#bw_down_peak').html(data.bw.down);
            };
            if (data.graph != null) {
                bwSeriesData[0].push({
                    x: data.unixtime,
                    y: data.bw.up
                });
                bwSeriesData[1].push({
                    x: data.unixtime,
                    y: data.bw.down
                });
                bwGraph.update();
            }
        }
        if (data.clients != null) {
            $('#clients_wired_cur').html(data.clients.wired);
            $('#clients_wireless_cur').html(data.clients.wireless);
            if (data.clients.wired > cache.clients_wired_peak) {
                cache.clients_wired_peak = data.clients.wired;
                $('#clients_wired_peak').html(data.clients.wired);
            };
            if (data.clients.wireless > cache.clients_wireless_peak) {
                cache.clients_wireless_peak = data.clients.wireless;
                $('#clients_wireless_peak').html(data.clients.wireless);
            };
            if (data.graph != null) {
                clientsSeriesData[0].push({
                    x: data.unixtime,
                    y: data.clients.wired
                });
                clientsSeriesData[1].push({
                    x: data.unixtime,
                    y: data.clients.wireless
                });
                clientsGraph.update();
            }
        }
        if (data.poc != null) {
            $('#poc_cur').html(data.poc.connected);
            if (data.poc.connected > cache.poc_peak) {
                cache.poc_peak = data.poc.connected;
                $('#poc_peak').html(data.poc.connected);
            };
            if (data.graph != null) {
                pocSeriesData[0].push({
                    x: data.unixtime,
                    y: data.poc.connected
                });
                pocGraph.update();
            }
        }
        if (data.geiger != null) {
            $('#geiger_cur').html(data.geiger.poc);
            if (data.geiger.poc > cache.geiger_peak) {
                cache.geiger_peak = data.geiger.poc;
                $('#geiger_peak').html(data.geiger.poc);
            };
            if (data.graph != null) {
                geigerSeriesData[0].push({
                    x: data.unixtime,
                    y: data.geiger.poc
                });
                geigerGraph.update();
            }
        }
        if (data.openbeacon != null) {
            $('#openbeacon_cur').html(data.openbeacon.connected);
            if (data.openbeacon.connected > cache.openbeacon_peak) {
                cache.openbeacon_peak = data.openbeacon.conntected
                $('#openbeacon_peak').html(data.openbeacon.connected);
            };
            if (data.graph != null) {
                openBeaconSeriesData[0].push({
                    x: data.unixtime,
                    y: data.openbeacon.connected
                });
                openBeaconGraph.update();
            }
        }
        if (data.protocols != null) {
            $('#procotolls_ipv4_cur').html(data.protocols.ipv4);
            $('#procotolls_ipv6_cur').html(data.protocols.ipv6);
            if (data.graph != null) {
                protocolsSeriesData[0].push({
                    x: data.unixtime,
                    y: parseInt(data.protocols.ipv4 / (data.protocols.ipv4 + data.protocols.ipv6) * 100)
                });
                protocolsSeriesData[1].push({
                    x: data.unixtime,
                    y: parseInt(data.protocols.ipv6 / (data.protocols.ipv4 + data.protocols.ipv6) * 100)
                });
                protocolsGraph.update();
            }
        }
        if (data.wireless != null) {
            $('#wireless_bands_a_cur').html(data.wireless.bandsA);
            $('#wireless_bands_g_cur').html(data.wireless.bandsG);
            $('#wireless_bands_24n_cur').html(data.wireless.bands24N);
            $('#wireless_bands_5n_cur').html(data.wireless.bands5N);
            if (data.graph != null) {
                wirelessBandsSeriesData[0].push({
                    x: data.unixtime,
                    y: data.wireless.bandsA
                });
                wirelessBandsSeriesData[1].push({
                    x: data.unixtime,
                    y: data.wireless.bandsG
                });
                wirelessBandsSeriesData[2].push({
                    x: data.unixtime,
                    y: data.wireless.bands24N
                });
                wirelessBandsSeriesData[3].push({
                    x: data.unixtime,
                    y: data.wireless.bands5N
                });
                wirelessBandsGraph.update();
            }
        }
        if (data.streaming != null) {
            $('#streaming_saal1_cur').html(data.streaming.saal1);
            $('#streaming_saal2_cur').html(data.streaming.saal2);
            $('#streaming_saal3_cur').html(data.streaming.saal3);
            if (data.streaming.saal1 > cache.streaming_saal1_peak) {
                cache.streaming_saal1_peak = data.streaming.saal1;
                $('#streaming_saal1_peak').html(data.streaming.saal1);
            };
            if (data.streaming.saal2 > cache.streaming_saal2_peak) {
                cache.streaming_saal2_peak = data.streaming.saal2;
                $('#streaming_saal2_peak').html(data.streaming.saal2);
            };
            if (data.streaming.saal3 > cache.streaming_saal3_peak) {
                cache.streaming_saal3_peak = data.streaming.saal3;
                $('#streaming_saal3_peak').html(data.streaming.saal3);
            };
            if (data.graph != null) {
                streamingSeriesData[0].push({
                    x: data.unixtime,
                    y: data.streaming.saal1
                });
                streamingSeriesData[1].push({
                    x: data.unixtime,
                    y: data.streaming.saal2
                });
                streamingSeriesData[2].push({
                    x: data.unixtime,
                    y: data.streaming.saal3
                });
                streamingGraph.update();
            }


        };

    }
});
