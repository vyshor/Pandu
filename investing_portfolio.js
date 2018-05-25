jQuery( function() {
    jQuery( "#slider-range-risk" ).slider({
        range: true,
        min: 1,
        max: 10,
        step: 1,
        values: [ 4, 6 ],
        slide: function( event, ui ) {
        }
    });

    jQuery( "#slider-range-period" ).slider({
        range: false,
        min: 0,
        max: 40,
        value: 10,
        slide: function( event, ui ) {
        }
    });
} );


function prep_accumulation_api_input(portfolio){
    return JSON.stringify({
        "yearsToGoal": ""+ jQuery('#slider-range-period').slider("value"),
        "compound": "12",
        "confidence": "0.95",
        "discreteExpectedVolatility": "" + portfolio['Volatility'],
        "discreteExpectedReturnPerAnnum": "" + portfolio['ExpectedReturn'],
        "initialInvestment": "0",
        "annualInvestment": "" + document.getElementById('annual_invest').value,
        "currentYear": "2018"
    });
}

function get_graph_data(portfolio, high_low) {
    var data = prep_accumulation_api_input(portfolio);
    console.log(data);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var graph_data = JSON.parse(this.responseText);
            console.log(graph_data);
            graph_data = graph_data["graphArray"];
            console.log(graph_data);
            drawCurveTypes(graph_data, high_low);
        }
    });

    xhr.open("POST", "http://microservice.dev.bambu.life/api/graph/accumulators");
    xhr.send(data);
}

function graph_returns() {
    var data = JSON.stringify(false);

    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var portfolios = JSON.parse(this.responseText);
            var lower_port = jQuery('#slider-range-risk').slider("values", 0);
            var upper_port = jQuery('#slider-range-risk').slider("values", 1);
            lower_port = portfolios[lower_port - 1];
            upper_port = portfolios[upper_port - 1];

            get_graph_data(lower_port, 1);
            get_graph_data(upper_port, 0);
        }
    });

    xhr.open("GET", "http://dev.bambu.life:8081/api/ModelPortfolioList");
    xhr.send(data);
}


function drawCurveTypes(data_points, high_low) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Higher Risk');
    data.addColumn('number', 'Lower Risk');
    console.log(data_points);
    console.log(accumulated_data);
    if (data_points.length > accumulated_data.length) {
        for (var idx =0; idx < data_points.length; idx++) {
            if (idx < accumulated_data.length) {
                accumulated_data[idx][high_low+1] = data_points[idx];
            } else {
                accumulated_data.push([idx, 0, 0]);
                accumulated_data[idx][high_low+1] = data_points[idx];
            }
        }
    } else {
        for (var idx =0; idx < accumulated_data.length; idx++) {
            if (idx < data_points.length) {
                accumulated_data[idx][high_low+1] = data_points[idx];
            } else {
                accumulated_data.pop();
            }
        }

    }
    data.addRows(accumulated_data);

    var options = {
        hAxis: {
            title: 'Time (Years)'
        },
        vAxis: {
            title: 'Expected Returns ($)'
        },
        series: {
            1: {curveType: 'function'}
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

var accumulated_data = [];
google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(graph_returns);

function testing() {
    var data = JSON.stringify({
        "yearsToGoal": "10",
        "compound": "12",
        "confidence": "0.95",
        "discreteExpectedVolatility": "0.1103",
        "discreteExpectedReturnPerAnnum": "0.0514",
        "initialInvestment": "0",
        "annualInvestment": "1000",
        "currentYear": "2018",
        "period": "beg"
    });

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
        }
    });

    xhr.open("POST", "http://microservice.dev.bambu.life/api/graph/accumulators");

    xhr.send(data);
}