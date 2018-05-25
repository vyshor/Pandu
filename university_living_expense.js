
// var SQL = require('sql.js');
// var fs = require('browserify-fs');
// var path = require('path');
// var db;
// const http = require("http");
// fs.readFile(GITRAW + path.join(__dirname, 'Python/course_info.db'), function(err, data){
//     console.log(err);
//     console.log(typeof data);
//     db = new SQL.Database(data);
//     console.log(db);
//     console.log(db.exec("SELECT * FROM courseInfo"));
// });

function university_living_on_load() {

    // Change the course available when university is picked
    document.getElementById('course').style.visibility = 'hidden';
    document.getElementById("uni").onchange = function () {
        var uni = this.value;
        if (uni === "") return; // please select - possibly you want something else here

        jQuery.ajax(GITRAW + "Python/uni/" + uni + "_courses.json", {
            async: true, success: function (fees) {
                jQuery('#course')
                    .find('option')
                    .remove()
                    .end();
                if (!LOCALISED) {
                    fees = JSON.parse(fees);
                }
                jQuery.each(fees, function (i, item) {
                    jQuery('#course').append(jQuery('<option>', {
                        value: item,
                        text : item
                    }));
                });
            }
        });

        document.getElementById('course').style.visibility = 'visible';
    }


    // // Change the course fees when course is changed
    // document.getElementById("course").onchange = function () {
    //     var course = this.value;
    //     var uni = document.getElementById("uni");
    //     if (course === "") return; // please select - possibly you want something else here
    //
    //     var output = db.prepare("SELECT cost FROM courseInfo WHERE uni=:aval AND course=:bval");
    //     var result = stmt.getAsObject({':aval' : uni, ':bval' : course});
    //     console.log(result);
    //     document.getElementById("course_fees").innerHTML = result;
    // }
}
if (LOCALISED) {
    google.charts.load('current', {'packages':['corechart']});
}
var expense_chart;
// google.charts.setOnLoadCallback(drawChart);

function drawChart(data_points) {
    var data = google.visualization.arrayToDataTable(data_points);
    var options = {
        title: 'Expense Breakdown'
    };

    if (expense_chart != null)  {
        expense_chart.clearChart();
    }

    chart = new google.visualization.PieChart(document.getElementById('expense_breakdown'));
    chart.draw(data, options);
    jQuery("#expense_breakdown_wrapper").toggleClass("invisible", false);
    expense_chart = chart;
}

function calculate_expenditure_with_hostel(monthly_expense, without_with_hostel) {
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            const individual_expense = JSON.parse(this.responseText);
            var hostel_fees;
            var data_points = [["Type", "Expense (S$)"]];
            if (without_with_hostel) {
                monthly_expense -= individual_expense[2]["IndividualExpense"]; // minus housing and related expenses
                monthly_expense -= individual_expense[4]["IndividualExpense"] * 0.5; // minus transport expense by half
                monthly_expense -= individual_expense[8]["IndividualExpense"]; // minus accommodation expenses

                const removed_category = ["Housing And Related Expenses", "Accommodation Services"];
                for (var idx = 0; idx < Object.keys(individual_expense).length; idx++) {
                    if (removed_category.indexOf(jQuery.trim(individual_expense[idx]['ExpenseName'])) === -1) {
                        data_points.push([jQuery.trim(individual_expense[idx]['ExpenseName']), parseFloat(parseFloat(individual_expense[idx]["IndividualExpense"]).toFixed(2))]);
                    }
                }
            } else {
                for (var idx = 0; idx < Object.keys(individual_expense).length; idx++) {
                    data_points.push([jQuery.trim(individual_expense[idx]['ExpenseName']), parseFloat(parseFloat(individual_expense[idx]["IndividualExpense"]).toFixed(2))]);
                }
            }

            jQuery.ajax(GITRAW + "Python/uni/" + document.getElementById("uni").value + "_hostel.json", {
                async: true, success: function (fees) {
                    if (!LOCALISED) {
                        fees = JSON.parse(fees);
                    }
                    monthly_expense += fees[0];
                    hostel_fees = fees[0];

                    document.getElementById("expense").innerHTML = "S$" + parseFloat(monthly_expense).toFixed(2);
                    jQuery("#expense_wrapper").toggleClass("invisible", false);
                    // document.getElementById("hostel_fees").innerHTML = "Hostels Fees: $" + parseFloat(hostel_fees).toFixed(2);
                    if (without_with_hostel) {
                        data_points.push(["Hostel Expenses", hostel_fees]);
                    }
                    drawChart(data_points);
                }
            });


            // console.log("monthly expense: " + monthly_expense);
        }
    });
    xhr.open("GET", "http://dev.bambu.life:8081/api/ExpenseEstimator?total_expense=" + monthly_expense);
    xhr.send(data);
}

function estimated_monthly_expenditure() {
    var monthly_income;
    if (document.getElementById('monthly_income').value === '') {
        monthly_income = 0;
    } else {
        monthly_income = document.getElementById('monthly_income').value;
    }
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var expense = JSON.parse(this.responseText);
            calculate_expenditure_with_hostel(expense, document.getElementById("hostel").checked);
        }
    });
    xhr.open("GET", "http://dev.bambu.life:8081/api/TotalExpenseEstimator?monthly_income=" + monthly_income);
    xhr.send(data);

}
