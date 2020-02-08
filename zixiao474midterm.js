"use strict";

(function(){

  window.addEventListener("load", init);

  const colors = {

      "Bug": "#4E79A7",

      "Dark": "#A0CBE8",

      "Electric": "#F28E2B",


            "Dragon": "#B1A008",


      "Fairy": "#FFBE7D",

      "Fighting": "#59A14F",

      "Fire": "#8CD17D",


            "Flying": "#C05B88",

      "Ghost": "#B6992D",

      "Grass": "#499894",

      "Ground": "#86BCB6",

      "Ice": "#FABFD2",

      "Normal": "#E15759",

        "Rock": "#A01758",

      "Poison": "#FF9D9A",

      "Psychic": "#79706E",

      "Steel": "#BAB0AC",

      "Water": "#D37295"

}

const generations = ["(all)",1,2,3,4,5,6];

const legendary = ['all', 'True', 'False'];

    let data = ""
    let svgContainer = ""
    // dimensions for svg
    const measurements = {
        width: 500,
        height: 500,
        marginAll: 50
    }

    function init() {
      // load data and append svg to body
      svgContainer = d3.select('body').append("svg")
          .attr('width', measurements.width + 160)
          .attr('height', measurements.height + 50);
      d3.csv("pokemon.csv")
          .then((csvData) => data = csvData)
          .then(() => makeScatterPlot())

                let fl = gen("div");
                fl.id = "fill";
                let titlel = gen("h2");
                titlel.innerHTML = "Legendary";
                fl.appendChild(titlel);
                document.querySelector("body").appendChild(fl);
                document.getElementById("fill").addEventListener("change", filterfunction);
                let filter1 = d3.select('#fill')
                    .append('select')
                    .selectAll('option')
                    .data(legendary)
                    .enter()
                    .append('option')
                    .attr('value', function(d) {
                         return d
                    })
                    .html(function(d) {
                        return d
                    })

                    let fg = gen("div");
                    fg.id = "filg";
                    let titleg = gen("h2");
                    titleg.innerHTML = "Generation (Group)";
                    fg.appendChild(titleg);
                    document.querySelector("body").appendChild(fg);

                document.getElementById("filg").addEventListener("change", filterfunction);

                let filter2 = d3.select('#filg')
                    .append('select')
                    .selectAll('option')
                    .data(generations)
                    .enter()
                    .append('option')
                    .html(function(d) { return d })
                    .attr('value', function(d) { return d })

                    let cols = [];
                    for (let color in colors) {
                      cols.push(JSON.parse('{"' + color + '":"' + colors[color] + '"}'));
                    }
                    svgContainer.selectAll('.rect')
                        .data(cols) // use the bins data
                        .enter()
                        .append('rect')
                            // x and y determine the upper left corner of our rectangle

                            // d.x0 is the lower bound of one bin
                            .attr('y', 500)
                            // d.length is the count of values in the bin
                            .attr('x', function(d,i) {
                              return 15 + i * 50;
                            })
                            .attr('width', 30)
                            .attr('height', 20)
                            .attr('fill', function(d) {
                              for (let type in d) {
                                return colors[type];
                              }
                            })
                            .style("display", "flex")
                            .style("flex-wrap", "wrap");
                  // legend labels
                  svgContainer.selectAll('.rect')
                      .data(cols)
                    .enter().append("text")
                    .attr("y", 540)
                    .attr('x', function(d,i) {
                      return 15 + i * 50;
                    })
                    .style("font-size","10pt")
                    .text(function(d) {     for (let type in d) {
                          return type;
                        } });
    }




    function makeScatterPlot() {
        // get arrays of GRE Score and Chance of Admit
        let sp = data.map((row) => parseInt(row["Sp. Def"]));
        let total = data.map((row) =>  parseInt(row["Total"]));
        // find range of data
        let limits = findMinMax(sp, total);
        // create a function to scale x coordinates
        let scaleX = d3.scaleLinear()
            .domain([limits.spMin - 5, limits.spMax])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])
        // create a function to scale y coordinates
        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax, limits.totalMin - 0.05])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])

        drawAxes(scaleX, scaleY)

        plotData(scaleX, scaleY)

        svgContainer.append('text')
          .attr('x', 200)
          .attr('y', 490)
          //.attr('transform', 'rotate(-90,0)')
          .attr('fill', 'black')
          .text("Sp. Def")

          svgContainer.append('text')
          .attr('x', -200)
          .attr('y', 15)
          .attr('transform', 'rotate(-90)')
          .attr('fill', 'black')
          .text("Total")



    }

    function findMinMax(sp, total) {
        return {
            spMin: d3.min(sp),
            spMax: d3.max(sp),
            totalMin: d3.min(total),
            totalMax: d3.max(total)
        }
    }

    function drawAxes(scaleX, scaleY) {
        // these are not HTML elements. They're functions!
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)

        // append x and y axes to svg
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    function plotData(scaleX, scaleY) {
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }

        // Define the div for the tooltip
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "grey 1px solid")
            .style("padding", "1pt");

        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr("class", "point")
                .attr('r', 4)
                .attr('fill', function(d) {
                  return colors[d["Type 1"]];
                })
                .on("mouseover", function(d) {
                  let type2 = "";
                  if (d["Type 2"] != "") {
                    type2 += d["Type 2"];
                  }
                  let hoverText = d["Name"] + "<br>" + d["Type 1"] + "<br>" + type2;
                    div.transition()
                        .style("opacity", 1);
                    div .html(hoverText)
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .style("opacity", 0)
                });

    }

    function filterfunction() {
      let fil = document.getElementById('fill').querySelector("select");
      let selected = fil.value;
      let fil2 = document.getElementById('filg').querySelector("select");
      let selected2 = fil2.value;

      svgContainer.selectAll(".point")
          .filter(function(d) {
            let boolleg = selected == d["Legendary"] || selected == "all";
            let boolgen = selected2 == d["Generation"] || selected2 == "(all)";
            if (boolleg) {
              if (boolgen) {
                return true;
              }
            }
            return false;
          })
          .attr("display", "");

          svgContainer.selectAll(".point")
              .filter(function(d) {
                let boolleg = selected != d["Legendary"] && selected != "all";
                let boolgen = selected2 != d["Generation"] && selected2 != "(all)";
                if (boolleg || boolgen) {

                    return true;
                }
                return false;
              })
            .attr("display", "none");
    }


    /**
     * Returns a new element with the given tag name.
     * @param {string} tagName - HTML tag name for new DOM element.
     * @returns {object} New DOM object for given HTML tag.
     */
    function gen(tagName) {
      return document.createElement(tagName);
    }



})()
