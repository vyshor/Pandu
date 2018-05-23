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
    })
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
    }

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
    })
    // On change
    document.getElementById("housing").onchange = function () {
        var housing = this.value;
        if (housing === "") return; // please select - possibly you want something else here

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
    }
}

function get_house_price() {
    var data = {'country':'singapore', 'regionInput':null, 'cityInput':null, 'locationInput':'Ang Mo Kio', 'districtInput':'20', 'houseTypeInput':'HDB', 'roomTypeInput':'Executive'};

    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
        }
    });
    xhr.open("POST", "http://microservice.dev.bambu.life/api/generalCalculator/houseCostCalculatorV2s/getHousePrice");
    xhr.send(data);
}