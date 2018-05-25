function university_cost_on_load() {

    // Change the course available when university is picked
    function load_course() {
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
                        text: item
                    }));
                });
            }
        });
        //document.getElementById('course').style.visibility = 'visible';
    }

    var uniselect = document.getElementById("uni");
    uniselect.onchange = load_course();
    window.onload = load_course();
    
    /*document.getElementById('course').style.visibility = 'hidden';
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
                        text: item
                    }));
                });
            }
        });

        document.getElementById('course').style.visibility = 'visible';
    }*/

    jQuery("#course").change(function () {
        get_course_cost_salary();
    });

    jQuery("#study_loan").change(function () {
        if (document.getElementById('study_loan').checked) {
            jQuery("#payback_period_wrapper").toggleClass("invisible", false);
            get_course_cost_salary();
        } else {
            jQuery("#payback_period_wrapper").toggleClass("invisible", true);
        }

    });

    jQuery("#hostel").change(function () {
        get_course_cost_salary();
    });
}


function get_course_cost_salary() {
    jQuery("#save_table").toggleClass("invisible", false);
    var course = document.getElementById("course").value;
    var uni = document.getElementById("uni").value;
    estimated_monthly_expenditure();
    if (course === "") return; // please select - possibly you want something else here

    jQuery.ajax(GITRAW + "Python/uni/" + uni + "_cost_salary.json", {
        async: true, success: function (cost_salary) {
            if (!LOCALISED) {
                cost_salary = JSON.parse(cost_salary);
            }
            document.getElementById("course_fees").innerHTML = "S$" + cost_salary[course]["cost"];
            document.getElementById("median_salary").innerHTML = "S$" + parseFloat(cost_salary[course]["median_salary"]).toFixed(2);
            document.getElementById("course_duration").innerHTML = cost_salary[course]["duration"] + " years";
            jQuery("#course_fees_wrapper").toggleClass("invisible", false);
            jQuery("#median_salary_wrapper").toggleClass("invisible", false);
            jQuery("#course_duration_wrapper").toggleClass("invisible", false);
            if (document.getElementById("study_loan").checked) {
                get_study_loan_repayment(parseInt(Math.ceil(parseFloat(cost_salary[course]["cost"]).toFixed(2) * parseFloat(cost_salary[course]["duration"]) / 100.0) * 100), jQuery("#slider-range-payback_period").slider("value"));
            } else {
                jQuery("#interest_rate_wrapper").toggleClass("invisible", true);
                jQuery("#monthly_repayment_wrapper").toggleClass("invisible", true);
            }

        }
    });
}

function prep_study_loan_api(amount, duration) {
    amount = amount.toLocaleString().replace(/,/g, '%2C');
    return 'https://cors-anywhere.herokuapp.com/' + "https://www.moneysmart.sg/ajax/singlewiz/getSingleWizTableData?channel=education-loan&channelSlug=education-loan&page=1&sort=&order=&limit=5&filters%5Bloan_amount%5D=" + amount + "&filters%5Bloan_tenure_unit%5D=years&filters%5Bloan_tenure%5D=" + duration + "&filters%5Blocation%5D=Local";
}

function process_study_loan_request(text) {
    var interest_rate, monthly_repayment;
    while (text.indexOf('class=\\"rate\\"><b>') !== -1) {
        interest_rate = text.slice(text.indexOf('class=\\"rate\\"><b>') + 'class=\\"rate\\"><b>'.length, text.search("%</b>Interest Rate"));
        monthly_repayment = text.slice(text.indexOf('\\\"month\\\"><b>$') + '\\\"month\\\"><b>$'.length, text.search("</b>Per Month"));
        if (isNaN(parseFloat(interest_rate)) || isNaN(parseFloat(monthly_repayment))) {
            text = text.slice(text.search("</b>Per Month") + "</b>Per Month".length);
            continue;
        } else {
            return [interest_rate, monthly_repayment];
        }
    }

    return [0, 0];
}

function get_study_loan_repayment(amount, duration) {
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var loan_info = process_study_loan_request(this.responseText);
            document.getElementById("interest_rate").innerHTML = loan_info[0] + "%";
            document.getElementById("monthly_repayment").innerHTML = 'S$' + loan_info[1];
            jQuery("#interest_rate_wrapper").toggleClass("invisible", false);
            jQuery("#monthly_repayment_wrapper").toggleClass("invisible", false);

        }
    });

    xhr.open("GET", prep_study_loan_api(amount, duration));
    xhr.send(data);

}

function save_table() {
    //.find("*").removeAttr("id")
    var to_append = jQuery("#course_selected").clone().toggleClass("comparison_column", true);
    to_append.find("input[name='save']").remove();
    to_append.appendTo("#comparison_table");
}

jQuery(function () {
    jQuery("#slider-range-payback_period").slider({
        range: false,
        min: 1,
        max: 10,
        step: 1,
        value: 3,
        slide: function (event, ui) {
            jQuery("#payback_period").val(ui.value + " years");
            get_course_cost_salary();
        }
    });
    jQuery("#payback_period").val(jQuery("#slider-range-payback_period").slider("value") + " years");
});
