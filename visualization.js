// Configuring sensible margins and SVG canvas
var margin = { top: 10, right: 70, bottom: 70, left: 50 },
    width = 970 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1050 800")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Setup x-axis
var x = d3.scaleLinear()
    .domain([2010, 2019])
    .range([0, width]);
var xaxis = d3.axisBottom(x).tickFormat(d3.format("d"));

svg.append("g")
    .attr("class", "axis")
    .attr("class", "Xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);
svg.append("text")
    .attr("class", "axisText")
    .attr("transform",
        "translate(" + (width / 2) + " ," +
        (height + margin.top + 30) + ")")
    .style("text-anchor", "middle")
    .text("Year");

// Setup y-axis
var y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);
var yaxis = d3.axisLeft(y)

svg.append("g")
    .attr("class", "axis")
    .attr("class", "Yaxis")
    .call(yaxis);

svg.append("text")
    .attr("class", "axisText")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Suicides rates per 100,000 people");

// add the X gridlines
svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .style("opacity", 0.2)
    .call(
        d3.axisBottom(x)
        .ticks(10)
        .tickSize(-height)
        .tickFormat("")
    )

// add the Y gridlines
svg.append("g")
    .attr("class", "grid")
    .style("opacity", 0.2)
    .call(
        d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width)
        .tickFormat("")
    )

const incomeGroups = ["high_income", "middle_income", "low_income"];
let loadedData;
let renderAll = false;

d3.select("#toggleData").on('change', () => {
    renderAll = d3.select("#toggleData").property("checked");
    renderVisual(loadedData, getCurrentIncomeGroup(), renderAll);
});

// Setup toggling across different income groups
function getCurrentIncomeGroup() {
    return document.getElementById("my_dataviz").getAttribute("current-income-group");
}
function setCurrentIncomeGroup(incomeGroup) {
    if (!incomeGroups.includes(incomeGroup)) {
        throw new Error("Invalid Income Group selection");
    }

    document.getElementById("my_dataviz").setAttribute("current-income-group", incomeGroup);
    incomeGroups.forEach((incomeGroup) => {
        window.document.getElementById(incomeGroup)
            .parentNode
            .classList
            .remove('active');
    });
    window.document.getElementById(incomeGroup)
        .parentNode
        .classList
        .add('active');

    renderVisual(loadedData, incomeGroup, renderAll);
}

// Setup event listeners for the page
window.addEventListener('load', (event) => {
    const defaultIncomeGroup = "high_income";
    loadData().then((data) => {
        loadedData = data;
        setCurrentIncomeGroup(defaultIncomeGroup);
    });
});
incomeGroups.forEach((incomeGroup) => {
    const domButtonElem = window.document.getElementById(incomeGroup);
    domButtonElem.addEventListener('click', () => {
        setCurrentIncomeGroup(incomeGroup);
    })
});
window.document.getElementById('next_income').addEventListener('click', () => {
    let currentIndex = incomeGroups.indexOf(getCurrentIncomeGroup());
    currentIndex++;
    if (currentIndex > 2) {
        currentIndex = 0;
    }
    setCurrentIncomeGroup(incomeGroups[currentIndex]);
});
window.document.getElementById('previous_income').addEventListener('click', () => {
    let currentIndex = incomeGroups.indexOf(getCurrentIncomeGroup());
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = 2;
    }
    setCurrentIncomeGroup(incomeGroups[currentIndex]);
});

async function loadData() {
    const yearsWanted = x.ticks();
    let data = await d3.csv("https://raw.githubusercontent.com/cesiabulnes/DataViz/master/API_SH/Spercountryperyearupdated.csv");
    
    // Remove rows with no region, income group or mortality rates
    data = data.filter((row) => {
        if (!row['Region']) {
            return false;
        }
        if (!row['IncomeGroup']) {
            return false;
        }
        for (const year of yearsWanted) {
            if (!row[year]) {
                return false;
            }
        }
        return true;
    }).map((row) => {
        let processedRow = {};
        processedRow['country'] = row['CountryName'];
        processedRow['countryCode'] = row['CountryCode'];
        processedRow['region'] = row['Region'];

        const incomeGroup = row['IncomeGroup'];
        if (incomeGroup == "High income") {
            processedRow['incomeGroup'] = 'high_income';
        } 
        else if (incomeGroup == "Low income") {
            processedRow['incomeGroup'] = 'low_income';
        } 
        else {
            processedRow['incomeGroup'] = 'middle_income';
        }
        
        return yearsWanted.map((year) => ({
            'suicideRate': Number(row[year]),
            'year': year,
            ...processedRow
        }));
    })
    .flat()
    .map((row, i) => ({'index': i, ...row}));

    return data;
}

function renderVisual(datapoints, incomeGroup, renderAll) {
    const regions = Array.from(new Set(datapoints.map(d => d['region'])));
    const regionColors = d3.scaleOrdinal()
        .domain(regions)
        .range(d3.schemeSet1);

    let subset = datapoints.filter((d) => d['incomeGroup'] == incomeGroup);

    // Only show percentiles for each year
    // First, sort by suicide rates. 
    // Then, aggregate datapoints for each year and calculate percentiles 
    // for each year
    if (!renderAll) {
        const groupedByYear = subset.sort((d1, d2) => {
            return d1['suicideRate'] - d2['suicideRate']
        }).reduce((agg, datapoint) => {
            const datapointYear = datapoint['year'];
            if (!(datapointYear in agg)) {
                agg[datapointYear] = [];
            }
            agg[datapointYear].push(datapoint);
            return agg;
        }, {});
        subset = Object.entries(groupedByYear).map((
            ([_, datapointsInYear]) => [...Array(11).keys()].map(num => {
                let percentile = Number((num * 0.1).toFixed(1));
                let percentileIndex = Math.floor(
                    (datapointsInYear.length - 1) * percentile
                );
                if (percentile == 0) {
                    percentileIndex = 0;
                }
                else if (percentile == 10) {
                    percentileIndex = datapointsInYear.length ;
                }
                
                const percentileDatapoint = datapointsInYear[percentileIndex];
                percentileDatapoint['percentile'] = percentile;
                return percentileDatapoint;
            })
        )).flat();
    }

    // Plot annotations based on toggled income group
    // Add annotation to the chart
    svg.selectAll('.annotation-group').remove();
    svg
    .append('g')
    .attr('class', 'annotation-group')
    .call(generateAnnotationObject(incomeGroup, regionColors));

    // Plot data points on graph
    svg
    .selectAll("circle")
    .data(subset, (data) => {
        return data['index']
    })
    .join(
        (enter) => {
            return enter.append('circle');
        },
        (update) => {
            return update;
        },
        (exit) => {
            return exit.on('click', null).remove();
        }
    )
    .attr("cx", function (d) { return x(d['year']); })
    .attr("cy", function (d) { return y(d['suicideRate']); })
    .attr("r", 6)
    .style("fill", function (d) { return regionColors(d['region']) })
    .style("stroke-width", 2)
    .style("stroke", function (d) { return regionColors(d['region']) })
    .on("mouseover", function (d) {
        const xcoord = x(d['year']);
        const ycoord = y(d['suicideRate']);

        const label = svg.append("g")
            .attr("id", "tooltip")
            .style("pointer-events", "none")
            .attr("transform", (d) => `translate(${xcoord},${ycoord})`);
        label.append("rect")
            .attr("width", "175px")
            .attr("height", "100px")
            .attr("stroke", "black")
            .attr("fill", "white")
            .attr("stroke-width", "1")
            .attr("rx", "10px") 
            .attr("ry", "10px")
        label.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("fill", "black")
            .text(`${d['country']} (${d['countryCode']})`);
        if (!Number.isNaN(d['percentile'] * 100)) {
            label.append("text")
                .attr("x", 10)
                .attr("y", 40)
                .attr("fill", "black")
                .text(`Percentile: ${d['percentile'] * 100}`);
        }
        label.append("text")
            .attr("x", 10)
            .attr("y", 60)
            .attr("fill", "black")
            .text(`Region: ${d['region']}`);
        label.append("text")
            .attr("x", 10)
            .attr("y", 80)
            .attr("fill", "black")
            .text(`Suicide Rate: ${d['suicideRate']}`);
    })
    .on("mouseout", function (d) {
        d3.select("#tooltip").remove();
    });

    // Create legend table
    svg
    .selectAll("legend_dots")
    .data(regions)
    .enter()
    .append("circle")
    .attr("cx", width + 20)
    .attr("cy", function (d, i) { return margin.top + i * 30 })
    .attr("r", 7)
    .style("fill", function (d) { return regionColors(d) })

    svg
    .selectAll("legend")
    .data(regions)
    .enter()
    .append("text")
    .attr("x", width + 30)
    .attr("y", function (d, i) { return margin.top + i * 30 })
    .style("fill", function (d) { return regionColors(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");
}

function generateAnnotationObject(incomeGroup, regionColors) {
    let annotation;

    if (incomeGroup == "high_income") {
        annotation = [{
            note: {
                label: "Eastern European countries with markedly high suicide rates, dominated for many years by Lithuania",
                title: "Europe & Central Asia"
            },
            type: d3.annotationCalloutRect,
            subject: {
                width: width * 0.85,
                height: height * 0.2,
            },
            color: regionColors("Europe & Central Asia"),
            x: -10,
            y: height * 0.55,
            dy: 0,
            dx: (width * 0.8) + 50
        }];
    }
    else if (incomeGroup == "middle_income") {
        annotation = [{
            note: {
                label: "Lesotho suffers consistently from one of the highest suicide rates in the world across all income groups",
                title: "Sub-Saharan Africa"
            },
            type: d3.annotationCalloutRect,
            subject: {
                width: width + 20,
                height: height * 0.3,
            },
            color: regionColors("Sub-Saharan Africa"),
            x: -10,
            y: 20,
            dy: 150,
            dx: width * 0.2
        }];
    }
    else if (incomeGroup == "low_income") {
        annotation = [{
            note: {
                label: "Syrian Arab Republic consistently ranks lowest in terms of suicide rates out of the low-income group nations",
                title: "Middle East & North Africa"
            },
            type: d3.annotationCalloutRect,
            subject: {
                width: width + 20,
                height: height * 0.05,
            },
            color: regionColors("Middle East & North Africa"),
            x: -10,
            y: 405,
            dy: -150,
            dx: width * 0.2
        }];
    }

    return d3.annotation().annotations(annotation);
}