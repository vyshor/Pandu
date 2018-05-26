function house_price_on_load() {

    // Set the default all locations, and change the housing when location changed
    // Default
    jQuery.ajax(GITRAW + "Python/house_locations/" + "All" + ".json", {
        async: false, success: function (houses) {
            if (!LOCALISED) {
                houses = JSON.parse(houses);
            }
            jQuery.each(houses, function (i, item) {
                jQuery('#housing').append(jQuery('<option>', {
                    value: item,
                    text: item
                }));
            });
            jQuery('#housing').val('All');
        }
    });
    // On change
    document.getElementById("location").onchange = function () {
        var location = this.value;
        if (location === "") return; // please select - possibly you want something else here

        jQuery.ajax(GITRAW + "Python/house_locations/" + location + ".json", {
            async: false, success: function (houses) {
                const selected_value = jQuery('#housing').val();
                jQuery('#housing')
                    .find('option')
                    .remove()
                    .end();
                if (!LOCALISED) {
                    houses = JSON.parse(houses);
                }
                jQuery.each(houses, function (i, item) {
                    jQuery('#housing').append(jQuery('<option>', {
                        value: item,
                        text : item
                    }));
                });
                jQuery('#housing').val(selected_value);
            }
        });
        location_dropdown_to_kml(location);
    };

    // Set the default all housing, and change the location when housing changed
    // Default
    jQuery.ajax(GITRAW + "Python/room_types/" + "All" + ".json", {
        async: false, success: function (location) {
            if (!LOCALISED) {
                location = JSON.parse(location);
            }
            jQuery.each(location, function (i, item) {
                jQuery('#location').append(jQuery('<option>', {
                    value: item,
                    text: item
                }));
            });
            jQuery('#location').val('All');
        }
    });
    // On change
    housing_on_change();
    update_slider_loan_period();
}

function housing_on_change () {
    jQuery('.housing').change(function () {
        var housing = this.value;
        if (housing === "") return; // please select - possibly you want something else here

        jQuery('.housing').val(housing);
        jQuery.ajax(GITRAW + "Python/room_types/" + housing + ".json", {
            async: false, success: function (housing) {
                const selected_value = jQuery('#location').val();
                jQuery('#location')
                    .find('option')
                    .remove()
                    .end();
                if (!LOCALISED) {
                    housing = JSON.parse(housing);
                }
                jQuery.each(housing, function (i, item) {
                    jQuery('#location').append(jQuery('<option>', {
                        value: item,
                        text : item
                    }));
                });
                jQuery('#location').val(selected_value);
            }
        });
    });
}

function prepare_api_inputs_house_monthly(house_price, months_to_go, downpayment_pct) {
    return "house_price=" + house_price + "&months_to_go="+ months_to_go+ "&downpayment_pct=" + downpayment_pct;
}

function prepare_api_inputs_house_price() {
    var location = jQuery('#location').val();
    var housing = jQuery('#housing').val().split(" ");
    // Process the housing picked
    if (housing[0] !== 'Executive') {
        housing[0] = housing[0][0].toLowerCase() + housing[0].substr(1);
    }
    if (housing[1] !== 'HDB') {
        housing[1] = housing[1][0].toLowerCase() + housing[1].substr(1);
    }
    // Process the location picked
    location = location.replace(/ /g, "%20");

    return "country=Singapore&locationInput=" + location + "&houseTypeInput=" + housing[1] + "&roomTypeInput=" + housing[0];
}

function get_house_monthly(house_price, loan_period) {
    var data = JSON.stringify(false);

    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var monthly_payment = this.responseText;
            monthly_payment = JSON.parse(monthly_payment);
            monthly_payment = monthly_payment['MinMonthlyPayment'];
            jQuery('#house_price').html(parseInt(house_price).toLocaleString());
            jQuery('#down_payment').html(parseInt(0.2 * parseFloat(house_price)).toLocaleString());
            jQuery('#house_monthly').html(parseInt(monthly_payment).toLocaleString());
        }
    });

    xhr.open("GET", "http://dev.bambu.life:8081/api/MortgageCalculator?" + prepare_api_inputs_house_monthly(house_price,loan_period*12,0.2));

    xhr.send(data);
}

function get_house_price() {
    var data = JSON.stringify(false);
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;
    const loan_period = parseInt(jQuery('#loan_period').val());

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var house_price = JSON.parse(this.responseText);
            house_price = parseFloat(house_price['housePrice'][0]['price']).toFixed(2);
            get_house_monthly(house_price, loan_period);
        }
    });

    xhr.open("GET", "http://microservice.dev.bambu.life/api/generalCalculator/houseCostCalculatorV2s/getHousePrice?" + prepare_api_inputs_house_price());

    xhr.send(data);
}

function update_slider_loan_period () {
    jQuery(function () {
        jQuery(".slider-range-loan_period").slider({
            range: false,
            min: 5,
            max: 40,
            step: 1,
            value: 10,
            slide: function (event, ui) {
                jQuery(".loan_period").val(ui.value + " years");
                jQuery(".slider-range-loan_period").slider("value", ui.value);
            }
        });
        jQuery(".loan_period").val(jQuery(".slider-range-loan_period").slider("value") + " years");
    });
}
