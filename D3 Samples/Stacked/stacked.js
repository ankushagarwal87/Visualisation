var n = 3, // number of layers
    m = 4, // number of samples per layer
    stack = d3.stack(),
    data = extractData();
	
console.log(data);

var dates = extractDate();
var parseDate = d3.timeParse("%m/%d/%y");
dates.forEach(function(d) { 
    d.date = parseDate(d.date);
});
	
console.log(dates);
console.log(d3.extent(dates, d => d.date));

var formatPercent = d3.format(".0%");
var formatNumber = d3.format("");
	
// transpose data
data = data[0].map(function(col, i) { 
    return data.map(function(row) { 
        return row[i] 
    })
});

	
var layers = stack.keys(d3.range(n))(data),
    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d[1]; }); }),
    yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d[1] - d[0]; }); });


var margin = {top: 40, right: 10, bottom: 20, left: 35},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .domain(d3.range(m))
    .rangeRound([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleLinear()
    .domain([0, yStackMax])
    .rangeRound([height, 0]);

var color = d3.scaleLinear()
    .domain([0, n - 1])
    .range(["#aad", "#556"]);

var xScale = d3.scaleTime()
    .domain(d3.extent(dates, d => d.date))
    .rangeRound([0, width]);

var xAxis = d3.axisBottom(xScale).ticks(7);

var yAxis = d3.axisLeft()
    .scale(y)
    .tickSize(2)
    .tickPadding(6);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var layer = svg.selectAll(".layer")
    .data(layers)
  .enter().append("g")
    .attr("class", "layer")
    .attr("id", function(d) { return d.key; })
    .style("fill", function(d, i) { return color(i); });

var rect = layer.selectAll("rect")
    .data(function(d) { return d; })
  .enter().append("rect")
    .attr("x", function(d, i) { return x(i); })
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0);

rect.transition()
    .delay(function(d, i) {return i * 10; })
    .attr("y", function(d) { return y(d[1]); })
    .attr("height", function(d) { return y(d[0]) - y(d[1]); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + 0 + ",0)")
    .style("font-size", "10px")
    .call(yAxis);

d3.selectAll("input").on("change", change);

var timeout = setTimeout(function() {
    d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
    setTimeout(function() {
        d3.select("input[value=\"percent\"]").property("checked", true).each(change);
    }, 2000);
}, 2000);

function change() {
    clearTimeout(timeout);
    if (this.value === "grouped") transitionGrouped();
    else if (this.value === "stacked") transitionStacked();
    else if (this.value === "percent") transitionPercent();

}

function transitionGrouped() {
    y.domain([0, yGroupMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("x", function(d, i, j) { return x(i) + x.bandwidth() / n * parseInt(this.parentNode.id); })
        .attr("width", x.bandwidth() / n)
    .transition()
        .attr("y", function(d) { return height - (y(d[0]) - y(d[1])); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); });

    yAxis.tickFormat(formatNumber)
    svg.selectAll(".y.axis").transition()
        .delay(500)
        .duration(500)
        .call(yAxis)
}

function transitionStacked() {
    y.domain([0, yStackMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    .transition()
        .attr("x", function(d, i) { return x(i); })
        .attr("width", x.bandwidth());

    yAxis.tickFormat(formatNumber)
    svg.selectAll(".y.axis").transition()
        .delay(500)
        .duration(500)
        .call(yAxis)

}

function transitionPercent() {
    y.domain([0, 1]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { 
            var total = d3.sum(d3.values(d.data)); 
            return y(d[1] / total); })
        .attr("height", function(d) { 
            var total = d3.sum(d3.values(d.data));
            return y(d[0] / total) - y(d[1] / total); })
    .transition()
        .attr("x", function(d, i) { return x(i); })
        .attr("width", x.bandwidth());

    yAxis.tickFormat(formatPercent)

    svg.selectAll(".y.axis").transition()
        .delay(500)
        .duration(500)
        .call(yAxis)

}

function extractData(){

var data = [
	[1,1,2,3],
	[4,5,6,7],
	[8,5,5,4]
];	
return data;
}

function extractDate(){

var dates = [{'date':'12/07/18'},{'date':'12/08/18'},{'date':'12/09/18'},{'date':'12/10/18'}];
return dates;
}
