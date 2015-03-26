import {Component, Template, bootstrap, NgElement, PropertySetter} from 'angular2/angular2';

var supportsShadowDOM = ('function' === typeof document.body.createShadowRoot);
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;

function isVisible (elem) {
	return !(!elem.offsetWidth || !elem.offsetHeight);
}

function getChildElements (us) {
	var elements = [];
	var child = us.firstChild;

	while (child) {
		if (child.nodeType === 1 && isVisible(child)) {
			elements.push(child);
		}
		child = child.nextSibling;
	}
	return elements;
}

function openOrSelect (e) {
	var children = getChildElements(this);
	var that = this;
	children.forEach(function (child) {
		if ((child === e.target || child.querySelector('label') === e.target) &&
			child.getAttribute('selected') !== 'true') {
			// select (open if sub-menu otherwise click)
			child.setAttribute('selected', true);
			that.setAttribute('value', '');
			child.dispatchEvent(new CustomEvent('selectmenu'));
		} else if (child !== e.target) {
			// unselect (close if open)
			child.dispatchEvent(new CustomEvent('unselectmenu'));
			child.setAttribute('selected', false);
		} else {
			// toggling the menu open state
			child.dispatchEvent(new CustomEvent('selectmenu'));
		}
	});
	e.preventDefault();
	e.stopPropagation();
}

function focusNext(e) {
	var children = getChildElements(this);
	var index;
	children = children.filter(function(child) {
		return isVisible(child);
	});
	children.forEach(function (child, ind) {
		if (child === e.target) {
			index = ind;
		}
	});
	if (index < children.length - 1) {
		index += 1;
	} else {
		index = 0;
	}
	e.target.tabIndex = -1;
	children[index].tabIndex = 0;
	children[index].focus();
}

function focusPrev(e) {
	var children = getChildElements(this);
	var index;
	children = children.filter(function(child) {
		return isVisible(child);
	});
	children.forEach(function (child, ind) {
		if (child === e.target) {
			index = ind;
		}
	});
	if (index > 0) {
		index -= 1;
	} else {
		index = children.length - 1;
	}
	e.target.tabIndex = -1;
	children[index].tabIndex = 0;
	children[index].focus();
}

function handleKeyDown (e) {
	var which = e.which || e.keyCode;
	var handled = false;
	var keysWeHandle = [KEY_LEFT,KEY_RIGHT,KEY_UP,KEY_DOWN,KEY_ENTER];

	if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
		return;
	}
	if (keysWeHandle.indexOf(which) !== -1) {
		switch(which) {
			case KEY_LEFT:
				focusPrev.call(this, e);
				handled = true;
				break;
			case KEY_RIGHT:
				focusNext.call(this, e);
				handled = true;
				break;
			case KEY_DOWN:
			case KEY_ENTER:
				openOrSelect.call(this, e);
				handled = true;
				break;
		}
		if (handled) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
}

function handleChange(e) {
	var currentValue, newValue;
	if (e.target !== this) {
		currentValue = this.getAttribute('value');
		newValue = e.target.getAttribute('value');
		if (currentValue !== newValue) {
			this.setAttribute('value', newValue);
			this.dispatchEvent(new Event('change', {'bubbles': true, 'cancelable': true}));
		}
		e.stopPropagation();
		e.preventDefault();
	}
}


@Component({
	selector: 'aria-menubar',
	lifecycle: [ 'onDestroy' ]
})
@Template({
	inline: `
	<content></content>
	<style>@import "aria-menubar.css";</style>
	`
})
// Component controller
export class AriaMenubar {
	constructor(el: NgElement, @PropertySetter('title') propSetter: Function) {
		var us = el.domElement;
		var nodes = getChildElements(us);

		us.setAttribute('role', 'menubar');
		// set the width of the children to responsively fill the
		// whole menu bar
		var children = 0;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].nodeType === 1) {
				children++;
			}
		}
		for (i = 0; i < nodes.length; i++) {
			if (nodes[i].nodeType === 1) {
				nodes[i].setAttribute('width', 99/children + '%');
			}
		}
		// TODO: figure out how to unbind this when needed
		us.addEventListener('keydown', handleKeyDown, false);
		us.addEventListener('click', openOrSelect, false);
		us.addEventListener('change', handleChange, false);

		if (!supportsShadowDOM) {
			var link = document.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.setAttribute('href', 'aria-combined.css');
			document.body.appendChild(link);
		}
	}
	onDestroy(el: NgElement) {
		var us = el.domElement;
		us.removeEventListener('keydown', handleKeyDown, false);
		us.removeEventListener('click', openOrSelect, false);
		us.removeEventListener('change', handleChange, false);
	}
}

