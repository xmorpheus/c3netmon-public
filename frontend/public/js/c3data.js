// setup socket for socket.io
var socket = io.connect();

var graphCount = 0;

var config = new Array();
config.push('bw');
config.push('clients');
config.push('poc');
config.push('streaming');
config.push('protocols');
config.push('wireless');
config.push('openbeacon');
config.push('radiation');

function initGraphHTML(name,div)
{
	graphCount++;

     var html;
	if(graphCount==0) { html+= '<tr>'; };
	html += ' <td valign="top" width="600">';
     html += '   <div class="metal-box">';
     html += '     <div id="'+name+'" style="display:none;">';
     html += '	     <h3 class="gauge-title"><span id="'+name+'Name"></span></h3>';
     html += '       <div class="gauge">';
	$.each(Series[name], function(subKey, subValue) {
		html += '       <strong><span id="'+name+'Legend'+subKey+'"></span>:</strong> <span id="'+name+'Value'+subKey+'"></span><span id="'+name+'Type'+subKey+'"></span> (<span id="'+name+'_up_peak"></span>mbit/s) &middot;';
	})
     html += '       <div id="'+name+'_graph" class="graph-box"></div>';
     html += '       <div id="'+name+'_legend" class="graph-legend"></div>';
     html += '     </div>';
     html += '    </div>';
     html += '   </div>';
     html += ' </td>';
	if(graphCount==2) 
	{
		graphCount=0; 
		html +='</tr>'; 
	}
	$(div).append(html);
	if(graphCount==0)
	{
		$(div).append('<tr><td colspan=2><br></td></tr>');
	}
}

function initArray(newLength)
{
	newArray = new Array(newLength);
	for (var i = 0; i < newArray.length; ++i)
	{
		newArray[i] = new Array();
		newArray[i].push ({ x: 0, y: 0 });
	}

	return newArray;
}

var Series = new Array();

for (var i = 0; i < config.length; ++i)
{
	name = config[i];
	Series[name] = initArray(2);
}

// max bandwith for percent graphing
var max_bandwith = 200;

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

var graph = [];
graph.bw = null;
graph.clients = null;
graph.poc = null;
graph.streaming = null;
graph.protocols = null;
graph.wirelessBands = null;
graph.geiger = null;
graph.openBeacon = null;

$.ajaxSetup({
    "async": false
});

$.getJSON('/history.json', function (data) {
    // got json, removing dummy data

	$.each(config, function(key, value) { 
		$.each(Series[value], function(key, value) {
			value.pop();
		})
  	});
    
    var historyCount = 0;
    var xinit = [];

    // update graph arrays with historical data
    $.each(data, function (key, data) {


	    $.each(config, function(key, value) 
	    {

		$.each(Series[value], function(subKey, subValue) {


			if(data[value] != null)
			{	
				subValue.push({
					x: data.unixtime,
					y: data[value].value[subKey]
				});

				$('#'+value+'Value'+subKey).html(data[value].value[subKey]);

				if(xinit[value] == null)
				{
					xinit[value]=1;
					initGraphHTML(value,"#graph");
					$('#'+value+'Name').html(data[value].name);
				
				}
				$('#'+value+'Legend'+subKey).html(data[value].legend[subKey]);
				$('#'+value+'Type'+subKey).html(data[value].type[subKey]);
			}
		
	    		})
			if(xinit[value]==1)
			{
				xinit[value]=2;
				createGraph(value);
			}	
	    })

    /*if (data.bw.up > cache.bw_up_peak) {*/
    /*cache.bw_up_peak = data.bw.up;*/
    /*$('#bw_up_peak').html(data.bw.up);*/
    /*};*/
    /*if (data.bw.down > cache.bw_down_peak) {*/
    /*cache.bw_down_peak = data.bw.down;*/
    /*$('#bw_down_peak').html(data.bw.down);*/
    /*};*/

        cache.bw_down_total += (data.bw.value[0] * 300 / 8 / 1024);
	   cache.bw_up_total += (data.bw.value[1] * 300 / 8 / 1024);

        cache.bw_down = data.bw.value[0];
	   cache.bw_up = data.bw.value[1];

        $('#bw_down_cur').html(data.bw.value[0]);
	   $('#bw_up_cur').html(data.bw.value[1]);

    });

    cache.bw_up_total = parseInt(cache.bw_up_total);
    cache.bw_down_total = parseInt(cache.bw_down_total);

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

	$.each(config, function(key, value)
	{
		graphArray[value].render();
	})

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


	   $.each(config, function(key, value) 
	   {
	   	   $.each(Series[value], function(subKey, subValue) {
		   if(data[value] != null)
		   {	
				subValue.push({
					x: data.unixtime,
					y: data[value].value[subKey]													
				});
			}
			$('#'+value+'Value'+subKey).html(data[value].value[subKey]);
		   })
		   graphArray[value].render();
	   })

	   cache.bw_down_total += parseInt(data.bw.value[0] * 6.5 / 8 / 1024);
        cache.bw_up_total += parseInt(data.bw.value[1] * 6.5 / 8 / 1024);
	   $('#bw_up_total').html(parseInt(cache.bw_up_total));
        $('#bw_down_total').html(parseInt(cache.bw_down_total));
        $("#downstream").progressbar({
		value: (data.bw.value[0] / max_bandwith * 100)
        });
        $("#upstream").progressbar({
          value: (data.bw.value[1] / max_bandwith * 100)
        });
        $('#bw_down_percent').html(parseInt(data.bw.value[0] / max_bandwith * 100));
        $('#bw_up_percent').html(parseInt(data.bw.value[1] / max_bandwith * 100));

	   /*if (data.bw.up > cache.bw_up_peak) {*/
	   /*cache.bw_up_peak = data.bw.up;*/
	   /*$('#bw_up_peak').html(data.bw.up);*/
	   /*};*/
	   /*if (data.bw.down > cache.bw_down_peak) {*/
	   /*cache.bw_down_peak = data.bw.down;*/
	   /*$('#bw_down_peak').html(data.bw.down);*/
	   /*};*/



    }
});
console.log("loaded c3data");
