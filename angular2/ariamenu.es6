import {Component, Template, bootstrap, NgElement} from 'angular2/angular2';

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;
var KEY_ESC = 27;

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

function focusNext(e) {
	var children = getChildElements(this);
	var index;
	console.log('focusNext: ', e.target);
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
	console.log('focusNext: ', e.target);
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

function close(e) {
	this.parentNode.dispatchEvent(new CustomEvent('unselectmenu'));
	this.parentNode.tabIndex = 0;
	this.parentNode.focus();
}

function handleKeyDown (e) {
	var which = e.which || e.keyCode;
	var handled = false;
	var keysWeHandle = [KEY_RIGHT,KEY_LEFT,KEY_ESC,KEY_UP,KEY_DOWN,KEY_ENTER];

	if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
		return;
	}
	if (keysWeHandle.indexOf(which) !== -1) {
		switch(which) {
			case KEY_UP:
				focusPrev.call(this, e);
				console.log('KEY_UP');
				handled = true;
				break;
			case KEY_RIGHT:
				console.log('KEY_RIGHT');
				handled = true;
				break;
			case KEY_LEFT:
			case KEY_ESC:
				console.log('KEY_LEFT');
				close.call(this, e);
				handled = true;
				break;
			case KEY_DOWN:
				focusNext.call(this, e);
				console.log('KEY_DOWN');
				handled = true;
				break;
			case KEY_ENTER:
				handleClick.call(this, e);
				console.log('KEY_ENTER');
				handled = true;
				break;
		}
		if (handled) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
}

function handleClick(e) {
	console.log('menu click');
	var children = getChildElements(this);
	children.forEach(function (child) {
		if (child === e.target) {
			// select (open if sub-menu otherwise click)
			children[0].tabIndex = 0;
			child.dispatchEvent(new CustomEvent('selectmenu'));
		} else {
			// unselect (close if open)
			children[0].tabIndex = -1;
			child.dispatchEvent(new CustomEvent('unselectmenu'));
		}
	});
	e.stopPropagation(); // stop clicks from going outside
	e.preventDefault();
}

function takeFocus(e) {
	console.log('takefocus');
	this.setAttribute('value', ''); // clear the value
	var children = getChildElements(this);
	children.forEach(function (child) {
		child.tabIndex = -1;
	});
	children[0].tabIndex = 0;
	children[0].focus();
}

function handleChange(e) {
	var currentValue, newValue;
	if (e.target !== this) {
		currentValue = this.getAttribute('value');
		newValue = e.target.getAttribute('value');
		console.log('menu change: ', currentValue, ', ', newValue);
		if (currentValue !== newValue) {
			this.setAttribute('value', newValue);
			this.dispatchEvent(new Event('change', {'bubbles': true, 'cancelable': true}));
			console.log('menu change');
		}
		e.stopPropagation();
		e.preventDefault();
	}
}

@Component({
	selector: 'aria-menu',
	lifecycle: [ 'onDestroy' ]
})
@Template({
	inline: `
	<content></content>
	<style>@import "aria-menu.css";</style>
	`
})
// Component controller
export class AriaMenu {
	constructor(el: NgElement) {
		console.log('menu constructor');
		var us = el.domElement;
		us.setAttribute('role', 'menu'); // hide the element in the emulated environments
		var shadowRoot = us.shadowRoot;
		var content = shadowRoot.querySelector('content');
		var nodes = content.getDistributedNodes();
		// TODO: figure out how to unbind this when needed
		us.addEventListener('keydown', handleKeyDown, false);
		us.addEventListener('takefocus', takeFocus, false);
		us.addEventListener('click', handleClick, false);
		us.addEventListener('change', handleChange, false);
	}
	onDestroy(el: NgElement) {
		console.log('menu onDestroy');
		us.removeEventListener('keydown', handleKeyDown, false);
		us.removeEventListener('takefocus', takeFocus, false);
		us.removeEventListener('click', handleClick, false);
	}
}

