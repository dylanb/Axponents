import {Component, Template, bootstrap, NgElement} from 'angular2/angular2';


function getElementCoordinates(node) {
	var coords = {
		"top": 0, "right": 0, "bottom": 0, "left": 0, "width": 0, "height": 0
	},
	xOffset, yOffset, rect;

	if (node) {
		xOffset = window.scrollX;
		yOffset = window.scrollY;
		rect = node.getBoundingClientRect();

		coords = {
			"top": rect.top + yOffset,
			"right": rect.right + xOffset,
			"bottom": rect.bottom + yOffset,
			"left": rect.left + xOffset,
			"width": rect.right - rect.left,
			"height": rect.bottom - rect.top
		};
	}
	return coords;
}

function close(menu, nextFocus, doFocus) {
	menu.classList.remove('open');
	nextFocus.classList.remove('open');
	nextFocus.tabIndex = 0;
	nextFocus.setAttribute('aria-expanded', false);
	if (doFocus) {
		nextFocus.focus();
	}
}

function open(nextFocus, currentFocus) {
	var coords;

	nextFocus.classList.add('open');
	currentFocus.classList.add('open');
	currentFocus.tabIndex = -1;
	coords = getElementCoordinates(currentFocus);
	nextFocus.style.width = coords.width + 'px';
	nextFocus.style.left = coords.left + 'px';
	nextFocus.style.top = coords.top + coords.height + 'px';
	currentFocus.setAttribute('aria-expanded', true);
	nextFocus.dispatchEvent(new CustomEvent('takefocus'));
}

function handleMenuClose(e) {
	// listen for the close of a child
	var span = this.querySelector('span');
	close(span, this);
	e.stopPropagation();
}

function isVisible (elem) {
	return !(!elem.offsetWidth || !elem.offsetHeight);
}

function getChildElements (us) {
	var elements = [];
	var children = Array.prototype.slice.call(us.children, 0);

	children.forEach(function (child) {
		if (child.nodeType === 1) {
			elements.push(child);
		}
	});
	return elements;
}

function getChildMenu(us) {
	var children = getChildElements(us);
	var menu = children.filter( function (child) {
		return child.nodeName == 'ARIA-MENU';
	});
	return menu;
}

function handleSelect() {
	var menu = getChildMenu(this);

	if (menu && menu.length) {
		if (!isVisible(menu[0])) {
			open(menu[0], this);
			this.setAttribute('selected', true);
		} else {
			close(menu[0], this);
			this.setAttribute('selected', false);
		}
	} else {
		this.dispatchEvent(new Event('change', {'bubbles': true, 'cancelable': true}));
		this.tabIndex = 0;
		this.focus();
		this.setAttribute('selected', true);
	}
}

function handleUnSelect() {
	var menu = getChildMenu(this);

	if (menu && menu.length && isVisible(menu[0])) {
		close(menu[0], this);
	} else {
		this.tabIndex = -1;
		this.setAttribute('selected', false);
	}
}

// Annotation section
@Component({
	selector: 'aria-menuitem',
	lifecycle: [ 'onDestroy' ]
})
@Template({
	inline: `
	<content select="label"></content>
	<content select="aria-menu,aria-menuitem"></content>
	<style>@import "aria-menuitem.css";</style>
	`
})
// Component controller
export class AriaMenuitem {
	constructor(el: NgElement) {
		var us = el.domElement;

		us.setAttribute('role', 'menuitem');
		us.style.width = us.getAttribute('width');
		// Set the span to the same width as ourselves
		// because the absolute positioning picks
		// up on the width of the whole document and we want to be
		// responsive
		if (!us.previousElementSibling &&
			(us.parentNode.nodeName !== 'ARIA-MENU' || us.parentNode.hasAttribute('popup'))) {
			// only make this element focusable if it is the topmost first element in the tree
			us.tabIndex = 0;
		} else {
			us.tabIndex = -1;
		}

		// look for sub-menus
		var menu = getChildMenu(us);
		if (menu && menu.length) {
			us.setAttribute('aria-haspopup', true);
			us.setAttribute('aria-expanded', false);
		}

		// handle events
		us.addEventListener('aria-menuclose', handleMenuClose, false);
		us.addEventListener('selectmenu', handleSelect, false);
		us.addEventListener('unselectmenu', handleUnSelect, false);
	}
	onDestroy(el: NgElement) {
		var us = el.domElement;
		us.removeEventListener('aria-menuclose', handleMenuClose, false);
		us.removeEventListener('selectmenu', handleSelect, false);
		us.removeEventListener('unselectmenu', handleUnSelect, false);		
	}
}
