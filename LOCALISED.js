const LOCALISED = 1; // set to 1 if using local server
var GITRAW;
if (!LOCALISED) {
    GITRAW = "https://raw.githubusercontent.com/vyshor/university_expense/master/";
} else {
    $.noConflict(); // seems like a bug that you must upload LOCALISED as 0 everytime otherwise it will know that $ sign doesn't exist
    GITRAW = "";
}
