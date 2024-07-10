function gaugeChart() {
  var margin = {top: 0, right: 65, bottom: 10, left: 65},
      width = 250,
      height = 150,
      arcMin = -Math.PI/2,
      arcMax = Math.PI/2,
      innerRadius = 60,
      outerRadius = 80,
      dataDomain = [0, 100],  // This will be dynamically set
      labelPad = 10,
      dataValue = function(d) { return +d; },
      colorScale = d3.scaleLinear(),
      arcScale = d3.scaleLinear(),
      colorOptions = ["#d7191c", "#efef5d", "#1a9641"],
      arc = d3.arc();

  function chart(selection) {
    selection.each(function(data) {
      var capacity = data[1];  // second value is capacity
      data = data.map(function(d) { return dataValue(d); });
      arcScale = d3.scaleLinear().domain([0, capacity]).range([arcMin, arcMax]);
      colorScale = d3.scaleLinear().domain([0, capacity]).range(colorOptions);
      arc = d3.arc().innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(arcMin);

      var svg = d3.select(this).selectAll("svg").data([data]);

      var gEnter = svg.enter().append("svg").append("g");
      var arcGEnter = gEnter.append("g").attr("class", "arc");
      arcGEnter.append("path").attr("class", "bg-arc");
      arcGEnter.append("path").attr("class", "data-arc")
        .datum({endAngle: arcMin, startAngle: arcMin, score: data[0]})
        .attr("d", arc)
        .style("fill", colorScale(data[0]))
        .each(function(d) { this._current = d; });
      arcGEnter.append("text").attr("class", "arc-label");
      arcGEnter.append("text").attr("class", "min-label");
      arcGEnter.append("text").attr("class", "max-label");

      arcGEnter.selectAll(".lines").data(arcScale.ticks(5).map(function(d) {
        return { score: d };
      })).enter()
        .append("path")
          .attr("class", "lines");
      arcGEnter.selectAll(".ticks").data(arcScale.ticks(5))
        .enter().append("text")
          .attr("class", "ticks");

      var svg = selection.select("svg");
      svg.attr("width", width).attr("height", height);

      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var arcG = svg.select("g.arc")
        .attr("transform", "translate(" +
          ((width - margin.left - margin.right) / 2) + "," +
          ((height * (2 / 3)) + ")"));

      svg.select("g.arc .bg-arc")
        .datum({endAngle: arcMax})
        .style("fill", "#ddd")
        .attr("d", arc);

      function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      }

      var dataArc = svg.select("g.arc .data-arc")
        .datum({score: data[0], startAngle: arcMin, endAngle: arcScale(data[0])})
          .transition()
          .duration(750)
            .style("fill", function(d) { return colorScale(d.score); })
            .style("opacity", function(d) { return d.score < 0 ? 0 : 1; })
            .attrTween("d", arcTween);

      var arcBox = svg.select("g.arc .bg-arc").node().getBBox();
      svg.select("text.arc-label")
        .datum({score: data[0]})
        .attr("x", (arcBox.width / 2) + arcBox.x)
        .attr("y", -15)
        .style("alignment-baseline", "central")
        .style("text-anchor", "middle")
        .style("font-size", "30px")
        .text(function(d) { return d3.format(".0f")(d.score); });

      svg.select("text.min-label")
        .datum({score: 0})
        .attr("x", arcBox.x)
        .attr("y", arcBox.y + arcBox.height + 20)
        .style("alignment-baseline", "central")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text(function(d) { return `${d3.format(".0f")(d.score)}`; });

      svg.select("text.max-label")
        .datum({score: capacity})
        .attr("x", arcBox.x + arcBox.width)
        .attr("y", arcBox.y + arcBox.height + 20)
        .style("alignment-baseline", "central")
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .text(function(d) { return `${d3.format(".0f")(d.score)} MLD`; });

      var markerLine = d3.radialLine()
        .angle(function(d) { return arcScale(d); })
        .radius(function(d, i) {
          return innerRadius + ((i % 2) * ((outerRadius - innerRadius)));
        });

    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.innerRadius = function(_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return chart;
  };

  chart.outerRadius = function(_) {
    if (!arguments.length) return outerRadius;
    outerRadius = _;
    return chart;
  };

  chart.dataDomain = function(_) {
    if (!arguments.length) return dataDomain;
    dataDomain = _;
    return chart;
  };

  chart.colorOptions = function(_) {
    if (!arguments.length) return colorOptions;
    colorOptions = _;
    return chart;
  };

  chart.labelPad = function(_) {
    if (!arguments.length) return labelPad;
    labelPad = _;
    return chart;
  };

  return chart;
}
