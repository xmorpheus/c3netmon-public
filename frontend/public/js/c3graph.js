var palette = new Rickshaw.Color.Palette({
    scheme: 'cool'
});
var palette2 = new Rickshaw.Color.Palette({
    scheme: 'cool'
});

var graphArray = new Array();
graphArray.legend = new Array();
graphArray.Xaxis = new Array();
graphArray.Yaxis = new Array();
graphArray.Hover = new Array();
graphArray.Slider = new Array();

function createGraph(name,data) {

    if (detailGraph == 1) {
        var globalWidth = 948;
        var globalHeight = 310;
    } else {
        var globalWidth = 450;
        var globalHeight = 165;
    }

    var mySeries = new Array();

    $.each(Series[name], function(subKey, subValue) {

		mySeries.push({ 
			color: palette.color(),
			data: Series[name][subKey],
			name: data.legend[subKey]
			})

		/*console.log(mySeries);*/
	})

    //Rickshaw.Series.zeroFill(mySeries);

    graphArray[name] = new Rickshaw.Graph({
        element: document.getElementById(name+"_graph"),
        width: globalWidth,
        height: globalHeight,
        renderer: 'stack',
        series: mySeries,
    });
    graphArray[name].render();
    
    graphArray.legend.name = new Rickshaw.Graph.Legend({
        graph: graphArray[name],
        element: document.getElementById(name+'_legend')
    });
    
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: graphArray[name],
        legend: graphArray.legend.name
    });
    var ticksTreatment = 'glow';
    graphArray.Xaxis.name = new Rickshaw.Graph.Axis.Time({
        graph: graphArray[name],
        ticksTreatment: ticksTreatment
    });
    graphArray.Xaxis.name.render();
    graphArray.Yaxis.name = new Rickshaw.Graph.Axis.Y({
        graph: graphArray[name],
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    });
    graphArray.Yaxis.name.render();
    if (detailGraph == 1) {
        graphArray.Slider.name = new Rickshaw.Graph.RangeSlider({
            graph: graphArray[name],
            element: $('#'+name+'_slider')
        });
        graphArray.Hover.name = new Rickshaw.Graph.HoverDetail({
            graph: graphArray[name]
        });
    };
    $('#'+name).show();

}
console.log("loaded c3graph");
