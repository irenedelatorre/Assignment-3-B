console.log("Assignment 3");

//Set up drawing environment with margin conventions
var margin = {t:20,r:20,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.l - margin.r,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var plot = d3.select('#plot')
    .append('svg')
    .attr('width',width + margin.l + margin.r)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','plot-area')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//Initialize axes
//Consult documentation here https://github.com/mbostock/d3/wiki/SVG-Axes
var scaleX,scaleY;

var axisX = d3.svg.axis()
    .orient('bottom')
    .tickSize(-height)
    .tickValues([1000,10000,100000])
    .tickFormat(d3.format(",.0f"));

var axisY = d3.svg.axis()
    .orient('left')
    .tickSize(-width)
    .ticks(5)//25% 50% 75% 100% 125% 150%
    .tickFormat(function(d) {
        return(d) + "%";
    }); //write %




//Start importing data
d3.csv('/data/world_bank_2012.csv', parse, dataLoaded);

function parse(d){
    //Eliminate records for which gdp per capita isn't available
    if(d['GDP per capita, PPP (constant 2011 international $)']=='..'){
        return;
    }
    //Check "primary completion" and "urban population" columns
    console.log(d["Primary completion rate, total (% of relevant age group)"]);
    console.log(d["Urban population (% of total)"]);
    //if figure is unavailable and denoted as "..", replace it with undefined
    //otherwise, parse the figure into numbers
    return {
        cName: d['Country Name'],
        cCode: d['Country Code'],
        gdpPerCap: +d['GDP per capita, PPP (constant 2011 international $)'],
        primaryCompletion: d['Primary completion rate, total (% of relevant age group)']!='..'?+d['Primary completion rate, total (% of relevant age group)']:undefined,
        urbanPop: d['Urban population (% of total)']!='..'?+d['Urban population (% of total)']:undefined
    }
}

function dataLoaded(error, rows) {
    //with data loaded, we can now mine the data
    var gdpPerCapMin = d3.min(rows, function (d) {
            return d.gdpPerCap
        }),
        gdpPerCapMax = d3.max(rows, function (d) {
            return d.gdpPerCap
        });
    var primaryCompletionMin = d3.min(rows, function (d) {
            return d.primaryCompletion
        }),
        primaryCompletionMax = d3.max(rows, function (d) {
            return d.primaryCompletion
        });
    var urbanPopMin = d3.min(rows, function (d) {
            return d.urbanPop
        }),
        urbanPopMax = d3.max(rows, function (d) {
            return d.urbanPop
        });

    console.log(gdpPerCapMin, gdpPerCapMax);
    console.log(primaryCompletionMin, primaryCompletionMax);
    console.log(urbanPopMin, urbanPopMax);

    //with mined information, set up domain and range for x and y scales
    //Log scale for x, linear scale for y
    //scaleX = d3.scale.log()...
    scaleX = d3.scale.log().domain([gdpPerCapMin, gdpPerCapMax+5000]).range([0, width]);
    // gdpPerCapMax+5000 to have more space in the right side of the axis

    scaleY = d3.scale.linear().domain([0, 150]).range([height, 0]);

    //Draw axisX and axisY
    axisX.scale(scaleX);
    axisY.scale(scaleY);

    plot.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(axisX);

    plot.append('g')
        .attr('class', 'axis axis-y')
        .call(axisY);

    //draw <line> elements to represent countries
    //each country should have two <line> elements, nested under a common <g> element


    var countries = plot.selectAll('.country')
        .data(rows)
        .enter()
        .append('g')
        .attr('class', function (d) {
            return d.cCode + ", countries"
        });


// to add two or more classes both of them need to be INSIDE the function


    countries.append('line')
        .attr("class", function (d) {
            if(d.primaryCompletion==undefined){
                return ("grey"); // class to control the appearance of undefined lines
            }
            else {return ("primaryCompletion");
            }
        })
        .attr("x1", function (d) {
            return scaleX(d.gdpPerCap)
        })
        .attr("y1", height)
        .attr("x2", function (d) {
            return scaleX(d.gdpPerCap)
        })
        .attr("y2", function (d) {
            return scaleY(d.primaryCompletion)
        })
        .on("mouseover", function (d) {
            console.log(d)
        });


    countries.append('line')
        .attr("class", function (d) {
            if(d.urbanPop==undefined){
                return ("grey"); // class to control the appearance of undefined lines
            }
            else {return ("urbanPopulation");
            }
        })
        .attr("x1", function (d) {
            return scaleX(d.gdpPerCap)
        })
        .attr("y1", height)
        .attr("x2", function (d) {
            return scaleX(d.gdpPerCap)
        })
        .attr("y2", function (d) {
            return scaleY(d.urbanPop)
        })
        .on("mouseover", function (d) {
            console.log(d);
        })
}


/*
 It doesn't work because they need to be attached to the variable that creates the group, and that allows to exit the data
 .selectAll("line")
        .data(rows)
        .enter()
        .append("line")
        .attr("class", "primaryCompletion")
        .attr("x1", function(d){
            return scaleX(d.gdpPerCap)})
        .attr("y1", 0)
        .attr("x2",function(d){
            return scaleX(d.gdpPerCap)
        })
        .attr("y2", function(d){
            return scaleY(d.primaryCompletion)});
    line.exit()
    .selectAll("line")
        .data(rows)
        .enter()
        .append("line")
        .attr("class", "urbanPopulation")
        .attr("x1", function(d){
            return scaleX(d.gdpPerCap)})
        .attr("y1", 0)
        .attr("x2",function(d){
            return scaleX(d.gdpPerCap)
        })
        .attr("y2", function(d){
            return scaleY(d.urbanPop)});
}*/

