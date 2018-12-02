function transition(name) {
	if (name === "national") {
		// Script 1
// Data Visualization III - Pie Chart

var donut = donutChart()
        .width(960)
        .height(450)
        .cornerRadius(0) // sets how rounded the corners are on each slice
        .padAngle(0.005) // effectively dictates the gap between slices
        .variable('Percent')
        .category('Education Level');

    d3.tsv('assets/data/species.tsv', function(error, data) {
        if (error) throw error;
        d3.select('#pie-chart')
            .datum(data) // bind data to the div
            .call(donut); // draw chart in div
    });

function donutChart() {
    var width,
        height,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        colour = d3.scaleOrdinal().range(["#E12929", "#D9E129", "#a1d8c8", "#29E1AC", "#29ACE1", "#2C29E1", "#E12999"]), // colour scheme
        variable, // value in data that will dictate proportions on chart
        category, // compare data by
        padAngle, // effectively dictates the gap between slices
        floatFormat = d3.format('.4r'),
        cornerRadius, // sets how rounded the corners are on each slice
        percentFormat = d3.format(',.1%');

    function chart(selection){
        selection.each(function(data) {
            // generate chart

            // ===========================================================================================
            // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
            var radius = Math.min(width, height) / 2;

            // creates a new pie generator
            var pie = d3.pie()
                .value(function(d) { return floatFormat(d[variable]); })
                .sort(null);

            // contructs and arc generator. This will be used for the donut. The difference between outer and inner
            // radius will dictate the thickness of the donut
            var arc = d3.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.6)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle);

            // this arc is used for aligning the text labels
            var outerArc = d3.arc()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.9);
            // ===========================================================================================

            // ===========================================================================================
            // append the pieChartSVG object to the selection
            var pieChartSVG = selection
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
            // ===========================================================================================

            // ===========================================================================================
            // g elements to keep elements within svg modular
            pieChartSVG.append('g').attr('class', 'slices');
            pieChartSVG.append('g').attr('class', 'labelName');
            pieChartSVG.append('g').attr('class', 'lines');
            // ===========================================================================================

            // ===========================================================================================
            // add and colour the donut slices
            var path = pieChartSVG.select('.slices')
                .datum(data).selectAll('path')
                .data(pie)
              .enter().append('path')
                .attr('fill', function(d) { return colour(d.data[category]); })
                .attr('d', arc);
            // ===========================================================================================

            // ===========================================================================================
            // add text labels
            var label = pieChartSVG.select('.labelName').selectAll('text')
                .data(pie)
              .enter().append('text')
                .attr('dy', '.35em')
                .html(function(d) {
                    // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
                    return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
                })
                .attr('transform', function(d) {

                    // effectively computes the centre of the slice.
                    // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                    var pos = outerArc.centroid(d);

                    // changes the point to be on left or right depending on where label is.
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                })
                .style('text-anchor', function(d) {
                    // if slice centre is on the left, anchor text to start, otherwise anchor to end
                    return (midAngle(d)) < Math.PI ? 'start' : 'end';
                });
            // ===========================================================================================

            // ===========================================================================================
            // add lines connecting labels to slice. A polyline creates straight lines connecting several points
            var polyline = pieChartSVG.select('.lines')
                .selectAll('polyline')
                .data(pie)
              .enter().append('polyline')
                .attr('points', function(d) {

                    // see label transform function for explanations of these three lines.
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos]
                });
            // ===========================================================================================

            // ===========================================================================================
            // add tooltip to mouse events on slices and labels
            d3.selectAll('.labelName text, .slices path').call(toolTip);
            // ===========================================================================================

            // ===========================================================================================
            // Functions

            // calculates the angle for the middle of a slice
            function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

            // function that creates and adds the tool tip to a selected element
            function toolTip(selection) {

                // add tooltip (svg circle element) when mouse enters label or slice
                selection.on('mouseenter', function (data) {

                    pieChartSVG.append('text')
                        .attr('class', 'toolCircle')
                        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                        .html(toolTipHTML(data)) // add text to the circle.
                        .style('font-size', '.9em')
                        .style('text-anchor', 'middle'); // centres text in tooltip

                    pieChartSVG.append('circle')
                        .attr('class', 'toolCircle')
                        .attr('r', radius * 0.55) // radius of tooltip circle
                        .style('fill', colour(data.data[category])) // colour based on category mouse is over
                        .style('fill-opacity', 0.35);

                });

                // remove the tooltip when mouse leaves the slice/label
                selection.on('mouseout', function () {
                    d3.selectAll('.toolCircle').remove();
                });
            }

            // function to create the HTML string for the tool tip. Loops through each key in data object
            // and returns the html string key: value
            function toolTipHTML(data) {

                var tip = '',
                    i   = 0;

                for (var key in data.data) {
                    console.log(key, data.data);
                    // if value is a number, format it as a percentage
                    var value = key == "Percent" ? percentFormat(data.data[key]) : data.data[key];

                    // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
                    // tspan effectively imitates a line break.
                    if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
                    else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
                    i++;
                }

                return tip;
            }
            // ===========================================================================================

        });
    }

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.radius = function(value) {
        if (!arguments.length) return radius;
        radius = value;
        return chart;
    };

    chart.padAngle = function(value) {
        if (!arguments.length) return padAngle;
        padAngle = value;
        return chart;
    };

    chart.cornerRadius = function(value) {
        if (!arguments.length) return cornerRadius;
        cornerRadius = value;
        return chart;
    };

    chart.colour = function(value) {
        if (!arguments.length) return colour;
        colour = value;
        return chart;
    };

    chart.variable = function(value) {
        if (!arguments.length) return variable;
        variable = value;
        return chart;
    };

    chart.category = function(value) {
        if (!arguments.length) return category;
        category = value;
        return chart;
    };

    return chart;
}
	}
	if (name === "regional") {
		var el_id = 'chart';
var treeSumSortType = "number";

var obj = document.getElementById(el_id);

var divWidth = obj.offsetWidth;

var margin = {top: 30, right: 0, bottom: 20, left: 0},
    width = divWidth,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(","),
    transitioning;

var color = d3.scaleLinear().domain([0, 1/4*5000000, 2/4*5000000, 3/4*5000000, 5000000]).range(["#E12929", "#E13D29", "#E15029", "#E15B29"]);

// sets x and y scale to determine size of visible boxes
var x = d3.scaleLinear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, height])
    .range([0, height]);

var treemap = d3.treemap()
        .size([width, height])
        .paddingInner(0)
        .round(false);

var svg = d3.select('#'+el_id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top)
        .attr("fill", '#FF9B42');

    grandparent.append("text")
        .attr("x", 10)
        .attr("y", 10 - margin.top)
        .attr("dy", ".75em");

d3.json("assets/data/us.json", function(data) {
    var root = d3.hierarchy(data);

    treemap(root
        .sum(function (d) {
            if (treeSumSortType == "number") {
                return d["Total College"];
            } else {
                return d["Percent College"];
            }

        })
        .sort(function (a, b) {
            if (treeSumSortType == "number") {
                return b.height - a.height || b["Total College"] - a["Total College"];
            } else {
               return b.height - a.height || b["Percent College"] - a["Percent College"]
            }

        })
    );

    display(root);

    function display(d) {
        // write text into grandparent
        // and activate click's handler
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d));
        // grandparent color
        grandparent
            .datum(d.parent)
            .select("rect")
            .attr("fill", function () {
                return '#f7af72'
            });
        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");
        var g = g1.selectAll("g")
            .data(d.children)
            .enter().
            append("g");
        // add class and click handler to all g's with children
        g.filter(function (d) {
            return d.children;
        })
            .classed("children", true)
            .on("click", transition);
        g.selectAll(".child")
            .data(function (d) {
                return d.children || [d];
            })
            .enter().append("rect")
            .attr("class", "child")
            .call(rect);
        // add title to parents
        g.append("rect")
            .attr("class", "parent")
            .call(rect)
            .append("title")
            .text(function (d){
                return d.data.name;
            });
        /* Adding a foreign object instead of a text object, allows for text wrapping */
        g.append("foreignObject")
            .call(rect)
            .attr("class", "foreignobj")
            .append("xhtml:div")
            .attr("dy", ".75em")
            .html(function (d) {
                var html = '' +
                    '<p class="title"> ' + d.data.name + '</p>' +
                    '<p class="value">' + formatNumber(d.value) + '</p>';

                return html;
            })
            .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS
        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;
            var g2 = display(d),
                t1 = g1.transition().duration(650),
                t2 = g2.transition().duration(650);
            // Update the domain only after entering new elements.
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);
            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);
            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function (a, b) {
                return a.depth - b.depth;
            });
            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);
            g2.selectAll("foreignObject div").style("display", "none");
            /*added*/
            // Transition to the new view.
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);
            /* Foreign object */
            t1.selectAll(".textdiv").style("display", "none");
            /* added */
            t1.selectAll(".foreignobj").call(foreign);
            /* added */
            t2.selectAll(".textdiv").style("display", "block");
            /* added */
            t2.selectAll(".foreignobj").call(foreign);
            /* added */
            // Remove the old node when the transition is finished.
            t1.on("end.remove", function(){
                this.remove();
                transitioning = false;
            });
        }

        document.forms[0].addEventListener("change", function() {
            treeSumSortType = document.forms[0].elements["treeSum"].value;
            treemap(root
            .sum(function (d) {
                if (treeSumSortType == "number") {
                    color = d3.scaleLinear().domain([0, 1/4*5000000, 2/4*5000000, 3/4*5000000, 5000000]).range(["#E12929", "#E13D29", "#E15029", "#E15B29"]);
                    return d["Total College"];
                } else if (treeSumSortType == "percent") {
                    color = d3.scaleLinear().domain([0, 1/4*50, 2/4*50, 3/4*50, 50]).range(["#E1E129", "#D3E129", "#CBE129", "#B4E129"]);
                    return d["Percent College"];
                } else if (treeSumSortType == "male") {
                    color = d3.scaleLinear().domain([0, 1/4*50, 2/4*50, 3/4*50, 50]).range(["#6FE129", "#56E129", "#37E129", "#29E13A"]);
                    return d["Percent College - Male"];
                } else {
                    color = d3.scaleLinear().domain([0, 1/4*50, 2/4*50, 3/4*50, 50]).range(["#29BAE1", "#29A1E1", "#2982E1", "#2964E1"]);
                    return d["Percent College - Female"];
                }

            })
            .sort(function (a, b) {
                if (treeSumSortType == "number") {
                    return b.height - a.height || b["Total College"] - a["Total College"];
                } else if (treeSumSortType == "percent") {
                    return b.height - a.height || b["Percent College"] - a["Percent College"];
                } else if (treeSumSortType == "male") {
                    return b.height - a.height || b["Percent College - Male"] - a["Percent College - Male"]
                } else {
                    return b.height - a.height || b["Percent College - Female"] - a["Percent College - Female"]
                }

            })
        );

        display(root);
        });

        return g;
    }

    function text(text) {
        text.attr("x", function (d) {
            return x(d.x) + 6;
        })
            .attr("y", function (d) {
                return y(d.y) + 6;
            });
    }

    function rect(rect) {
        rect
            .attr("x", function (d) {
                return x(d.x0);
            })
            .attr("y", function (d) {
                return y(d.y0);
            })
            .attr("width", function (d) {
                return x(d.x1) - x(d.x0);
            })
            .attr("height", function (d) {
                return y(d.y1) - y(d.y0);
            })
            .attr("fill", function(d) { return color(d.value); });
    }

    function foreign(foreign) { /* added */
        foreign
            .attr("x", function (d) {
                return x(d.x0);
            })
            .attr("y", function (d) {
                return y(d.y0);
            })
            .attr("width", function (d) {
                return x(d.x1) - x(d.x0);
            })
            .attr("height", function (d) {
                return y(d.y1) - y(d.y0);
            });
    }

    function name(d) {
        return breadcrumbs(d) +
            (d.parent
            ? " -  Click To Zoom Out"
            : " - Click a Region to Inspect States");
    }

    function breadcrumbs(d) {
        var res = "";
        var sep = " > ";
        d.ancestors().reverse().forEach(function(i){
            res += i.data.name + sep;
        });
        return res
            .split(sep)
            .filter(function(i){
                return i!== "";
            })
            .join(sep);
    }
});
	}
	if (name === "state-level") {
		// Script 3
// Data Visualization III - Stacked Bar Chart

var margin = {top: 10, right: 231, bottom: 90, left: 236},
	width = .97*window.innerWidth - margin.left - margin.right,
	height = Math.min(700, window.innerHeight*.9) - margin.top - margin.bottom;

var xscale = d3.scaleBand()
                .range([0, width]);

var yscale = d3.scaleLinear()
	           .range([height, 0]);

var colors = d3.scaleOrdinal()
//    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
//    .range(["#177E89", "#0a5971", "#0f436f", "#444b80", "#664d83", "#95457c", "#9a295d"]);
//.range(["#0a5971", "#177E89", "#4b8e77", "#a9ad70", "#ccb221", "#cb8b25", "#DB3A34"]);
//.range(["#ef9999", "#e8b9ae", "#d8cdb3", "#90afa2", "#6f94a3", "#607495", "#4e5684"]);
//.range(["#0FA3B1", "#73c3bf", "#a1d8c8", "#cbe0a7", "#f2db84", "#f7af72", "#FF9B42"]);
  .range(["hsl(190, 69%, 65%)", "hsl(177, 69%, 65%)", "hsl(144, 69%, 65%)", "hsl(100, 69%, 65%)", "hsl(47, 69%, 65%)", "hsl(28, 69%, 65%)", "hsl(28, 69%, 65%)"]);


var xaxis = d3.axisBottom(xscale);

var yaxis = d3.axisLeft(yscale)
	           .tickFormat(d3.format(".0%")); // **

var stackedBarSVG = d3.select("#stacked-bar-chart")
    .attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load and handle the data
d3.tsv("assets/data/data.tsv", function(error, data) {

	// rotate the data
	var categories = d3.keys(data[0]).filter(function(key) { return key !== "state" && key !== "National"; });
	var parsedata = categories.map(function(name) { return { "state": name }; });
	data.forEach(function(d) {
		parsedata.forEach(function(pd) {
			pd[d["state"]] = d[pd["state"]];
		});
	});

	// map column headers to colors (except for 'state' and 'Base: All Respondents')
	colors.domain(d3.keys(parsedata[0]).filter(function(key) { return key !== "state" && key !== "Base: All Respondents"; }));

	// add a 'responses' parameter to each row that has the height percentage values for each rect
	parsedata.forEach(function(pd) {
		var y0 = 0;
		// colors.domain() is an array of the column headers (text)
		// pd.responses will be an array of objects with the column header
		// and the range of values it represents
		pd.responses = colors.domain().map(function(response) {
			var responseobj = {response: response, y0: y0, yp0: y0};
			y0 += +pd[response];
			responseobj.y1 = y0;
			responseobj.yp1 = y0;
			return responseobj;
		});
		// y0 is now the sum of all the values in the row for this category
		// convert the range values to percentages
		pd.responses.forEach(function(d) { d.yp0 /= y0; d.yp1 /= y0; });
		// save the total
		pd.totalresponses = pd.responses[pd.responses.length - 1].y1;
	});

	// sort by the value in 'Right Direction'
	// parsedata.sort(function(a, b) { return b.responses[0].yp1 - a.responses[0].yp1; });

	// ordinal-ly map categories to x positions
	xscale.domain(parsedata.map(function(d) { return d.state; }));

	// add the x axis and rotate its labels
	stackedBarSVG.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xaxis)
		.selectAll("text")
		.attr("y", 5)
		.attr("x", 7)
		.attr("dy", ".35em")
		.attr("transform", "rotate(65)")
		.style("text-anchor", "start");

	// add the y axis
	stackedBarSVG.append("g")
		.attr("class", "y axis")
		.call(yaxis);

	// create stackedBarSVG groups ("g") and place them
	var category = stackedBarSVG.selectAll(".category")
		.data(parsedata)
		.enter().append("g")
		.attr("class", "category")
		.attr("transform", function(d) { return "translate(" + xscale(d.state) + ",0)"; });

	// draw the rects within the groups
	category.selectAll("rect")
		.data(function(d) { return d.responses; })
		.enter().append("rect")
		.attr("width", xscale.bandwidth())
		.attr("y", function(d) { return yscale(d.yp1); })
		.attr("height", function(d) { return yscale(d.yp0) - yscale(d.yp1); })
		.style("fill", function(d) { return colors(d.response); });

	// position the legend elements
	var legend = stackedBarSVG.selectAll(".legend")
		.data(colors.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(57," + ((height-422) - (i * 20)) + ")"; });

	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", colors);

	legend.append("text")
		.attr("x", width + 10)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.text(function(d) { return d; });

	// animation
	d3.selectAll("#stack-form input").on("change", handleFormClick);

	function handleFormClick() {
		if (this.value === "bypercent") {
			transitionPercent();
		} else {
			transitionCount();
		}
	}

	// transition to 'percent' presentation
	function transitionPercent() {
		// reset the yscale domain to default
		yscale.domain([0, 1]);

		// create the transition
		var trans = stackedBarSVG.transition().duration(250);

		// transition the bars
		var categories = trans.selectAll(".category");
		categories.selectAll("rect")
			.attr("y", function(d) { return yscale(d.yp1); })
			.attr("height", function(d) { return yscale(d.yp0) - yscale(d.yp1); });

		// change the y-axis
		// set the y axis tick format
		yaxis.tickFormat(d3.format(".0%"));
		stackedBarSVG.selectAll(".y.axis").call(yaxis);
	}

	// transition to 'count' presentation
	function transitionCount() {
		// set the yscale domain
		yscale.domain([0, d3.max(parsedata, function(d) { return d.totalresponses; })]);

		// create the transition
		var transone = stackedBarSVG.transition()
			.duration(250);

		// transition the bars (step one)
		var categoriesone = transone.selectAll(".category");
		categoriesone.selectAll("rect")
			.attr("y", function(d) { return this.getBBox().y + this.getBBox().height - (yscale(d.y0) - yscale(d.y1)) })
			.attr("height", function(d) { return yscale(d.y0) - yscale(d.y1); });

		// transition the bars (step two)
		var transtwo = transone.transition()
			.delay(350)
			.duration(350)
			.ease(d3.easeBounce);
		var categoriestwo = transtwo.selectAll(".category");
		categoriestwo.selectAll("rect")
			.attr("y", function(d) { return yscale(d.y1); });

		// change the y-axis
		// set the y axis tick format
		yaxis.tickFormat(d3.format(".2s"));
		stackedBarSVG.selectAll(".y.axis").call(yaxis);
	}
});

d3.select(self.frameElement).style("height", (height + margin.top + margin.bottom) + "px");
	}
	}
