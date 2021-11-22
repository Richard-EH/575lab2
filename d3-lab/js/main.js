
//variables 
var attrArray = ["Single_Family_Homes_Built", "Population", "Covid_Hospitalisations", "Covid_Death_Total", "Covid_Cases_Total"];
var expressed = attrArray[0];


//loads when window loads
window.onload = setMap();

function setMap(){
// Dimensions for those who don't know
    var width = 960;
    var height = 460;
// creation of the SVG area
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);//this code at least works.

    var projection = d3.geoAlbers()
        .center([-2.18, 33.6])
        .rotate([81, -13.64, 0])
        .parallels([29.5, 45.5])
        .scale(1000.00)
        .translate([width/2, height/2]);

    var path = d3.geoPath()
        .projection(projection);

	//use Promise.all to parallelize asynchronous data loading
	var promises = [];
	promises.push(d3.csv("/d3-lab/data/Local_Covid.csv")); //load attributes from csv
	promises.push(d3.json("/d3-lab/data/VA_County_Amend.topojson")); //load choropleth spatial data
	Promise.all(promises).then(callback);
    // Callback Function to run after the promise code block
    function callback(data){
        // Only error has any data...everything else is returned as undefined and I have no idea how to fix this. Error only returns the first row of the csv. 
        [csvData,countyData] = data;
//graticule
        setGraticule(map, path);
        // topo conversion
        var vaCounty = (topojson.feature(countyData, countyData.objects.VA_County_Amend).features);

        //data join for County Data and CSV
        vaCounty = joinData(vaCounty, csvData);

        //create the color scale
        var colorScale = makeColorScaleNatural(csvData);
        
        //add enumeration units to the map
        setEnumerationUnits(countyData, map, path, colorScale);
        
        //add coordinated visualization to the map
        setChart(csvData, colorScale);

    }
}; // End of setmap so far. 

function setGraticule(map, path){

    var graticule = d3.geoGraticule()
        .step([5,5]);
    	//create graticule background
	var gratBackground = map.append("path")
    .datum(graticule.outline()) //bind graticule background
    .attr("class", "gratBackground") //assign class for styling
    .attr("d", path) //project graticule

//create graticule lines	
    var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
        .data(graticule.lines()) //bind graticule lines to each element to be created
        .enter() //create an element for each datum
        .append("path") //append each element to the svg as a path element
        .attr("class", "gratLines") //assign class for styling
        .attr("d", path); //project graticule lines
};

function joinData(countyData, csvData){
    for (var i=0; i<csvData.length; i++){
        var csvCovid = csvData[i]; //the current region
        var csvKey = csvCovid.FIPS; //the CSV primary key

                //loop through geojson regions to find correct region
                for (var a=0; a<countyData.length; a++){

                    var geojsonProps = countyData[a].properties; //the current region geojson properties
                    var geojsonKey = geojsonProps.STCOFIPS; //the geojson primary key
        
                    //where primary keys match, transfer csv data to geojson properties object
                    if (geojsonKey == csvKey){
        
                        //assign all attributes and values
                        attrArray.forEach(function(attr){
                            var val = parseFloat(csvCovid[attr]); //get csv attribute value
                            geojsonProps[attr] = val; //assign attribute and value to geojson properties
                        });
                    };
                };
            };
        
            console.log(countyData);
        
            return countyData;
};
function makeColorScaleNatural(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    //console.log(domainArray);
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);
	//console.log(domainArray);

    return colorScale;
};
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};


function setEnumerationUnits(countyData, map, path, colorScale){
	//add counties to map
	var regions = map.selectAll(".regions")
		.data(countyData)
		.enter()
		.append("path")
		.attr("class", function(d){
			return "regions " + d.properties.NAME;
		})
		.attr("d", path)
		.style("fill", function(d){
            return choropleth(d.properties, colorScale);
        });
};

function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame
    var csvmax = d3.max(csvData, function(d) { return parseFloat(d[expressed]); });
    console.log(csvmax);
    var yScale = d3.scaleLinear()
        .range([chartHeight - 10, 0])
        .domain([0, csvmax + 20]);

    //set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.adm1_code;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function(d, i){
            return chartHeight - 10 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 150)
        .attr("y", 30)
        .attr("class", "chartTitle")
        .text("Number of" + " " + expressed[0] + " in each County.");

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

};
