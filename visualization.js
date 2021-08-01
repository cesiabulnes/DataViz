// Configuring sensible margins and SVG canvas
var margin = { top: 10, right: 70, bottom: 70, left: 50 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
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
    .domain([0, 30])
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
    .call(
        d3.axisBottom(x)
        .ticks(10)
        .tickSize(-height)
        .tickFormat("")
    )

// add the Y gridlines
svg.append("g")
    .attr("class", "grid")
    .call(
        d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width)
        .tickFormat("")
    )

const incomeGroups = ["high_income", "middle_income", "low_income"];
let loadedData;

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

    renderVisual(loadedData, incomeGroup);
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

function renderVisual(datapoints, incomeGroup) {
    const countryColors = d3.scaleOrdinal()
        .domain(new Set(datapoints.map(row => row['countryCode'])))
        .range(d3.schemeSet2);

    const subset = datapoints.filter((d) => d['incomeGroup'] == incomeGroup)

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
            return exit.remove();
        }
    )
    .attr("cx", function (d) { return x(d['year']); })
    .attr("cy", function (d) { return y(d['suicideRate']); })
    .attr("r", 4)
    .style("fill", "none")
    .style("stroke-width", 2)
    .style("stroke", function (d) { return countryColors(d['countryCode']) });
}