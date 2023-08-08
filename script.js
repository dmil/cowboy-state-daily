document.addEventListener("DOMContentLoaded", function() {

  // Load data from CSV file
  d3.csv("vis_dims.csv").then(function(data) {
    // Convert x and y values to numbers
    data.forEach(function(d) {
      d.x = +d.x;
      d.y = +d.y;
      d.publish_date = new Date(d.publish_date); // Convert publish_date to Date object
  });
  
  // set initial variables
  const margin = { top: 60, right: 30, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  let tooltip;
  let filteredData;

  // DRAW CHART
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
    .attr("title", d => d.title)
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

    // Function to format the publish date as "YYYY-MM-DD"
    function formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    }

    // Function to highlight the search query within the title
    function highlightTitle(title) {
      const searchText = document.getElementById("searchBox").value.trim().toLowerCase();
      const regex = new RegExp(searchText, "gi");
      return title.replace(regex, match => `<span class="highlight">${match}</span>`);
    }

    // Function to update the table with filtered data
    function updateHeadlineTable(filteredData) {
      const tableBody = d3.select("#headline-table-body");

      // Remove existing rows from the table
      tableBody.selectAll("tr").remove();
      
      // Sort the filtered data by publish_date in descending order
      filteredData.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

      // Create new rows for each data point and populate the table
      const rows = tableBody.selectAll("tr")
        .data(filteredData)
        .enter()
        .append("tr");

      // Populate the rows with title and publish_date information
      rows.append("td").html(d => highlightTitle(d.title)); // Use the highlightTitle function
      // add x,y values as a attribute on the row
      rows.attr("data-title", d => d.title);
      rows.append("td").text(d => formatDate(d.publish_date));

      // Bind mouseover and mouseout events to each row in the table
      const tableRows = document.querySelectorAll("#headline-table tbody tr");
      tableRows.forEach(row => {
        const title = row.getAttribute("data-title");
        const dataPoint = data.find(d => d.title === title);
        row.addEventListener("mouseover", () => handleRowMouseOver(dataPoint));
        row.addEventListener("mouseout", () => handleRowMouseOut(dataPoint));
      });

    }

    function handleRowMouseOver(dataPoint) {

      if (dataPoint) {
        // Change the color of the corresponding dot
        const correspondingDot = svg.selectAll(".dot")
          .filter(d => d.title === dataPoint.title);

        // loop through correspondingDot
        correspondingDot.each(function(d) {
          console.log(d.x, d.y);
          // make d red
          d3.select(this)
            .attr("r", 10)
            .style("fill", "orange")
            .style("fill-opacity", .4);

          const correspondingRow = d3.select(`#headline-table tbody tr[data-title="${dataPoint.title}"]`);
          correspondingRow
            .style("background-color", "rgba(255, 165, 0, 0.4)");
        });
      }
    }
    
    function handleRowMouseOut(dataPoint) {
    
      if (dataPoint) {
        // Change the color of the corresponding dot back to its original color
        const correspondingDot = svg.selectAll(".dot")
          .filter(d => d.title === dataPoint.title);
        // loop through correspondingDot
        correspondingDot.each(function(d) {
          console.log(d.x, d.y);
          // make d red
          d3.select(this)
            .style("fill", "blue")
            .style("fill-opacity", 0.1)
            .attr("r", 5);
        
          const correspondingRow = d3.select(`#headline-table tbody tr[data-title="${dataPoint.title}"]`);
          correspondingRow.style("background-color", "white");    
          
        });
      }
    }

    // Function to clear the data from the table and hide it
    function clearHeadlineTable() {
      console.log("clearHeadlineTable");
      const tableBody = d3.select("#headline-table-body");
      tableBody.selectAll("tr").remove();
      d3.select("#headline-table").classed("hidden", true);
    }

    // show headline table
    function showHeadlineTable() {
      console.log("showHeadlineTable");
      d3.select("#headline-table").classed("hidden", false);
    }

    // Load the data
    function updateFilter(){
      const searchText = document.getElementById("searchBox").value.trim().toLowerCase();
      filteredData = filterData.call(this);
      updateScatterPlot(filteredData);
      if(searchText){
        updateHeadlineTable(filteredData);
        showHeadlineTable();
      }
      else {
        clearHeadlineTable();
      }
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
      filteredData = filterData.call(this);
      updateScatterPlot(filteredData);
      clearHeadlineTable();
    });
  }).catch(function(error) {
    console.log(error);
  });
});
