
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
        var vaCounty = (topojson.feature(county, county.objects.VA_County_Amend).features)

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

