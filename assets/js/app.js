var svgWidth = 790;
var svgHeight = 460;

var chartMargin = {
top: 30,
right: 30,
bottom: 100,
left: 100
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter")
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth);
// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
                    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

var chosenXAxis = "poverty" || "age" || "income";
var chosenYAxis = "obesity" || "smokes" || "healthcare";

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
                         .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,d3.max(data, d => d[chosenXAxis]) * 1.2])
                         .range([0, chartWidth]);
    return xLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
         .duration(1000)
         .call(bottomAxis);
    return xAxis;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
                         .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,d3.max(data, d => d[chosenYAxis]) * 1.2])
                         .range([chartHeight,0]);
    return yLinearScale;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
         .duration(1000)
         .call(leftAxis);
    return yAxis;
}

function renderCircles(data,circlesGroup, newXScale, chosenXAxis,newYScale, chosenYAxis) {
    newXScale = d3.scaleLinear()
                  .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,d3.max(data, d => d[chosenXAxis]) * 1.2])
                  .range([0, chartWidth]);
    newYScale = d3.scaleLinear()
                  .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,d3.max(data, d => d[chosenYAxis]) * 1.2])
                  .range([chartHeight,0]);
  
    circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

function renderText(data,textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    newXScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,d3.max(data, d => d[chosenXAxis]) * 1.2])
        .range([0, chartWidth]);
    newYScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,d3.max(data, d => d[chosenYAxis]) * 1.2])
        .range([chartHeight,0]);
    textGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]-6))
                .attr("cy", d => newYScale(d[chosenYAxis]+6));
    return textGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty (%):";
    }
    else if(chosenXAxis === "age") {
      var xlabel = "Age (Median):";
    }
    else if(chosenXAxis === "income") {
      var xlabel = "Household Income (Median):";
    }
    
    if (chosenYAxis === "obesity") {
        var ylabel = "Obesity (%):";
    }
    else if(chosenYAxis === "smokes") {
        var ylabel = "Smokes (%):";
    }
    else if(chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare (%):";
    }
    
    var toolTip = d3.tip()
                    .attr("class", "tooltip")
                    .offset([-8, 0])
                    .html(function(d) {
                        return (`${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
                    });

    circlesGroup.call(toolTip);
    circlesGroup.on('mouseover', function(d) { toolTip.show(d, this); })
                .on("mouseout", function(d) { toolTip.hide(d, this); });
    return circlesGroup;
}

d3.csv("data.csv").then(function(data) {
    data.forEach(function(d) {
        d.age = +d.age;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.poverty = +d.poverty;
        d.smokes = +d.smokes;
        d.income = +d.income;
    });

    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
   
    // var chart = chartGroup.append("g").data(data).enter();
    var circlesGroup = chartGroup.selectAll("circle")
                            .data(data)
                            .enter()
                            .append("circle")
                            .attr("cx", d => xLinearScale(d[chosenXAxis]))
                            .attr("cy",  d => yLinearScale(d[chosenYAxis]))
                            .attr("r",function(d) {
                                    return d.poverty;
                                 })
                            .style("opacity", 0.5)
                            .style("fill", function(d) {
                                    if ((d.poverty) >= d3.mean(data, d => d.poverty) ) { return "red"; }
                                    if ((d.poverty) < d3.mean(data, d => d.poverty) ) { return "green"; }
                                 })
                            .style("stroke", "grey");
    var textGroup = chartGroup.selectAll('text')
                                .data(data,function(d,i){return d + i;})
                                .enter()
                               .append("text")
                               .text(function(d) {
                                         return d.abbr;
                                 })
                               .attr("x", d => xLinearScale(d[chosenXAxis]))
                               .attr("y", d => yLinearScale(d[chosenYAxis]))
                               .attr("font-family", "sans-serif")
                               .attr("font-size", "11px")
                               .attr("fill", "black");
    console.log(data);
    var xlabelsGroup = chartGroup.append("g");
    var ylabelsGroup = chartGroup.append("g");

    var povertyLabel = xlabelsGroup.append("text")
                                 .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top +10})`)
                                 .attr("text-anchor", "middle")
                                 .attr("font-size", "16px")
                                 .attr("fill", "black")
                                 .attr("value", "poverty") 
                                 .classed("active", true)
                                 .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
                             .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top +30})`)
                             .attr("text-anchor", "middle")
                             .attr("font-size", "16px")
                             .attr("fill", "black")
                             .attr("value", "age") 
                             .classed("active", true)
                             .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
                                .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top +50})`)
                                .attr("text-anchor", "middle")
                                .attr("font-size", "16px")
                                .attr("fill", "black")
                                .attr("value", "income") 
                                .classed("active", true)
                                .text("Household Income (Median)");

    var healthcareLabel = ylabelsGroup.append("text")
                                    .text("Lacks Healthcare (%)")
                                    .attr("y", 0 - chartMargin.left + 40)
                                    .attr("x", 0 - (chartHeight / 2))
                                    .attr("dy", "1em")
                                    .attr("class", "axisText")
                                    .attr("transform", "rotate(-90)")
                                    .attr("value", "healthcare") 
                                    .classed("active", true)
                                    .style("text-anchor", "middle");

    var smokesLabel = ylabelsGroup.append("text")
                                .text("Smokes (%)")
                                .attr("y", 0 - chartMargin.left + 20)
                                .attr("x", 0 - (chartHeight / 2))
                                .attr("dy", "1em")
                                .attr("class", "axisText")
                                .attr("transform", "rotate(-90)")
                                .attr("value", "smokes") 
                                .classed("active", true)
                                .style("text-anchor", "middle");

    var obesityLabel = ylabelsGroup.append("text")
                                .text("Obesity (%)")
                                .attr("y", 0 - chartMargin.left)
                                .attr("x", 0 - (chartHeight / 2))
                                .attr("dy", "1em")
                                .attr("class", "axisText")
                                .attr("transform", "rotate(-90)")
                                .attr("value", "obesity") 
                                .classed("active", true)
                                .style("text-anchor", "middle");
    
    var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

    xlabelsGroup.selectAll("text")
                .on("click", function() {
                    var xValue = d3.select(this).attr("value");
                    console.log("xVal:",xValue);
                    chosenXAxis = xValue;
                    console.log("chosenX:",chosenXAxis);
                    xLinearScale = xScale(data, chosenXAxis);
                    xAxis = renderXAxes(xLinearScale, xAxis);
                    circlesGroup = renderCircles(circlesGroup, chosenXAxis,xLinearScale, chosenYAxis,yLinearScale);
                    textGroup = renderText(textGroup,chosenXAxis,xLinearScale,chosenYAxis,yLinearScale);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);     
                });

    ylabelsGroup.selectAll("text")
                .on("click", function() {
                    var yValue = d3.select(this).attr("value");
                    console.log("yVal:",yValue);
                    chosenYAxis = yValue;
                    console.log("chosenY:",chosenYAxis);
                    yLinearScale = yScale(data, chosenYAxis);
                    yAxis = renderYAxes(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, chosenXAxis,xLinearScale, chosenYAxis,yLinearScale);
                    textGroup = renderText(textGroup,chosenXAxis,xLinearScale,chosenYAxis,yLinearScale);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
                });                    

});



