/*//var year = "2005"
//var firstRun = true;

//dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          //API_SH/Spercountryperyear.csv
          //https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv
d3.csv("API_SH/Spercountryperyear.csv", function(data) {
  // X axis: scale and draw:
  var x = d3.scaleLinear()
      .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
 // set the parameters for the histogram
  var histogram = d3.histogram()
      .value(function(d) { return d.price; })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(70)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data);

  // Y axis: scale and draw:
  var y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  svg.append("g")
      .call(d3.axisLeft(y));
           // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
  // Its opacity is set to 0: we don't see it by default.
  var tooltip = d3.select("#my_dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "black")
  .style("color", "white")
  .style("border-radius", "5px")
  .style("padding", "10px")

// A function that change this tooltip when the user hover a point.
// Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
 var showTooltip = function(d) {
  tooltip
    .transition()
    .duration(100)
    .style("opacity", 1)
  tooltip
    .html("Range: " + d.x0 + " - " + d.x1)
    .style("left", (d3.mouse(this)[0]+20) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
}
 var moveTooltip = function(d) {
    tooltip
    .style("left", (d3.mouse(this)[0]+20) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
  }
  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(100)
      .style("opacity", 0)
  }

  // append the bar rectangles to the svg element
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2")
        // Show tooltip on hover
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )

});*/



// set the dimensions and margins of the graph
var margin = { top: 10, right: 200, bottom: 70, left: 70 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1050 800")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

/*********************
 * X AXIS
 *********************/
var x = d3.scaleLinear()
    .domain([2010, 2020])
    .range([0, width]);
var xaxis = d3.axisBottom(x)
svg.append("g")
    .attr("class", "axis")
    .attr("class", "Xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);

// text label for the x axis
svg.append("text")
    .attr("class", "axisText")
    .attr("transform",
        "translate(" + (width / 2) + " ," +
        (height + margin.top + 30) + ")")
    .style("text-anchor", "middle")
    .text("Year");

/*********************
 * Y AXIS
 *********************/
var y = d3.scaleLinear()
    .domain([0, 70])
    .range([height, 0]);
var yaxis = d3.axisLeft(y)
svg.append("g")
    .attr("class", "axis")
    .attr("class", "Yaxis")
    .call(yaxis);

// text label for the y axis
svg.append("text")
    .attr("class", "axisText")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Suicides per 100,000 people");

/*********************
 * GRIDLINES
 *********************/
// gridlines in x axis function
function make_x_gridlines() {
    return d3.axisBottom(x)
        .ticks(10)
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(y)
        .ticks(10)
}

// add the X gridlines
svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    )

// add the Y gridlines
svg.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    )

//Legend for Categories


var Svg = d3.select("#my_dataviz2")
var size = 20

// create a list of keys
var keys = ["United States", "Mexico", "Canada"]

// Usually you have a color scale in your chart already
var color = d3.scaleOrdinal()
  .domain(keys)
  .range(d3.schemeSet1);

// Add one dot in the legend for each name.
Svg.selectAll("mydots")
  .data(keys)
  .enter()
  .append("circle")
    .attr("cx", 100)
    .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
Svg.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 120)
    .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

    var country = "United States" //change
    var firstRun = true; //change
/***************** */
function setupSVG() {
    document.getElementById("my_dataviz").setAttribute("current-country", country);
    

    async function loadAllData() {
        const data = await d3.csv("https://raw.githubusercontent.com/cesiabulnes/DataViz/master/API_SH/Spercountryperyear.csv");
        console.log(data);
        console.log(typeof data);
        loadPageData(data);
        getDataAttr(data)
    }

    /*function sortData(data) {

        // Sort based on the 2005 urban % values
        let data2000 = data.filter(function (d) {
            return d.Year == "2000";
        });

        // sort the data going from least densily populated urban center to most (2005)
        data2000 = data2000.sort(function mysortfunction(a, b) {
            var x = a['Year'];
            var y = b['Year'];

            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        })

        // Extract just the Country info from the object
        var data2000sorted = data2000.map(function (value, index) { return value['Country Name']; });

        // Function sorts an object based on a given order
        function mapOrder(array, order, key) {

            array.sort(function (a, b) {
                var A = a[key],
                    B = b[key];

                if (order.indexOf(A) > order.indexOf(B)) {
                    return 1;
                } else {
                    return -1;
                }
            });

            return array;
        };*/

        //data = mapOrder(data, data2000sorted, 'Country Name');
        //return data;
    //}
    function getDataAttr(data){
        let first_country = data.filter(function (d) {
            return d.CountryName == "United States";
        });
        console.log('HERE')
        console.log(first_country)

    }
    function loadPageData(data) {

        let yearData = data.filter(function (d) {
            return d.Year == document.getElementById("my_dataviz").getAttribute("current-year");
        });

        if (firstRun) {
            plotInitData(yearData)

            firstRun = false
        } else {
            plotDataWithTransitions(yearData)
        }
    }
    function plotInitData(yearData) {

        //addAnnotations();

        svg
            .selectAll("dataCircles")
            .data(yearData)
            .enter()
            .append("circle")
            .attr("class", "dataCircles")

            .attr("cx", function (d) { return x(parseFloat(d['Year'])); })
            .attr("cy", function (d) { return y(parseFloat(d['Suicides per 100,000 people'])); })

            .style("fill", "none")
            .style("stroke-width", 2) // set the stroke width
            //.style("stroke", function (d) { return color(d['Region']) })

    }
loadAllData();
}