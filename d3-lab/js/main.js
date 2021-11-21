// let files = ["data/Local_Covid.csv", "data/VA_County_Amend.topojson"]
// let promises = [];
// let countyData = null;
// let attributeData = null;
// let expressed = "Population"
// let attributeDataArray = [];

// // begin script attempt
// window.onload = function()
// {
//     files.forEach(function(url){
//         promises.push(d3.json(url))
//     });

//     Promise.all(promises).then(function(values){
//         values.forEach(element => {
//             if (element.arcs != undefined && element.arcs.length == 100)
//             {
//                 element = topojson.feature(element, element.objects["NAME"])
//                 countyData = element;
//             }
//             else {
//                 attributeData = element;
//             }
//             console.log(element)
//         });

//         joinData(attributeData, countyData.features);
//         loadMap (countyData, attributeData, expressed);
//     })
// };

// Loads when the window is done. 
csvData = "/d3-lab/data/Local_Covid.csv"
countyData = "/d3-lab/data/VA_County_Amend.json"

window.onload = setMap();

function setMap(){

    d3.queue()
        .defer(d3.csv, "data/Local_Covid.csv")
        .defer(d3.json, "data/VA_County_Amend.json")
        .await(callback);
    function callback( error, csvData, countyData){
        console.log(error);
        console.log(csvData);
        console.log(countyData);
    };
};
