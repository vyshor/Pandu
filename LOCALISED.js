const LOCALISED = 0; // set to 1 if using local server
var GITRAW;
if (!LOCALISED) {
    GITRAW = "https://raw.githubusercontent.com/vyshor/university_expense/master/";
} else {
    $.noConflict();
    GITRAW = "";
}
