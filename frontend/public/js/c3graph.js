var bwGraph;
var clientsGraph;
var pocGraph;
var geigerGraph;
var streamingGraph;
var wirelessBandsGraph;
var openBeaconGraph;
var protocolsGraph;

var palette = new Rickshaw.Color.Palette({
    scheme: 'colorwheel'
});
var palette2 = new Rickshaw.Color.Palette({
    scheme: 'colorwheel'
});


function c3graph() {

    if (detailGraph == 1) {
        var globalWidth = 948;
        var globalHeight = 310;
    } else {
        var globalWidth = 450;
        var globalHeight = 165;
    }

    bwGraph = new Rickshaw.Graph({
        element: document.getElementById("bw_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette.color(),
            data: bwSeriesData[1],
            name: 'Downstream'
        }, {
            color: palette.color(),
            data: bwSeriesData[0],
            name: 'Upstream'
        }]
    });
    bwGraph.render();
    var bwLegend = new Rickshaw.Graph.Legend({
        graph: bwGraph,
        element: document.getElementById('bw_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: bwGraph,
        legend: bwLegend
    });
    var ticksTreatment = 'glow';
    var bwXAxis = new Rickshaw.Graph.Axis.Time({
        graph: bwGraph,
        ticksTreatment: ticksTreatment
    });
    bwXAxis.render();
    var bwYAxis = new Rickshaw.Graph.Axis.Y({
        graph: bwGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    bwYAxis.render();
    if (detailGraph == 1) {
        var bwSlider = new Rickshaw.Graph.RangeSlider({
            graph: bwGraph,
            element: $('#bw_slider')
        });
        var bwHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: bwGraph
        });
    };

    clientsGraph = new Rickshaw.Graph({
        element: document.getElementById("clients_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette.color(),
            data: clientsSeriesData[0],
            name: 'Wired'
        }, {
            color: palette.color(),
            data: clientsSeriesData[1],
            name: 'Wireless'
        }]
    });
    clientsGraph.render();
    var clientsLegend = new Rickshaw.Graph.Legend({
        graph: clientsGraph,
        element: document.getElementById('clients_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: clientsGraph,
        legend: clientsLegend
    });
    var ticksTreatment = 'glow';
    var clientsXAxis = new Rickshaw.Graph.Axis.Time({
        graph: clientsGraph,
        ticksTreatment: ticksTreatment
    });
    clientsXAxis.render();
    var clientsYAxis = new Rickshaw.Graph.Axis.Y({
        graph: clientsGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    clientsYAxis.render();

    console.log("clients graph done");

    if (detailGraph == 1) {
        var clientsSlider = new Rickshaw.Graph.RangeSlider({
            graph: clientsGraph,
            element: $('#clients_slider')
        });
        var clientsHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: clientsGraph
        });
    };

    pocGraph = new Rickshaw.Graph({
        element: document.getElementById("poc_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette.color(),
            data: pocSeriesData[0],
            name: 'Connected'
        }, ]
    });
    pocGraph.render();
    var pocLegend = new Rickshaw.Graph.Legend({
        graph: pocGraph,
        element: document.getElementById('poc_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: pocGraph,
        legend: pocLegend
    });
    var ticksTreatment = 'glow';
    var pocXAxis = new Rickshaw.Graph.Axis.Time({
        graph: pocGraph,
        ticksTreatment: ticksTreatment
    });
    pocXAxis.render();
    var pocYAxis = new Rickshaw.Graph.Axis.Y({
        graph: pocGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    pocYAxis.render();

    if (detailGraph == 1) {
        var pocSlider = new Rickshaw.Graph.RangeSlider({
            graph: pocGraph,
            element: $('#poc_slider')
        });
        var pocHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: pocGraph
        });
    };

    streamingGraph = new Rickshaw.Graph({
        element: document.getElementById("streaming_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette.color(),
            data: streamingSeriesData[0],
            name: 'Saal1'
        }, {
            color: palette.color(),
            data: streamingSeriesData[1],
            name: 'Saal2'
        }, {
            color: palette.color(),
            data: streamingSeriesData[2],
            name: 'Saal3'
        }]
    });
    streamingGraph.render();
    var streamingLegend = new Rickshaw.Graph.Legend({
        graph: streamingGraph,
        element: document.getElementById('streaming_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: streamingGraph,
        legend: streamingLegend
    });
    var ticksTreatment = 'glow';
    var streamingXAxis = new Rickshaw.Graph.Axis.Time({
        graph: streamingGraph,
        ticksTreatment: ticksTreatment
    });
    streamingXAxis.render();
    var streamingYAxis = new Rickshaw.Graph.Axis.Y({
        graph: streamingGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    streamingYAxis.render();

    if (detailGraph == 1) {
        var streamingSlider = new Rickshaw.Graph.RangeSlider({
            graph: streamingGraph,
            element: $('#streaming_slider')
        });
        var streamingHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: streamingGraph
        });
    };

    console.log("streaming graph done");

    geigerGraph = new Rickshaw.Graph({
        element: document.getElementById("geiger_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette2.color(),
            data: geigerSeriesData[0],
            name: 'CPM @ POC'
        }, ]
    });
    geigerGraph.render();
    var geigerLegend = new Rickshaw.Graph.Legend({
        graph: geigerGraph,
        element: document.getElementById('geiger_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: geigerGraph,
        legend: geigerLegend
    });
    var ticksTreatment = 'glow';
    var geigerXAxis = new Rickshaw.Graph.Axis.Time({
        graph: geigerGraph,
        ticksTreatment: ticksTreatment
    });
    geigerXAxis.render();
    var geigerYAxis = new Rickshaw.Graph.Axis.Y({
        graph: geigerGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    geigerYAxis.render();

    if (detailGraph == 1) {
        var geigerSlider = new Rickshaw.Graph.RangeSlider({
            graph: geigerGraph,
            element: $('#geiger_slider')
        });
        var geigerHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: geigerGraph
        });
    };

    console.log("geiger graph done");


    wirelessBandsGraph = new Rickshaw.Graph({
        element: document.getElementById("wireless_bands_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette2.color(),
            data: wirelessBandsSeriesData[0],
            name: '802.11a Clients'
        }, {
            color: palette2.color(),
            data: wirelessBandsSeriesData[1],
            name: '802.11g Clients'
        }, {
            color: palette2.color(),
            data: wirelessBandsSeriesData[2],
            name: '802.11n 2.4GHz Clients'
        }, {
            color: palette2.color(),
            data: wirelessBandsSeriesData[3],
            name: '802.11n 5GHz Clients'
        }, ]
    });

    console.log("wb 1");

    wirelessBandsGraph.render();
    var wirelessBandsLegend = new Rickshaw.Graph.Legend({
        graph: wirelessBandsGraph,
        element: document.getElementById('wireless_bands_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: wirelessBandsGraph,
        legend: wirelessBandsLegend
    });
    var ticksTreatment = 'glow';
    var wirelessBandsXAxis = new Rickshaw.Graph.Axis.Time({
        graph: wirelessBandsGraph,
        ticksTreatment: ticksTreatment
    });
    wirelessBandsXAxis.render();
    var wirelessBandsYAxis = new Rickshaw.Graph.Axis.Y({
        graph: wirelessBandsGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    wirelessBandsYAxis.render();

    if (detailGraph == 1) {
        var wirelessBandsSlider = new Rickshaw.Graph.RangeSlider({
            graph: wirelessBandsGraph,
            element: $('#wireless_bands_slider')
        });
        var wirelessBandsHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: wirelessBandsGraph
        });
    };
    console.log("wireless bands graph done");

    openBeaconGraph = new Rickshaw.Graph({
        element: document.getElementById("openbeacon_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette2.color(),
            data: openBeaconSeriesData[0],
            name: 'r0kets visible'
        }, ]
    });

    console.log("open beacon middle graph done");

    openBeaconGraph.render();

    console.log("ob render");

    var openBeaconLegend = new Rickshaw.Graph.Legend({
        graph: openBeaconGraph,
        element: document.getElementById('openbeacon_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: openBeaconGraph,
        legend: openBeaconLegend
    });
    var ticksTreatment = 'glow';
    console.log("ob render2");

    var openBeaconXAxis = new Rickshaw.Graph.Axis.Time({
        graph: openBeaconGraph,
        ticksTreatment: ticksTreatment
    });
    openBeaconXAxis.render();
    var openBeaconYAxis = new Rickshaw.Graph.Axis.Y({
        graph: openBeaconGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    openBeaconYAxis.render();

    console.log("beacon graph done");

    if (detailGraph == 1) {
        var openBeaconSlider = new Rickshaw.Graph.RangeSlider({
            graph: openBeaconGraph,
            element: $('#openbeacon_slider')
        });

        var openBeaconHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: openBeaconGraph
        });
    };

    protocolsGraph = new Rickshaw.Graph({
        element: document.getElementById("protocols_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: [{
            color: palette2.color(),
            data: protocolsSeriesData[0],
            name: 'IPv4 %'
        }, {
            color: palette2.color(),
            data: protocolsSeriesData[1],
            name: 'IPv6 %'
        }, ]
    });
    protocolsGraph.render();
    var protocolsLegend = new Rickshaw.Graph.Legend({
        graph: protocolsGraph,
        element: document.getElementById('protocols_legend')
    });
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: protocolsGraph,
        legend: protocolsLegend
    });
    var ticksTreatment = 'glow';
    var protocolsXAxis = new Rickshaw.Graph.Axis.Time({
        graph: protocolsGraph,
        ticksTreatment: ticksTreatment
    });
    protocolsXAxis.render();
    var protocolsYAxis = new Rickshaw.Graph.Axis.Y({
        graph: protocolsGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    protocolsYAxis.render();

    if (detailGraph == 1) {
        var protocolsSlider = new Rickshaw.Graph.RangeSlider({
            graph: protocolsGraph,
            element: $('#protocols_slider')
        });
        var protocolsHoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: protocolsGraph
        });
    };

}
console.log("loaded c3graph");
