import {Component, Template, NgElement} from 'angular2/angular2';
import {EventEmitter} from 'angular2/src/core/annotations/di';
import {AriaMenuitem} from 'myapp/ariamenuitem';

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

function handleBlur(e) {
	console.log('menubar blur');
}

function handleFocus(e) {
	console.log('menubar focus');
}

@Component({
	selector: 'aria-menubar',
	lifecycle: [ 'onDestroy' ],
	events: {
		'^keydown': 'onKeydown($event)',
		'^change': 'onChange($event)',
		'^click': 'onClick($event)'
	}
})
@Template({
	inline: `
	<content></content>
	<style>@import "aria-menubar.css";</style>
	`
})
// Component controller
export class AriaMenubar {
	children: Array<any>;
	value: any;
	domElement:any;
	menuChanged:Function;
	constructor(el: NgElement, @EventEmitter('menuchanged') menuChanged: Function) {
		this.domElement = el.domElement;
		this.menuChanged = menuChanged;
		this.children = [];
		var nodes = getChildElements(this.domElement);

		this.domElement.setAttribute('role', 'menubar');
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
		this.domElement.addEventListener('keydown', handleKeyDown, false);
		this.domElement.addEventListener('click', openOrSelect, false);
		if (!supportsShadowDOM) {
			var link = document.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.setAttribute('href', 'aria-combined.css');
			document.body.appendChild(link);
		}
		this.domElement.addEventListener('blur', handleBlur, false);
		this.domElement.addEventListener('focus', handleFocus, false);
	}
	onDestroy(el: NgElement) {
		this.domElement.removeEventListener('keydown', handleKeyDown, false);
		this.domElement.removeEventListener('click', openOrSelect, false);
		this.domElement.removeEventListener('blur', handleBlur, false);
		this.domElement.removeEventListener('focus', handleFocus, false);
	}
	onChange(e) {
		var currentValue, newValue;
		if (e.target !== this.domElement) {
			currentValue = this.domElement.getAttribute('value');
			newValue = e.target.getAttribute('value');
			if (currentValue !== newValue) {
				this.domElement.setAttribute('value', newValue);
				this.menuChanged(null);
			}
		}
	}
	onClick(e) {
		console.log('onClick');
	}
	onKeydown(e) {
		console.log('onKeydown');
	}
	registerChild(child) {
		this.children.push(child);
	}
}

