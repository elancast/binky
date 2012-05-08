/******************************************************************************/
// Emily Lancaster
// shortcuts.js
/******************************************************************************/

/******************************************************************************/
// Keyboard part of this project

// Keydown fires for everything. Keyup doesn't fire
function handleMetaKey() {
    if (!event.metaKey) return;
    handleKeyPress();
}

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

    // Get the key
    var keyId = event.keyIdentifier;
    var key = keyId.toLowerCase() == "enter" ? 13 :
	parseInt(keyId.substring(keyId.indexOf("+") + 1), 16);

    // Be careful if control or alt or meta are pressed...don't want to override
    if (key != 13) {
	if (event.ctrlKey || event.altKey || event.altGraphKey
	    || event.metaKey) return;
    }

    // Start the proper action
    switch (key) {
    case 'j'.charCodeAt(0):
    case 'J'.charCodeAt(0):
	move(false);
	break;

    case 'k'.charCodeAt(0):
    case 'K'.charCodeAt(0):
	move(true);
	break;

    case 13:
    case 'o'.charCodeAt(0):
    case 'O'.charCodeAt(0):
	open(event);
	break;

    case 'l'.charCodeAt(0):
    case 'L'.charCodeAt(0):
	centerScreen();
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
    document.body.addEventListener('keydown', function() { handleMetaKey(); });
    document.body.addEventListener('keyup', function() { handleKeyPress(); });
}

/******************************************************************************/
// Action controllers for various keys pressed

var GLOB_resultsList = null;
var GLOB_currInd = -1; // -1 => search bar
var GLOB_lastElem = null;

function move(goUp) {
    // Get the results list...
    if (GLOB_currInd <= 0) {
	GLOB_resultsList = findBingResults();
    }

    // Unmark the last element focused on...
    if (GLOB_lastElem != null) {
	removeFocus(GLOB_lastElem);
	GLOB_lastElem = null;
    }

    // Move within the list...
    GLOB_currInd += goUp ? -1 : 1;
    if (GLOB_currInd < 0) {
	getSearchBar().focus();
	GLOB_currInd = -1;
    } else {
	GLOB_currInd %= GLOB_resultsList.length;
	GLOB_lastElem = GLOB_resultsList[GLOB_currInd];
	showFocus(GLOB_lastElem);
    }
}

// Opens the currently focused thing. If meta key, opens in new tab.
function open(keyEvent) {
    if (GLOB_lastElem == null) {
	console.error("Trying to open link when haven't visited anything...");
	return null;
    }

    // Get the link tag and create a click event
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true,
		       window, 0, 0, 0, 0, 0,
		       keyEvent.ctrlKey, keyEvent.altKey,
		       keyEvent.shiftKey, keyEvent.metaKey, 0, null);
    var linkTag = getElementLink(GLOB_lastElem);

    // Replay the event if all is well!
    if (linkTag == null) {
	console.error("Could not find link tag!");
	return;
    }
    linkTag.dispatchEvent(evt);
}

function centerScreen() {
    if (GLOB_lastElem == null) return;
    centerOnElem(GLOB_lastElem, true);
}

/******************************************************************************/
// Parses Bing!

// Returns the link string of the element. This is the first "a" tag within the
// elem. DFS to it yo.
function getElementLink(elem) {
    if (elem == null) return null;
    if (elem.tagName.toLowerCase() == 'a') return elem; // return elem.getAttribute("href");
    for (var i = 0; i < elem.children.length; i++) {
	var linky = getElementLink(elem.children[i]);
	if (linky != null) return linky;
    }
    return null;
}

function getSearchBar() {
    var elem = document.getElementById("sb_form_q");
    if (elem != null) return elem;
    return document.getElementsByTagName("input")[0];
}

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

function getNextSibling(elem) {
    if (elem == null) return null;
    return elem.nextSibling ? elem.nextSibling :
	getNextSibling(elem.parentElement);
}

/******************************************************************************/
// Handles UI part of this project

/* Removes focus from the search result */
function removeFocus(elem) {
    elem.style.backgroundColor = "white";
}

function centerOnElem(elem, force) {
    var height = window.innerHeight;
    var seenBottom = height + window.scrollY;
    var bottom = getNextSibling(elem).offsetTop, top = elem.offsetTop;
    if (force || bottom >= seenBottom || top <= window.scrollY) {
	var middle = (top + bottom) / 2;
	var offBy = middle - (window.scrollY + height / 2);
	window.scrollBy(0, offBy + 10);
    }
}

/* Shows focus on the specific search result */
function showFocus(elem) {
    // Indicate
    elem.style.backgroundColor = "#F5F5DC";
    elem.focus();

    // Scroll to have the element in the center if it is off the page
    centerOnElem(elem, false);
}

/******************************************************************************/
// Main...

injectKeyListener();
