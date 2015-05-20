import {Component, View, NgElement, PropertySetter, EventEmitter, Query, QueryList} from 'angular2/angular2';
import {AriaMenuitem} from 'ariamenuitem';

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;

@Component({
	selector: 'aria-menubar',
	events: ['change'],
	hostListeners: {
		'^keydown': 'onKeydown($event)',
		'^click': 'onClick($event)'
	}
})
@View({
	template: '<content></content>'
})
export class AriaMenubar {
	children: Array<any>;
	change:EventEmitter;
	valueSetter:Function;

	_value: string;

	constructor(
		// @Query(AriaMenuitem) query: QueryList<AriaMenuitem>,
		@PropertySetter('attr.role') roleSetter: Function,
		@PropertySetter('attr.value') valueSetter: Function
		) {
		var link;
		this.change = new EventEmitter();
		this.valueSetter = valueSetter;
		this.children = [];
		roleSetter('menubar');
		// console.log(query);
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
		return (numChildren === 1);
	}
	setSelected(child) {
		this.children.forEach(function (ch) {
			if (ch !== child) {
				ch.selected = false;
			}
		});
	}
	/*
	 * Event handlers
	 */
	onClick(e) {
		this.openOrSelect(e);
	}
	openOrSelect (e) {
		this.children.forEach(function (child) {
			if (child.isMyDomOrLabel(e.target) && !child.selected) {
				child.selected = true;
			} else if (child.isMyDomOrLabel(e.target)) {
				child.selected = false;
			} else if (child.hasMenu) {
				child.selected = false;
			}
		});
		e.preventDefault();
		e.stopPropagation();
	}
	onKeydown(e) {
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
	/*
	 * Getters and setters
	 */
	/*
	 * value property
	 */
	get value() {
		return this._value;
	}
	set value(value) {
		this._value = value;
		this.valueSetter(value);
		this.change.next(null);
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
