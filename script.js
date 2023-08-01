document.addEventListener("DOMContentLoaded", function() {
    // Load data from CSV file
    d3.csv("vis_dims.csv").then(function(data) {
      // Convert x and y values to numbers
      data.forEach(function(d) {
        d.x = +d.x;
        d.y = +d.y;
        d.publish_date = new Date(d.publish_date); // Convert publish_date to Date object
      });
  
      const margin = { top: 60, right: 30, bottom: 40, left: 50 };
      const width = 1000 - margin.left - margin.right;
      const height = 625 - margin.top - margin.bottom;
  
      // Create SVG element
      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
      // Create scales
      const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([0, width]);
  
      const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([height, 0]);
  
      // Create dots
      const dots = svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 5)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleClick);
  
      // Tooltip functions
      function handleMouseOver(d) {
        d3.select(this)
          .attr("r", 8);
  
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 40) + "px");
  
        tooltip.append("div")
          .attr("class", "tooltip-title")
          .text(d.title);
  
        tooltip.append("div")
          .attr("class", "tooltip-publish-date")
          .text("Published on " + d.publish_date.toDateString());
      }
  
      function handleMouseOut() {
        d3.select(this)
          .attr("r", 5);
  
        d3.select(".tooltip").remove();
      }
  
      // Click function
      function handleClick(d) {
        window.open(d.url, "_blank");
      }

      // Create fucntion to filter datapoints based on text box contents
      function filterData() {
        const searchText = this.value;
        let filteredData;
  
        if (searchText === "" | searchText === undefined) {
          filteredData = data; // Show all data when the search box is empty
        } else {
          filteredData = data.filter(d => d.title.toLowerCase().includes(searchText.trim().toLowerCase()));
        }
  
        const dotsUpdate = svg.selectAll(".dot")
          .data(filteredData, d => d.title);
  
        dotsUpdate.enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", d => xScale(d.x))
          .attr("cy", d => yScale(d.y))
          .attr("r", 5)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick);
  
        dotsUpdate.exit().remove();
  
        dotsUpdate.merge(dots)
          .attr("cx", d => xScale(d.x))
          .attr("cy", d => yScale(d.y));
      };
  
      // Search functionality
      d3.select("#searchBox").on("input change", filterData);
  
      
      window.setFilterText = function(text) {
        d3.select("#searchBox").property("value", text).node().dispatchEvent(new Event("input"));
      };

      // Event listener for the clear button
      document.getElementById("clearButton").addEventListener("click", function() {
        document.getElementById("searchBox").value = ""; // Clear the search box
        filterData(); // Reset the chart
      });

    }).catch(function(error) {
      console.log(error);
    });
  });
  