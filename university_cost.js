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
        }
    });
}

