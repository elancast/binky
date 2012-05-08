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
	console.log("DOWN");
	break;

    case 'k'.charCodeAt(0):
    case 'K'.charCodeAt(0):
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

function move(up) {

}


/******************************************************************************/
// Parses Bing!

/* Returns an array of results that could be iterated over via the keyboard */
function findBingResults() {

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
