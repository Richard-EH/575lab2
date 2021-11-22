//loads when window loads
window.onload = setMap();

function setMap(){
// Dimensions for those who don't know
    var width = 960;
    var height = 460;
// creation of the SVG area
    var map = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);//this code at least works.
//queue block however I have been unable to get this to load data properly. 
    d3.queue()
        .defer(d3.csv, "/d3-lab/data/Local_Covid.csv")
        .defer(d3.json, "/d3-lab/data/VA_County_Amend.topojson")
        .await(callback);
    // Callback Function to run after the d3.queue
    function callback( error, csvData, countyData){
        // Only error has any data...everything else is returned as undefined and I have no idea how to fix this. Error only returns the first row of the csv. 
        console.log(error);
        console.log(csvData);
        console.log(countyData);

    var counties = map.selectAll(".counties")
        .data (countyData)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "counties" + d.properties.FIPS;
        })
        .attr("d",path);
    };
};
