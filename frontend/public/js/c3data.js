// setup socket for socket.io
var socket = io.connect();

var graphCount = 0
var max_bandwith = 22000;

var config = new Array();
var Series = new Array();
var Peak = new Array();

// temp variable to check if history is loaded
var history = null;

var cache = [];
cache.bw_down = null;
cache.bw_up = null;
cache.bw_down_total = null;
cache.bw_up_total = null;
  
$.ajaxSetup({
	"async": false
});

function initGraphHTML(name,div)
{

	graphCount++;
	var width;
	var height;
	var members=0;
	var i=0;

	$.each(Series[name], function(subKey, subValue) {
		members++;
	})

	if(detailGraph==false) { width=600; height=275 } else { width=1100; height=400; } 

     var html;
	if(graphCount==0) { html+= '<tr>'; };
	html += ' <td valign="top" width="'+width+'">';
     html += '   <div class="metal-box">';
     html += '     <div id="'+name+'" style="display:none;">';
     html += '	     <h3 class="gauge-title"><span id="'+name+'Name"></span></h3>';
     html += '       <div class="gauge" style="height:'+height+'px">';
	$.each(Series[name], function(subKey, subValue) {
		i++;
		html += '       <strong><span id="'+name+'Legend'+subKey+'"></span>:</strong> <span id="'+name+'Value'+subKey+'"></span> <span id="'+name+'Type'+subKey+'"></span> (<span id="'+name+'Value'+subKey+'Peak"></span>) ';
		if(i<members) { html += '&middot'; };
	})
     html += '       <div id="'+name+'_graph" class="graph-box" style="height:'+(height-90)+'px;width:'+(width-150)+'px;"></div>';
     html += '       <div id="'+name+'_legend" class="graph-legend"></div>';
	html += '     </div>';
     html += '    </div>';
     html += '   </div>';
     html += ' </td>';
	if(graphCount==2 || detailGraph==true) 
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

function initGraphArray(newLength)
{
	newArray = new Array(newLength);
	for (var i = 0; i < newArray.length; ++i)
	{
		newArray[i] = new Array();
		newArray[i].push ({ x: 0, y: 0 });
	}

	return newArray;
}

function initArray(newLength)
{
	newArray = new Array(newLength);
	for (var i = 0; i < newArray.length; ++i)
	{
		newArray[i] = new Array();
	}

	return newArray;
}

function init()
{

    $.getJSON('/info.json', function (data) {

	   	$.each(data.plugins, function(key, value) 
		{
			var members = 0; 
			
			config.push(value);
			Peak.push(value);

			$.each(data[value].legend, function(key, value)
			{
				members++;
			})

        		Series[value] = initGraphArray(members);
			Peak[value] = initArray(members);

			initGraphHTML(value,"#graph");

			$('#'+value+'Name').html(data[value].name);
			
			$.each(data[value].legend, function(lkey, lvalue)
			{
				$('#'+value+'Legend'+lkey).html(data[value].legend[lkey]);
				$('#'+value+'Type'+lkey).html(data[value].type[lkey]);
			})

			
		})
	
		initHistory();

		$.each(config, function(key, value)
		{
			createGraph(value, data[value]);
			graphArray[value].render();
		})
	
})
}

function initHistory()
{

$.getJSON('/history.json', function (data) {
    // got json, removing dummy data

	$.each(config, function(key, value) { 
		$.each(Series[value], function(key, value) {
			value.pop();
		})
  	});
    
    var historyCount = 0;

    // update graph arrays with historical data
    $.each(data, function (key, datax) {

	    $.each(datax, function (keyy, datay) 
		{
			$.each(config, function(keyz, dataz)
			{
				if(dataz==keyy)
				{

				/*console.log(Series[dataz]);*/

					$.each(Series[dataz], function(subKey, subValue) {
						
						try {

								if(datax[dataz].value[subKey]>=0)
								{

                        	                        		subValue.push({
                	                                        		x: datax.unixtime,
        	                                                		y: datax[dataz].value[subKey]
	                                                		})
								}
						
							        $('#'+dataz+'Value'+subKey).html(datax[dataz].value[subKey]);

                                                 		if (datax[dataz].value[subKey] > Peak[dataz][subKey])
                                                 		{
                                                        		Peak[dataz][subKey] = datax[dataz].value[subKey];
                                                        		$('#'+dataz+'Value'+subKey+'Peak').html(Peak[dataz][subKey]);
                                                 		}

						} catch (e) {
							// skipping missing data point
						}

						 
					})	
				}
			})
		})
	
		// some special manual stuff

		if(datax.bw.value[0]>0 && datax.bw.value[1]>0)
		{
     			cache.bw_down_total += (datax.bw.value[0] * 300 / 8 / 1024);
			cache.bw_up_total += (datax.bw.value[1] * 300 / 8 / 1024);

     			cache.bw_down = datax.bw.value[0];
			cache.bw_up = datax.bw.value[1];

     			$('#bw_down_cur').html(datax.bw.value[0]);
			$('#bw_up_cur').html(datax.bw.value[1]);
    
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
		}

     });

     $('#loading').hide();
     history = 1;

	});

}

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
		
 		   if (data[value].value[subKey] > Peak[value][subKey])
		   {
 				Peak[value][subKey] = data[value].value[subKey];
				$('#'+value+'Value'+subKey+'Peak').html(Peak[value][subKey]);
		   }

		   })

		   graphArray[value].render();
	   })

	   // some special manual stuff

	   cache.bw_down_total += parseInt(data.bw.value[0] * 10 / 8 / 1024);
           cache.bw_up_total += parseInt(data.bw.value[1] * 10 / 8 / 1024);
           $('#bw_down_total').html(parseInt(cache.bw_down_total));
           $('#bw_up_total').html(parseInt(cache.bw_up_total));

           $("#downstream").progressbar({
		value: (data.bw.value[0] / max_bandwith * 100)
           });
           $("#upstream").progressbar({
           	value: (data.bw.value[1] / max_bandwith * 100)
           });
           $('#bw_down_percent').html(parseInt(data.bw.value[0] / max_bandwith * 100));
           $('#bw_up_percent').html(parseInt(data.bw.value[1] / max_bandwith * 100));
    }

});
console.log("loaded c3data");
