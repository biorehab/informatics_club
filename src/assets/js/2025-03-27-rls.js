
// Data realted variables.
const xLims = [-5, 5];
const yLims = [-50, 50];
const noise = d3.randomNormal(0, 5);

// SVG plotting related variables.
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
margin = { top: 20, right: 20, bottom: 20, left: 20 };
// margin = { top: 0, right: 0, bottom: 0, left: 0 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const xPolyPointsDisp = d3.range(xLims[0], xLims[1], 0.01);
let yTruePolyPoints = null;

// Define the clip path for the SVG plot.
svg.append("defs")
   .append("clipPath")
   .attr("id", "plot-clip")
   .append("rect")
   .attr("x", margin.left)
   .attr("y", margin.top)
   .attr("width", plotWidth - margin.left)
   .attr("height", plotHeight - margin.top);

// Group
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const xScale = d3.scaleLinear()
                 .domain(xLims)
                 .range([margin.left, plotWidth]); // Adjusts dynamically
const yScale = d3.scaleLinear()
                 .domain(yLims)
                 .range([plotHeight, margin.top]); // Adjusts dynamically

// X Axis
g.append("g")
 .attr("transform", `translate(0, ${yScale(0)})`) // Place x-axis at bottom
 .attr("class", "x-axis")
 .call(d3.axisBottom(xScale).tickFormat(d => (d === 0 ? "" : d))) // Hide 0 label
 .selectAll("text") // Select all tick labels
 .style("font-size", "8px")  // Set font size
 .style("font-family", "Inter")  // Set font type
 .style("fill", "gray");  // Set text color to light gray

// Set axis line and ticks to light gray
g.selectAll(".x-axis path, .x-axis line")
 .style("stroke", "gray");

// Y Axis
g.append("g")
 .attr("transform", `translate(${xScale(0)}, 0)`)
 .attr("class", "y-axis")
 .call(d3.axisLeft(yScale).tickFormat(d => (d === 0 ? "" : d))) // Hide 0 label
 .call(d3.axisLeft(yScale)) // Hide 0 label
 .selectAll("text") // Select all tick labels
 .style("font-size", "8px")  // Set font size
 .style("font-family", "Inter")  // Set font type
 .style("fill", "gray");  // Set text color to light gray

// Set axis line and ticks to light gray
g.selectAll(".y-axis path, .y-axis line")
 .style("stroke", "gray");

 
// Path for the estimated polynomial
const estPolyPath = g.append("path")
                     .attr("fill", "none")
                     .attr("stroke", "red")
                     .attr("stroke-width", 1.5);
 
// Path for the true polynomial
const truePolyPath = g.append("path")
                      .attr("fill", "none")
                      .attr("stroke", "black")
                      .attr("stroke-width", 1)
                      .attr("stroke-opacity", 1);

// Legend
const legend = g.append("g")
                .attr("transform", `translate(20, 10)`); // Position legend

function randomPolynomial() {
    return [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
}

function generatePoints(n) {
    const _xrange = xLims[1] - xLims[0];

    // Generate n random x values
    const xs = Array.from({ length: n }, () => Math.random() * _xrange + xLims[0]);
    console.log(xs);
    // Loop over xs to compute corresponding y values
    xs.forEach(x => {
        const y = trueTheta[3] + trueTheta[2] * x + trueTheta[1] * x**2 + trueTheta[0] * x**3 + noise();
        
        // Store in respective arrays
        data.push({ x, y });
        X.push([x**3, x**2, x, 1]);
        Y.push(y);
    });
}

// Function to Draw Scatter Plot
function drawScatterPlot() {
    // Bind data to circles
    const dots = g.selectAll("circle").data(data);

    // Enter new elements
    dots.enter()
        .append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 4)
        .style("fill", "steelblue")
        .style("opacity", 0.7)  // Set opacity here
        .merge(dots) // Update existing elements
        .transition().duration(500)
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y));

    // Remove old elements
    dots.exit().remove();
}

function fitLS(X, Y) {
    console.log(X);
    console.log(Y);
    let XTX = math.multiply(math.transpose(X), X);
    console.log(XTX);
    let XTY = math.multiply(math.transpose(X), Y);
    console.log(XTY);
    return math.lusolve(XTX, XTY).map(v => v[0]);
}

function generatePolyPoints(theta) {
    return xPolyPointsDisp.map(x => theta[3] + theta[2] * x + theta[1] * x**2 + theta[0] * x**3);
}

function drawTruePolynomial() {
    // Get the y values for the true polynomial
    yTruePolyPoints = generatePolyPoints(trueTheta);
    
    // Update the true polynomial path
    truePolyPath.datum(d3.zip(xPolyPointsDisp, yTruePolyPoints))
                .attr("d", d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])));
    
    // Apply the clip path to the polynomial paths
    truePolyPath.attr("clip-path", "url(#plot-clip)");
}

function drawEstimatedPolynomial() {
    // Get the y values for the true polynomial
    const yPolyPoints = generatePolyPoints(estTheta);
    
    // Update the true polynomial path
    estPolyPath.datum(d3.zip(xPolyPointsDisp, yPolyPoints))
               .attr("d", d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])));
    
    // Apply the clip path to the polynomial paths
    estPolyPath.attr("clip-path", "url(#plot-clip)");
}

// Initialize the data and the model.
let data = [];
let X = [], Y = [];

// True polynomial coefficients
let trueTheta = randomPolynomial();
let estTheta = [0, 0, 0, 0];

// Generate the initial random points to start with.
generatePoints(5);

// Fit the initial model to the data.
estTheta = fitLS(X, Y);

// Draw the data points.
drawScatterPlot();

// Draw the true polynomial
drawTruePolynomial();

// Draw the estimated polynomial.
drawEstimatedPolynomial();

// // Now let's attach callbacks to the buttons.
// document.getElementById("add-data").addEventListener("click", () => {
//     generatePoints(1);
//     estTheta = fitLS(X, Y);
//     drawEstimatedPolynomial();
// });
// document.getElementById("reset").addEventListener("click", () => {
//     data = [];
//     X = [];
//     Y = [];
//     trueTheta = randomPolynomial();
//     generatePoints(5);
//     estTheta = fitLS(X, Y);
//     drawTruePolynomial();
//     drawEstimatedPolynomial();
// });