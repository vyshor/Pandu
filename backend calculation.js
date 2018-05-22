window.onload = function () {
    document.getElementById('course').style.visibility = 'hidden';
    document.getElementById("uni").onchange = function () {
        var uni = this.value;
        if (uni === "") return; // please select - possibly you want something else here

        $.ajax("Python\\" + uni + "_courses.json", {
            async: true, success: function (fees) {
                $('#course')
                    .find('option')
                    .remove()
                    .end();
                $.each(fees, function (i, item) {
                    $('#course').append($('<option>', {
                        value: item,
                        text : item
                    }));
                });
            }
        });

        document.getElementById('course').style.visibility = 'visible';
    }
}

function calculate_expenditure_with_hostel(monthly_expense) {
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            const individual_expense = JSON.parse(this.responseText);
            var hostel_fees;
            monthly_expense -= individual_expense[2]["IndividualExpense"]; // minus housing and related expenses
            monthly_expense -= individual_expense[4]["IndividualExpense"] * 0.5; // minus transport expense by half
            monthly_expense -= individual_expense[8]["IndividualExpense"]; // minus accomodation expenses

            $.ajax("Python\\" + document.getElementById("uni").value + "_hostel.json", {
                async: false, success: function (fees) {
                    monthly_expense += fees[0];
                    hostel_fees = fees[0]
                }
            });

            document.getElementById("expense").innerHTML = "$" + monthly_expense.toFixed(2);
            document.getElementById("hostel_fees").innerHTML = "Hostels Fees: $" + hostel_fees.toFixed(2);
            // console.log("monthly expense: " + monthly_expense);
        }
    });
    xhr.open("GET", "http://dev.bambu.life:8081/api/ExpenseEstimator?total_expense=" + monthly_expense);
    xhr.send(data);
}

function estimated_monthly_expenditure() {
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var expense = JSON.parse(this.responseText);
            if (document.getElementById("hostel").checked) {
                calculate_expenditure_with_hostel(expense);
            } else {
                document.getElementById("expense").innerHTML = "$" + expense.toFixed(2);
                document.getElementById("hostel_fees").innerHTML = "";

            }
        }
    });
    xhr.open("GET", "http://dev.bambu.life:8081/api/TotalExpenseEstimator?monthly_income=" + 0);
    xhr.send(data);

}
