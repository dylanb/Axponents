import {Component, Template, NgElement, Parent, PropertySetter} from 'angular2/angular2';
import {EventEmitter} from 'angular2/src/core/annotations/di';
import {Optional} from 'angular2/di';
import {AriaMenuitem} from 'myapp/ariamenuitem';

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;
var KEY_ESC = 27;
var blurTimer;

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
	menuChanged:Function;
	constructor(el: NgElement,
		@Optional() @Parent() parentMenuitem: AriaMenuitem,
		@EventEmitter('menuchanged') menuChanged: Function) {

		// remember our DOM element
		this.domElement = el.domElement;

		this.menuChanged = menuChanged;
		this.parent = parentMenuitem;
		this.parent.registerChild(this);
		this.children = [];
		this.domElement.setAttribute('role', 'menu');
	}
	onDestroy(el: NgElement) {
	}
	/*
	 * Our API
	 */
	registerChild(child) {
		this.children.push(child);
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
	setSelected(child) {
		this.children.forEach(function (ch) {
			if (ch !== child) {
				ch.selected = false;
			}
		});
		if (this.parent !== null) {
			this.parent.selectAndClose();
		}
	}
	close() {
		this.parent.selected = false;
	}
	/*
	 * Helper functions
	 */
	_focusNext(e) {
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
	_focusPrev(e) {
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
	/*
	 * event handlers
	 */
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
					this._focusPrev(e);
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
					this._focusNext(e);
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
	handleBlur(e) {
		var that = this;
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
		if (this.blurTimer) {
			clearTimeout(this.blurTimer);
			this.blurTimer = undefined;
		}
	}
	/*
	 * Property getters and setters
	 */
	/*
	 * value property
	 */
	set value(value) {
		this.domElement.setAttribute('value', value);
		if (value !== '') {
			if (this.parent === null) {
				// If the menu is standalone
				this.menuChanged(null);
			} else {
				// cascade the value
				this.parent.value = value;
			}
		}
	}
	get value() {
		return this.domElement.getAttribute('value');
	}
	/*
	 * visible property
	 */
	get visible() {
		return !(!this.domElement.offsetWidth || !this.domElement.offsetHeight)
	}
}

