import {Component, Template, NgElement, Parent, Ancestor} from 'angular2/angular2';
import {Optional} from 'angular2/di';
import {AriaMenuitem} from 'myapp/ariamenuitem';

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;
var KEY_ESC = 27;
var blurTimer;

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
	selector: 'aria-menu',
	events: {
		'^click': 'handleClick($event)',
		'^blur': 'handleBlur($event)',
		'^focus': 'handleFocus($event)',
		'^keydown': 'handleKeyDown($event)'
	},
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
	children: Array<any>;
	parent:any;
	domElement:any;
	blurTimer:any;
	constructor(el: NgElement,
		@Optional() @Parent() parentMenuitem: AriaMenuitem) {
		this.domElement = el.domElement;

		this.parent = parentMenuitem;
		this.parent.registerChild(this);
		this.children = [];
		this.domElement.setAttribute('role', 'menu');
		// TODO: figure out how to unbind this when needed
		this.domElement.addEventListener('change', handleChange, false);
	}
	onDestroy(el: NgElement) {
		this.domElement.removeEventListener('change', handleChange, false);
	}
	registerChild(child) {
		this.children.push(child);
	}
	handleClick(e) {
		var children = this.children.filter(function (child) {
			return child.visible;
		});
		children.forEach(function (child) {
			if (child.isMyDomOrLabel(e.target)) {
				child.selected = true;
				child.takeFocus();
			} else {
				child.selected = false;
				child.removeFocus();
			}
		});
		e.stopPropagation(); // stop clicks from going outside
		e.preventDefault();
	}
	handleKeyDown(e) {
		var which = e.which || e.keyCode;
		var handled = false;
		var keysWeHandle = [KEY_RIGHT,KEY_LEFT,KEY_ESC,KEY_UP,KEY_DOWN,KEY_ENTER];

		if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
			return;
		}
		if (keysWeHandle.indexOf(which) !== -1) {
			switch(which) {
				case KEY_UP:
					this.focusPrev(e);
					handled = true;
					break;
				case KEY_RIGHT:
					// TODO: handle sub-sub-menu
					handled = true;
					break;
				case KEY_LEFT:
				case KEY_ESC:
					this.close(e);
					handled = true;
					break;
				case KEY_DOWN:
					this.focusNext(e);
					handled = true;
					break;
				case KEY_ENTER:
					this.handleClick(e);
					handled = true;
					break;
			}
			if (handled) {
				e.preventDefault();
				e.stopPropagation();
			}
		}
	}
	focusNext(e) {
		var index;
		var children = this.children.filter(function(child) {
			return child.visible;
		});
		children.forEach(function (child, ind) {
			if (child.isMyDomOrLabel(e.target)) {
				index = ind;
			}
		});
		children[index].removeFocus();
		if (index < children.length - 1) {
			index += 1;
		} else {
			index = 0;
		}
		children[index].takeFocus();
	}
	focusPrev(e) {
		var index;
		var children = this.children.filter(function(child) {
			return child.visible;
		});
		children.forEach(function (child, ind) {
			if (child.isMyDomOrLabel(e.target)) {
				index = ind;
			}
		});
		children[index].removeFocus();
		if (index > 0) {
			index -= 1;
		} else {
			index = children.length - 1;
		}
		children[index].takeFocus();
	}
	takeFocus(width, left, top, height) {
		this.value = '';
		this.domElement.classList.add('open');
		this.domElement.style.width = width + 'px';
		this.domElement.style.left = left + 'px';
		this.domElement.style.top = top + height + 'px';
		this.children.forEach(function (child) {
			child.removeFocus();
		});
		this.children[0].takeFocus();
	}
	removeFocus() {
		this.domElement.classList.remove('open');
	}
	close() {
		this.parent.selected = false;
	}
	handleBlur(e) {
		var that = this;
		console.log('menu blur');
		// TODO: commented out until this bug gets fixed https://github.com/angular/angular/issues/1050
		if (!this.blurTimer) {
			// this.blurTimer = setTimeout(function () {
			// 	console.log('timeout');
			// 	that.close();
			// 	this.blurTimer = undefined;
			// }, 100);
		}
	}
	handleFocus(e) {
		console.log('menu focus');
		if (this.blurTimer) {
			clearTimeout(this.blurTimer);
			this.blurTimer = undefined;
		}
	}
	set value(value) {
		this.domElement.setAttribute('value', value);
	}
	get value() {
		return this.domElement.getAttribute('value');
	}
	get visible() {
		return !(!this.domElement.offsetWidth || !this.domElement.offsetHeight)
	}
}

