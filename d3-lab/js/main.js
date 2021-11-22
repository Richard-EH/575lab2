//(function(){
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
        .center([-0.36, 24.36])
        .rotate([81, -13.64, 0])
        .parallels([29.5, 45.5])
        .scale(5000.00)
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
        var vaCounty = (topojson.feature(countyData, countyData.objects.VA_County_Amend).features)

        //data join for County Data and CSV
        vaCounty = joinData(vaCounty, csvData);

        //create the color scale
        var colorScale = makeColorScaleNatural(csvData);
        
        //add enumeration units to the map
        setEnumerationUnits(franceRegions, map, path, colorScale);
        
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


//})