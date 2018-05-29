var investing_chart;
var pie_chart = [null, null];
var accumulated_data = [];
google.charts.load('current', {packages: ['corechart', 'line']});
// google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function () {
    get_breakdown_portfolio(jQuery("#slider-range-risk").slider( "values", 1 ), 0);
    get_breakdown_portfolio(jQuery("#slider-range-risk").slider( "values", 0 ), 1);
    graph_returns();
});

jQuery( function() {
    jQuery( "#slider-range-risk" ).slider({
        range: true,
        min: 1,
        max: 10,
        step: 1,
        values: [ 4, 6 ],
        slide: function( event, ui ) {
            graph_returns();
            get_breakdown_portfolio(ui.values[1], 0);
            get_breakdown_portfolio(ui.values[0], 1);
        }
    });

    jQuery( "#slider-range-period" ).slider({
        range: false,
        min: 1,
        max: 40,
        value: 10,
        step: 1,
        slide: function( event, ui ) {
            jQuery("#period").val(ui.value + " years");
            graph_returns();
        }
    });
    jQuery("#period").val(jQuery("#slider-range-period").slider("value") + " years");

    jQuery( "#slider-range-invest" ).slider({
        range: false,
        min: 1000,
        max: 50000,
        value: 5000,
        step: 1000,
        slide: function( event, ui ) {
            jQuery("#annual_invest").val(ui.value);
            graph_returns();
        }
    });
    jQuery("#annual_invest").val(jQuery("#slider-range-invest").slider("value"));
} );

function get_breakdown_portfolio(portfolio_idx, high_low){
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            const pie_points = JSON.parse(this.responseText);
            var data_grp = [["Product Name", "Percentage"]];
            for (var idx=0; idx < pie_points.length; idx++){
                data_grp.push([pie_points[idx]["ProductName"], pie_points[idx]["ProductBreakdown"]]);
            }
            update_pie_chart(data_grp, high_low);
        }
    });
    xhr.open("GET", "http://dev.bambu.life:8081/api/ModelPortfolioProductBreakdown/" + portfolio_idx);
    xhr.send(data);
}

function update_pie_chart(data_grp, high_low) {
    var data = google.visualization.arrayToDataTable(data_grp);
    var chart_title;
    if (high_low) { // if low risk
        chart_title = "For Less Risk";
    } else {
        chart_title = "For More Risk";
    }
    var options = {
        title: 'Product Breakdown ' + chart_title
    };

    if (pie_chart[high_low] != null)  {
        pie_chart[high_low].clearChart();
    }

    chart = new google.visualization.PieChart(document.getElementById('breakdown_portfolio' + high_low));
    chart.draw(data, options);
    jQuery("#breakdown_portfolio_wrapper" + high_low).toggleClass("invisible", false);
    pie_chart[high_low] = chart;
}

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
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var graph_data = JSON.parse(this.responseText);
            graph_data = graph_data['response'];
            graph_data = graph_data["graphArray"];
            drawCurveTypes(graph_data, high_low);
        }
    });

    xhr.open("POST", "http://microservice.dev.bambu.life/api/graph/accumulators", true);
    xhr.setRequestHeader("Content-type", "application/json");
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

    if (investing_chart != null)  {
        investing_chart.clearChart();
    }

    chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
    investing_chart = chart;
}


// function testing() {
//     var data = JSON.stringify({
//         "yearsToGoal": "10",
//         "compound": "12",
//         "confidence": "0.95",
//         "discreteExpectedVolatility": "0.1103",
//         "discreteExpectedReturnPerAnnum": "0.0514",
//         "initialInvestment": "1000",
//         "annualInvestment": "1000",
//         "currentYear": "2018"
//     });
//
//     // data = '{yearstoGoal: "10", compound: "12", confidence,: "0.95", discreteExpectedVolatility: "0.1103", discreteExpectedReturnPerAnnum: "0.0514", initialInvestment: "1000", annualInvestment: "1000", currentYear: "2018"}';
//     console.log(data);
//
//     var xhr = new XMLHttpRequest();
//     // xhr.withCredentials = true;
//
//
//     xhr.addEventListener("readystatechange", function () {
//         if (this.readyState === this.DONE) {
//             console.log(this.responseText);
//             console.log(JSON.parse(this.responseText));
//         }
//     });
//
//     xhr.open("POST", "http://microservice.dev.bambu.life/api/graph/accumulators", true);
//
//     xhr.setRequestHeader("Content-type", "application/json");
//
//     xhr.send(data);
// }