function university_cost_on_load() {

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

}

function get_course_cost_salary(){
    var course = document.getElementById("course").value;
    var uni = document.getElementById("uni").value;
    if (course === "") return; // please select - possibly you want something else here

    jQuery.ajax(GITRAW + "Python/uni/" + uni + "_cost_salary.json", {
        async: true, success: function (cost_salary) {
            if (!LOCALISED) {
                cost_salary = JSON.parse(cost_salary);
            }
            console.log(cost_salary);
            document.getElementById("course_fees").innerHTML = "S$" + cost_salary[course]["cost"];
            document.getElementById("median_salary").innerHTML = "S$" + parseFloat(cost_salary[course]["median_salary"]).toFixed(2);
            document.getElementById("course_duration").innerHTML = cost_salary[course]["duration"] + " years";
            get_study_loan_repayment(parseInt(parseFloat(cost_salary[course]["median_salary"]).toFixed(2) * parseInt(cost_salary[course]["duration"])), 2)
        }
    });
}

function prep_study_loan_api(amount, duration) {
    amount = amount.toLocaleString().replace(/,/g, '%2C');
    return 'https://cors-anywhere.herokuapp.com/' + "https://www.moneysmart.sg/ajax/singlewiz/getSingleWizTableData?channel=education-loan&channelSlug=education-loan&page=1&sort=&order=&limit=1&filters%5Bloan_amount%5D=" + amount + "&filters%5Bloan_tenure_unit%5D=years&filters%5Bloan_tenure%5D=" + duration + "&filters%5Blocation%5D=Local";
}

function process_study_load_request(text) {
    var interest_rate = text.slice(text.indexOf('class=\\"rate\\"><b>') + 'class=\\"rate\\"><b>'.length, text.search("%</b>Interest Rate"));
    var monthly_repayment = text.slice(text.indexOf('\\\"month\\\"><b>$') + '\\\"month\\\"><b>$'.length, text.search("</b>Per Month"));
    return [interest_rate, monthly_repayment];
}

function get_study_loan_repayment(amount, duration) {
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var loan_info = process_study_load_request(this.responseText);
            document.getElementById("interest_rate").innerHTML = loan_info[0] + "%";
            document.getElementById("monthly_repayment").innerHTML = 'S$' + loan_info[1];

        }
    });

    xhr.open("GET", prep_study_loan_api(amount, duration));
    xhr.send(data);

}

