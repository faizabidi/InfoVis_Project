// Global settings
var margin = {top: 10, right: 15, bottom: 10, left: 10};

var numofrows = 70;
var numofcols = 12;

var node_height = 30;
var node_height_scale = d3.scale.linear()
  .range([0,node_height]);

var window_width = $(".chart").width();
var window_height = numofrows*node_height;

var width = window_width-margin.left-margin.right;
var height = window_height-margin.top-margin.bottom;

var color = d3.scale.category20();
  
var units = "Books";
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; };

// totalcheckouts
var svg = d3.select("#checkouts").append("svg")
  .attr("width",window_width)
  .attr("height",window_height);

var canvas = svg.append("g")
    .attr("class","canvas")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(10)
    .nodePadding(window_height/numofrows)
    .size([width, height]);

var path = sankey.link();

//var mynodes = [{"name":"2005"},{"name":"2006"},{"name":"2007"},{"name":"2008"},{"name":"2009"},{"name":"2010"},{"name":"2011"},{"name":"2012"},{"name":"2013"},{"name":"2014"},{"name":"2015"}];

// load the data
d3.json("checkouts.json", function(error, graph){
  if (error) return console.warn(error);

  var nodeMap = {};
  graph.nodes.forEach(function(x) { 
    nodeMap[x.name] = x;
  });

  graph.links = graph.links.map(function(x) {
    var store_val = x.value;
    if (store_val >= 1){
      store_val = node_height_scale(x.value)
    }
    return {
      source: nodeMap[x.source],
      target: nodeMap[x.target],
      value: store_val
    };
  });

  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

  // add in the links
  var link_data = canvas.append("g")
      .attr("class","link-group")
      .selectAll(".link")
      .data(graph.links);

  var link = link_data.enter()
      .append("path")
      .on("mouseover",handleMouseover)
      .on("mouseout",handleMouseout)
    .filter(function(d){return d.value!=0.1 && d.value != 0.2;})
      .attr("class", function(d){
        return "link "+d.source.fundcode;
      })
      .attr("d", path)
      .style("stroke-width", function(d) { 
        if(d.value <= 1){
          return 0;
        }else{
          return Math.max(3, d.dy); 
        }
      })
      .sort(function(a, b) { return a.value - b.value; });
 
// add the link titles
  link.append("title")
        .text(function(d) {
        return d.source.name + " → " + 
                d.target.name + "\n" + format(d.value); });

  // Add the nodes
  var node_data = canvas.append("g")
      .attr("class","node-group")
      .selectAll(".node")
      .data(graph.nodes);

  var node = node_data.enter()
      .append("g")
        .attr("class", function (d) { return "node "+d.fundcode+" "+d.year;})
        .attr("transform", function(d) {
  
          return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() { 
          this.parentNode.appendChild(this); })
        .on("drag", dragmove))
      .sort(function(a,b){
        var yearb = parseInt(b.year);
        var yeara = parseInt(a.year);
        var vala = parseInt(a.value);
        var valb = parseInt(b.value);
        if (yearb == yeara){
          return valb-vala;
        }else{
          return yearb-yeara;
        }
      });

  // add the rectangles for the nodes
    node.append("rect")
      .filter(function(d) { return d.value != 0.1 && d.value != 0.2; })
        .attr("height", function(d) { return Math.max(3, d.dy) })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
          if (d.value == 1){
            return "none";
          } else{
            return d.color = color(d.name.replace(/ .*/, ""));
          }
        })
        .append("title")
          .text(function(d) { 
          return d.name + "\n" + format(d.value-1); }); 

    //add year axis
    node.append("text")
        .filter(function(d) { return d.value == 0.1; })
          .attr("class",function(d){return "fund "+d.fundcode;})
          .attr("height", function(d) { return d.dy; })
          .attr("width", sankey.nodeWidth())
          .attr("x", -8)
          .attr("y", function(d) {return d.dy; })
          .attr("dy", ".35em")
          //.attr("text-anchor", "end")
        .filter(function(d){return d.name!="0";})
          .text(function(d){ return d.name;})
          .style("font-size",20);
    node.selectAll("text")
      .filter(function(d) { return d.value == 0.2 && d.year != "2004"; })
        .attr("x", -8)
        .attr("y", function(d) { return d.dy; })
        .attr("dy", ".35em")
        .text(function(d){ 
          return d.name;
        })
        .style("font-size",20);


  function dragmove(d) {
    d3.select(this).attr("transform", 
        "translate(" + (
             d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
          ) + "," + (
                   d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

  function handleMouseover(d){
    var fundcode = d3.select(this).attr("class").substring(5);
    $("."+fundcode).css("stroke-opacity","0.5").css("stroke","red");
    $("text."+fundcode)
      .css("fill","red")
      .css("font-size",20);
  }

  function handleMouseout(d){
    var fundcode = d3.select(this).attr("class").substring(5);
    $("."+fundcode).css("stroke-opacity","0.2").css("stroke","black");
    $("text."+fundcode)
      .css("fill","black")
      .css("font-size",14);
  }
     
});