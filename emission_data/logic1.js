// Define SVG area dimensions
var svgWidth = 1180;
var svgHeight = 900;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 30
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

  var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// an example filters object
d3.csv("flattened_emission_data.csv").then(function(csvdata) {
    console.log(csvdata)
    csvdata = csvdata.filter(function(row) {
        // return row['Year'] == '1990' || row['Year'] == '2018';
        return row['Year'] == '2018';
    })
    console.log(csvdata)

// Configure a band scale for the horizontal axis with a padding of 0.1 (10%)
var xBandScale = d3.scaleBand()*2
.domain(csvdata.map(d => d.State))
.range([0, chartWidth])
.padding(0.1);

// Create a linear scale for the vertical axis.
var yLinearScale = d3.scaleLinear()
.domain([0, d3.max(csvdata, d => d.emission_value)])
.range([chartHeight, 0]);

// Create two new functions passing our scales in as arguments
// These will be used to create the chart's axes
var bottomAxis = d3.axisBottom(xBandScale);
var leftAxis = d3.axisLeft(yLinearScale).ticks(10);

// Append two SVG group elements to the chartGroup area,
// and create the bottom and left axes inside of them
chartGroup.append("g")
.call(leftAxis);

chartGroup.append("g")
.attr("transform", `translate(0, ${chartHeight})`)
.call(bottomAxis);

// Create one SVG rectangle per piece of tvData
// Use the linear and band scales to position each rectangle within the chart
chartGroup.selectAll(".bar")
.data(csvdata)
.enter()
.append("rect")
.attr("class", "bar")
.attr("x", d => xBandScale(d.State))
.attr("y", d => yLinearScale(d.emission_value))
.attr("width", xBandScale.bandwidth())
.attr("height", d => chartHeight - yLinearScale(d.emission_value));

}).catch(function(error) {
    console.log(error);

})