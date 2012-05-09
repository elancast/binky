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

    case 'r'.charCodeAt(0):
    case 'R'.charCodeAt(0):
	showRewards();
	break;

    case 27:
    case 'q'.charCodeAt(0):
    case 'Q'.charCodeAt(0):
	closeOversets();
	break;

    case '?'.charCodeAt(0):
    case 'h'.charCodeAt(0):
    case 'H'.charCodeAt(0):
	showHelp();
	break;

    case '/'.charCodeAt(0):
	search();
	break;

    default:
	return;
    }
}

function blurry() {
    clear();
}

/* Called upon start-up, injects listener for keys */
function injectKeyListener() {
    window.onblur = function() { blurry(); };
    document.body.addEventListener('keydown', function() { handleMetaKey(); });
    document.body.addEventListener('keyup', function() { handleKeyPress(); });
}

/******************************************************************************/
// Help text

var GLOB_HELP_TEXT = [
    ["j", "Move down: Focus on the search result below the currently selected result."],
    ["k", "Move up: Focus on the search result above the currently selected result."],
    ["o or enter", "Open the currently selected result. For enter, can hold shift, meta key, or control."],
    ["l", "Center on the currently selected result."],
    ["r", "Show rewards messages."],
    ["h or ?", "Show this message."],
    ["/", "Focus on search box."],
    ["q or escape", "Close this box."]
];

/******************************************************************************/
// Action controllers for various keys pressed

var GLOB_resultsList = null;
var GLOB_currInd = -1; // -1 => search bar
var GLOB_lastElem = null;

var GLOB_help = null;
var GLOB_star = null;
var GLOB_rewardsDiv = null;

function unmarkCurr() {
    if (GLOB_lastElem != null) {
	removeFocus(GLOB_lastElem);
	GLOB_lastElem = null;
    }
    if (GLOB_star != null) {
	GLOB_star.style.display = "none";
    }
}

function move(goUp) {
    // Get the results list...
    if (GLOB_currInd <= 0) {
	GLOB_resultsList = findBingResults();
	if (GLOB_resultsList == null || GLOB_resultsList.length <= 0) {
	    console.error("Error gettng results list! uhohuhoh");
	    return;
	}
    }

    // Unmark the last element focused on...
    unmarkCurr();

    // Move within the list...
    GLOB_currInd += goUp ? -1 : 1;
    if (GLOB_currInd >= GLOB_resultsList.length) GLOB_currInd = -1;
    if (GLOB_currInd < 0) search();
    else {
	GLOB_lastElem = GLOB_resultsList[GLOB_currInd];
	GLOB_star = showFocus(GLOB_lastElem, GLOB_star);
    }
}

function unclear() {
    if (GLOB_currInd < 0) return;
    GLOB_lastElem = GLOB_resultsList[GLOB_currInd];
    GLOB_star = showFocus(GLOB_lastElem, GLOB_star);
}

function clear() {
    unmarkCurr();
    closeOversets();
    GLOB_currInd = -1;
}

// Focuses on the search bar
function search() {
    unmarkCurr();
    getSearchBar().focus();
    GLOB_currInd = -1;
    closeOversets();
}

function closeOversets() {
    closeRewards();
    closeHelp();
}

function closeRewards() {
    if (GLOB_rewardsDiv != null) {
	GLOB_rewardsDiv.style.display = "none";
    }
}

function closeHelp() {
    if (GLOB_help != null) {
	GLOB_help.style.display = "none";
    }
}

function showRewards() {
    closeOversets();
    if (GLOB_rewardsDiv != null) {
	// GLOB_rewardsDiv.style.display = "block";
	GLOB_rewardsDiv.parentElement.removeChild(GLOB_rewardsDiv);
    }
    loadRewards();
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

function showHelp() {
    closeOversets();
    if (GLOB_help == null) {
	GLOB_help = getTableOverset(GLOB_HELP_TEXT, ['Key', 'Description'],
				    ['center', 'left'], true);
    }
    GLOB_help.style.display = "block";
}

/******************************************************************************/
// Parses Bing!

// Returns the link string of the element. This is the first "a" tag within the
// elem. DFS to it yo.
function getElementLink(elem) {
    if (elem == null) return null;
    if (elem.tagName.toLowerCase() == 'a') {
	if (elem.getAttribute('href') != '#') return elem;
    }
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
	// Look for the signature container and add kids
	for (var i = 0; i < elem.children.length; i++) {
	    var child = elem.children[i];
	    if (child.getAttribute("class") == 'ansC') {
		addAnsC(resultsList, child);
	    }
	}
	break;

    default:
	console.warn("Unexpected class name: " + clas);
    }
}

function addAnsC(resultsList, cont) {
    if (cont == null) {
	console.error("unexepcted format");
	return;
    }

    // Add its kiddies
    for (var i = 0; i < cont.children.length; i++) {
	var child = cont.children[i];
	if (child.getAttribute("class") == 'ans') resultsList.push(child);
    }
}

// Adds anything useful between results beginning and results id tag
function addPreResults(resultsList) {
    var elem = document.getElementById("results_container");
    if (elem == null) return;
    for (var i = 0; i < elem.children.length; i++) {
	var kid = elem.children[i];
	var clas = kid.getAttribute("class");
	if (clas == "ansC") {
	    addAnsC(resultsList, kid);
	}
    }
}

function addByClass(resultsList, clas) {
    var elems = document.getElementsByClassName(clas);
    if (elems.length > 0) {
	resultsList.push(elems[elems.length - 1]);
    }
}

function addPageLinks(resultsList) {
    addByClass(resultsList, "sb_pagN");
    addByClass(resultsList, "sb_pagP");
}

/* Returns an array of results that could be iterated over via the keyboard */
function findBingResults() {
    // Ahh formatting weird. Hacky fix:
    var results = [];
    addPreResults(results);

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
    for (var i = 0; i < elem.children.length; i++) {
	var child = elem.children[i];
	if (!child.tagName || child.tagName.toLowerCase() != "li") continue;
	addResultsItem(results, child);
    }

    // Add page changing links
    addPageLinks(results);
    return results;
}

function getNextSibling(elem, orig, field) {
    if (elem == null) return null;
    if (elem.nextSibling) {
	if (orig == null ||
	    elem.nextSibling[field] > orig[field]) return elem.nextSibling;
	return getNextSibling(elem.nextSibling, orig, field);
    }
    return getNextSibling(elem.parentElement, orig, field);
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
    var bottom = getNextSibling(elem, elem, 'offsetTop').offsetTop;
    var top = elem.offsetTop;
    if (force || bottom >= seenBottom || top <= window.scrollY) {
	var middle = (top + bottom) / 2;
	var offBy = middle - (window.scrollY + height / 2);
	window.scrollBy(0, offBy + 10);
    }
}

/* Shows focus on the specific search result */
function showFocus(elem, img) {
    // Indicate
    elem.style.backgroundColor = "#F5F5DC";
    elem.focus();

    // Add a star next to it...
    if (img == null) {
	img = document.createElement("span");
	img.innerHTML = "*";
	img.style.left = "77px";
	img.style.fontSize = "76pt";
	//img.src = chrome.extension.getURL("img/arrow.jpg");
	img.style.position = "absolute";
	document.body.appendChild(img);
    }
    img.style.top = "" + (elem.offsetTop + 2) + "px";
    img.style.display = "block";

    // Scroll to have the element in the center if it is off the page
    centerOnElem(elem, false);
    return img;
}

/******************************************************************************/
// Rewards stuffs

function findMessage(elem) {
    if (elem == null) return null;
    if (elem.getAttribute("class") == "message") {
	var msg = elem.innerHTML;
	if (msg.indexOf('</b>&nbsp;') >= 0) {
	    msg = msg.replace('</b>&nbsp;', '</b><br>');
	}
	return msg;
    }
    for (var i = 0; i < elem.children.length; i++) {
	var ret = findMessage(elem.children[i]);
	if (ret != null) return ret;
    }
    return null;
}

function findStatus(elem) {
    if (elem == null) return null;
    if (elem.getAttribute("class") == "relative") {
	var stat = elem.innerHTML;
	if (stat.indexOf("<br> Credits Earned") >= 0) {
	    //stat = stat.replace("<br> Credits Earned", ' Credits Earned');
	    stat = stat.replace("<br> Credits Earned", '');
	}
	return stat;
    }
    for (var i = 0; i < elem.children.length; i++) {
	var ret = findStatus(elem.children[i]);
	if (ret != null) return ret;
    }
    return null;
}

function parseRewards(elem) {
    var rewards = [];
    for (var i = 0; i < elem.children.length; i++) {
	var kid = elem.children[i];
	if (kid.getAttribute("class") != 'item') continue;
	var msg = findMessage(kid);
	var stat = findStatus(kid);
	if (msg == null || stat == null) continue;
	rewards.push([ msg, stat ]);
    }
    return rewards;
}

function loadRewardsCallback() {
    if (this.readyState != 4) return;
    if (this.status != 200) {
	console.warn("Bad rewards response!");
    }

    // Get it in HTML form...mwahahaha
    var start = this.responseText.indexOf('<div id="messageContainer"');
    var end = this.responseText.indexOf('<div class="links">');
    if (start < 0 || end < 0) {
	console.error("Invalid start (" + start + ") or end (" + end
		      + ") for text " + this.responseText);
	return;
    }
    var divvy = document.createElement("div");
    divvy.innerHTML = this.responseText.substring(start, end);

    // Run through and find what we need
    var results = parseRewards(divvy.children[0]);
    GLOB_rewardsDiv = getTableOverset(results, ["Rewards message", "Status"],
				      ['left', 'center']);
}

function loadRewards() {
    var url = 'http://www.bing.com/rewardsapp/flyoutpage?style=v1';
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = loadRewardsCallback;
    xhr.open("GET", url, true);
    xhr.send();
}

/******************************************************************************/
// Functions for the table overset

function getTableOverset(rewards, headers, aligns, noClose) {
    var tably = tablizeItems(rewards, headers, aligns);
    var div = document.createElement("div");

    // Stylize
    div.style.position = "fixed";
    div.style.top = "150px";
    div.style.marginLeft = "170px";
    div.style.backgroundColor = "#FFFFCC";
    tably.style.width = "560px";
    tably.style.padding = "20px";

    // Border?
    div.style.borderStyle = "dashed";
    div.style.borderWidth = "3px";

    // Some useful info
    if (!noClose) {
	var tr = document.createElement("tr");
	tr.style.marginTop = "10px";
	var spanny = document.createElement("td");
	spanny.innerHTML = "<br>Press escape or q to close this.";
	tr.appendChild(spanny);
	tably.appendChild(tr);
    }

    // Give it kids
    div.appendChild(tably);
    document.body.appendChild(div);
    return div;
}

function tablizeItems(rewards, headers, aligns) {
    var table = document.createElement("table");
    var trh = document.createElement('tr');
    var th1 = document.createElement('th');
    var th2 = document.createElement('th');
    th1.innerHTML = headers[0];
    th2.innerHTML = headers[1];
    trh.appendChild(th1);
    trh.appendChild(th2);
    table.appendChild(trh);

    for (var i = 0; i < rewards.length; i++) {
	var rew = rewards[i];
	var tr = document.createElement('tr');
	var td1 = document.createElement('td');
	var td2 = document.createElement('td');

	// Create table stuff
	td1.innerHTML = rew[0];
	td2.innerHTML = rew[1];
	td1.style.textAlign = aligns[0];
	td2.style.textAlign = aligns[1];
	tr.appendChild(td1);
	tr.appendChild(td2);
	table.appendChild(tr);
    }
    return table;
}

/******************************************************************************/
// Main...

injectKeyListener();
