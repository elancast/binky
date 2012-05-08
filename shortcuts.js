/******************************************************************************/
// Emily Lancaster
// shortcuts.js
/******************************************************************************/

/******************************************************************************/
// Keyboard part of this project

/*
 * Handles a key press. Only pays attention if it is a keyboard shortcut not on
 * an input text box.
 */
function handleKeyPress() {
    if (event == null || event.keyIdentifier == null) {
	console.error("Invalid keyup!");
	return;
    }

    // Ignore key presses on the input search element
    var tag = event.srcElement != null ? event.srcElement.tagName : null;
    if (tag.toLowerCase() == 'input') return;

    // Ignore if control or alt or meta are pressed...don't want to override
    if (event.ctrlKey || event.altKey || event.altGraphKey || event.metaKey) {
	return;
    }

    // Start the proper action
    var keyId = event.keyIdentifier;
    var key = keyId.toLowerCase() == "enter" ? 13 :
	parseInt(keyId.substring(keyId.indexOf("+") + 1), 16);
    switch (key) {
    case 'j'.charCodeAt(0):
    case 'J'.charCodeAt(0):
	move(false);
	console.log("DOWN");
	break;

    case 'k'.charCodeAt(0):
    case 'K'.charCodeAt(0):
	move(true);
	console.log("UP");
	break;

    case 13:
    case 'o'.charCodeAt(0):
    case 'O'.charCodeAt(0):
	console.log("ENTER");
	break;

    case '?'.charCodeAt(0):
	console.log("QUESTION");
	break;

    case '/'.charCodeAt(0):
	console.log("SEARCH");
	break;

    default:
	return;
    }
}

/* Called upon start-up, injects listener for keys */
function injectKeyListener() {
    document.body.addEventListener('keyup', function() { handleKeyPress(); });
}

/******************************************************************************/
// Action controllers for various keys pressed

var GLOB_resultsList = null;
var GLOB_currInd = -1; // -1 => search bar

function move(goUp) {
    // Get the results list...
    if (GLOB_currInd <= 0) {
	GLOB_resultsList = findBingResults();
	console.log(GLOB_resultsList.length);
	console.log(GLOB_resultsList);
    }

    // Move within the list...
    GLOB_currInd += goUp ? -1 : 1;
    
}


/******************************************************************************/
// Parses Bing!

function addResultsItem(resultsList, elem) {
    // Get the class and return if it's not expected
    // TODO: return if not expected or return if expected badness?? how often
    // do things change??
    var clas = elem.getAttribute("class");
    switch (clas) {
    case 'sa_wr':
	resultsList.push(elem);
	break;

    case 'si_pp':
	return;

    case 'sb_ans':
	// Get the container....
	var cont = null;
	for (var i = 0; i < elem.children.length; i++) {
	    var child = elem.children[i];
	    if (child.getAttribute("class") == 'ansC') {
		cont = child;
		break;
	    }
	}
	if (cont == null) {
	    console.error("unexepcted format");
	    return;
	}

	// Add its kiddies
	for (var i = 0; i < cont.children.length; i++) {
	    var child = cont.children[i];
	    if (child.getAttribute("class") == 'ans') resultsList.push(child);
	}
	break;

    default:
	console.warn("Unexpected class name: " + clas);
    }
}

/* Returns an array of results that could be iterated over via the keyboard */
function findBingResults() {
    // Get the parent tag of all results
    var resultsElem = document.getElementById("results");
    var elem = null;
    for (var i = 0; i < resultsElem.children.length; i++) {
	var child = resultsElem.children[i];
	if (child.tagName && child.tagName.toLowerCase() == "ul") {
	    elem = child;
	    break;
	}
    }
    if (elem == null) return null;

    // Add all of its children to a list of possible elements
    var results = [];
    for (var i = 0; i < elem.children.length; i++) {
	var child = elem.children[i];
	if (!child.tagName || child.tagName.toLowerCase() != "li") continue;
	addResultsItem(results, child);
    }
    return results;
}

/******************************************************************************/
// Handles UI part of this project

/* Removes focus from the search result */
function removeFocus() {

}

/* Shows focus on the specific search result */
function showFocus() {

}

/******************************************************************************/
// Main...

injectKeyListener();
