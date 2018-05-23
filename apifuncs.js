// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function total_monthly_expenses(monthly_income) {
    var data = JSON.stringify(false);

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            return data = this.responseText;
        }
    });

    xhr.open("GET", "http://dev.bambu.life:8081/api/TotalExpenseEstimator?monthly_income=" + monthly_income, false);

    xhr.send(data);
}



function individual_item_expense(monthly_expense) {
    var data = JSON.stringify(false);

    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            return_data = this.responseText;
        }
    });

    xhr.open("GET", "http://dev.bambu.life:8081/api/ExpenseEstimator?total_expense="+monthly_expense, false);

    xhr.send(data);

}

