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
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;
      let tooltip;
      let filteredData;

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

      // Function to hide the tooltip
      function hideTooltip() {
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
      }

      // Function to show the tooltip for a specific title
      window.showTooltipForTitle = function(title) {
        // Hide any existing tooltip
        hideTooltip();
      
        // Filter the data to find the data point with the specified title
        const dataPoint = data.find(d => d.title === title);

        // Get the position of the chart
        const chartContainer = document.getElementById("chart");
        const chartRect = chartContainer.getBoundingClientRect();
        const chartX = chartRect.left;
        const chartY = chartRect.top;

        // Calculate the tooltip position relative to the chart
        const tooltipX = dataPoint.x + chartX + 10;
        const tooltipY = dataPoint.y + chartY - 10;
      
        // Show the tooltip for the data point
        if (dataPoint) {
          tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .text(dataPoint.title)
            .style("left", (tooltipX) + "px")
            .style("top", (tooltipY) + "px");

          tooltip.append("div")
            .attr("class", "tooltip-title")
            .text(dataPoint.title);
    
          tooltip.append("div")
            .attr("class", "tooltip-publish-date")
            .text("Published on " + dataPoint.publish_date.toDateString());
        }
      }
      
      function handleMouseOver(d) {
        d3.select(this)
          .attr("r", 8);
  
        tooltip = d3.select("body")
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
          return data; // Show all data when the search box is empty
        } else if (searchText=== "wind") {
          console.log("exclude 'wind river'");
          const regexPattern = new RegExp(`\\b${searchText.trim()}\\b`, 'i');
          filteredData = data.filter(d => regexPattern.test(d.title));
          return filteredData.filter(d => !d.title.toLowerCase().includes("wind river"));
        }
        else {
          const regexPattern = new RegExp(`\\b${searchText.trim()}\\b`, 'i');
          return data.filter(d => regexPattern.test(d.title));
        }
      };

      function updateScatterPlot(filteredData) {
  
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
  
      function updateFilter(){
        filteredData = filterData.call(this);
        updateScatterPlot(filteredData);
      }

      // Search functionality
      d3.select("#searchBox").on("input change", updateFilter);
  
      // Event listener for the set filter button
      window.setFilterText = function(text) {
        d3.select("#searchBox").property("value", text).node().dispatchEvent(new Event("input"));
      };

      // Event listener for the clear button
      document.getElementById("clearButton").addEventListener("click", function() {
        document.getElementById("searchBox").value = ""; // Clear the search box
        updateFilter();
      });

    }).catch(function(error) {
      console.log(error);
    });
  });
  