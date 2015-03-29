import {Component, Template, NgElement} from 'angular2/angular2';
import {EventEmitter} from 'angular2/src/core/annotations/di';
import {AriaMenuitem} from 'myapp/ariamenuitem';

var supportsShadowDOM = ('function' === typeof document.body.createShadowRoot);
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;

@Component({
	selector: 'aria-menubar',
	lifecycle: [ 'onDestroy' ],
	events: {
		'^keydown': 'onKeydown($event)',
		'^blur': 'onBlur($event)',
		'^focus': 'onFocus($event)',
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
	domElement:any;
	menuChanged:Function;
	constructor(el: NgElement, @EventEmitter('menuchanged') menuChanged: Function) {
		this.domElement = el.domElement;
		this.menuChanged = menuChanged;
		this.children = [];
		this.domElement.setAttribute('role', 'menubar');
		if (!supportsShadowDOM) {
			var link = document.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.setAttribute('href', 'aria-combined.css');
			document.body.appendChild(link);
		}
	}
	onDestroy(el: NgElement) {
	}
	/*
	 * API
	 */
	registerChild(child) {
		this.children.push(child);
		var numChildren = this.children.length;
		// set the width of the children to responsively fill the
		// whole menu bar
		this.children.forEach(function (child) {
			child.width = 99/numChildren + '%'
		});
	}
	/*
	 * Event handlers
	 */
	onChange(e) {
		var currentValue, newValue;
		if (e.target !== this.domElement) {
			currentValue = this.value;
			newValue = e.target.getAttribute('value');
			if (currentValue !== newValue) {
				this.value = newValue;
			}
		}
	}
	onClick(e) {
		console.log('onClick');
		this.openOrSelect(e);
	}
	openOrSelect (e) {
		this.children.forEach(function (child) {
			if (child.isMyDomOrLabel(e.target) && !child.selected) {
				child.selected = true;
			} else if (child.isMyDomOrLabel(e.target)) {
				child.selected = false;
			} else if (child.hasMenu) {
				// TODO: this results in selected items in other menus or at the top level still having the selected attribute set
				child.selected = false;
			}
		});
		e.preventDefault();
		e.stopPropagation();
	}
	onKeydown(e) {
		console.log('onKeydown');
		var which = e.which || e.keyCode;
		var handled = false;
		var keysWeHandle = [KEY_LEFT,KEY_RIGHT,KEY_UP,KEY_DOWN,KEY_ENTER];

		if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
			return;
		}
		if (keysWeHandle.indexOf(which) !== -1) {
			switch(which) {
				case KEY_LEFT:
					this._focusPrev(e);
					handled = true;
					break;
				case KEY_RIGHT:
					this._focusNext(e);
					handled = true;
					break;
				case KEY_DOWN:
				case KEY_ENTER:
					this.openOrSelect(e);
					handled = true;
					break;
			}
			if (handled) {
				e.preventDefault();
				e.stopPropagation();
			}
		}
	}
	onBlur(e) {
		console.log('onBlur');
	}
	onFocus(e) {
		console.log('onFocus');
	}
	/*
	 * Getters and setters
	 */
	get value() {
		return this.domElement.getAttribute('value');
	}
	set value(value) {
		this.domElement.setAttribute('value', value);
		this.menuChanged(null);
	}
	/*
	 * Helpers
	 */
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
}

