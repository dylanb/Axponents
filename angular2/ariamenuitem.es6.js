import {Component, View, NgElement, Parent, PropertySetter, Attribute} from 'angular2/angular2';
import {Optional} from 'angular2/src/di/annotations';
import {AriaMenu} from 'ariamenu';
import {AriaMenubar} from 'ariamenubar';

// Annotation section
@Component({
	selector: 'aria-menuitem',
	hostListeners: {
		'^blur': 'handleBlur($event)',
		'^focus': 'handleFocus($event)'
	}
})
@View({
	template: '<content></content>'
})
export class AriaMenuitem {
	parent:any;

	domElement:any;

	menu:any;

	_hasMenu:Boolean;
	_selected:Boolean;
	_value:string;

	ariaExpandedSetter:PropertySetter;
	ariaHaspopupSetter:PropertySetter;
	tabindexSetter:PropertySetter;
	valueSetter:PropertySetter;

	constructor(el: NgElement,
		@Attribute('value') value:string,
		@PropertySetter('tabindex') tabindexSetter: Function,
		@PropertySetter('attr.role') roleSetter: Function,
		@PropertySetter('attr.value') valueSetter: Function,
		@PropertySetter('attr.aria-expanded') ariaExpandedSetter: Function,
		@PropertySetter('attr.aria-haspopup') ariaHaspopupSetter: Function,
		@Optional() @Parent() parentMenu: AriaMenu,
		@Optional() @Parent() parentMenubar: AriaMenubar) {
		this.domElement = el.domElement;
		this.parent = (parentMenu !== null) ? parentMenu : parentMenubar;

		roleSetter('menuitem');

		this._hasMenu = false;
		this._selected = false;
		this._value = value;

		this.ariaExpandedSetter = ariaExpandedSetter;
		this.ariaHaspopupSetter = ariaHaspopupSetter;
		this.valueSetter = valueSetter;
		this.tabindexSetter = tabindexSetter;

		if (this.parent.registerChild(this)) {
			this.tabindexSetter(0);
		} else {
			this.tabindexSetter(-1);
		}

	}
	/*
	 * Event handlers
	 */
	handleBlur(e) {
		this.domElement.parentNode.dispatchEvent(new Event('blur'));
	}
	handleFocus(e) {
		this.domElement.parentNode.dispatchEvent(new Event('focus'));
	}
	/*
	 * API
	 */
	registerChild(child) {
		this.menu = child;
		this.hasMenu = true;
	}
	isMyDomElement(domElement:any) {
		var retVal = (this.domElement === domElement);
		return retVal;
	}
	isMyDomOrLabel(domElement:any) {
		var retVal = ((this.domElement === domElement) ||
				(this.domElement.querySelector('label') === domElement));
		return retVal;
	}
	close() {
		this.menu.removeFocus();

		this.tabindexSetter(0);
		this.ariaExpandedSetter(false);
		this.domElement.focus();
	}
	open() {
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
		this.tabindexSetter(-1);
		this.ariaExpandedSetter(true);

		var coords = getElementCoordinates(this.domElement);
		this.menu.takeFocus(coords.width, coords.left, coords.top, coords.height);
	}
	closeMenu() {
		this.close();
	}
	takeFocus() {
		this.tabindexSetter(0);
		this.domElement.focus();
	}
	removeFocus() {
		this.tabindexSetter(-1);
	}
	selectAndClose() {
		this.selected = true; // this will close the menu
		this.parent.setSelected(this); // reset all peer elements to not selected
	}
	/*
	 * Getters and Setters
	 */
	/*
	 * selected property
	 */
	set selected(value) {
		if (value === true) {
			if (this.hasMenu) {
				if (!this.menu.visible) {
					this.open();
					this._selected = true;
					this.value = '';
				} else {
					this.close();
					this._selected = false;
				}
			} else {
				this.tabindexSetter(0);
				this.domElement.focus();
				this._selected = true;
				this.parent.value = this.value;
				this.parent.setSelected(this);
			}
		} else {
			if (this.hasMenu && this.menu.visible) {
				this.close();
			} else {
				this.tabindexSetter(-1);
			}
			this._selected = false;
		}
	}
	get selected() {
		return this._selected;
	}
	/*
	 * value property
	 */
	set value(value) {
		this.valueSetter(value);
		this._value = value;
		if (value !== '') {
			this.parent.value = value; //cascade
		}
	}
	get value() {
		return this._value;
	}
	/*
	 * width property
	 */
	set width(value) {
		this.domElement.style.width = value
	}
	/*
	 * hasMenu property
	 */
	get hasMenu() {
		return this._hasMenu;
	}
	set hasMenu(value) {
		if (value === true) {
			this.ariaExpandedSetter(false);
		}
		this.ariaHaspopupSetter(value);
		this._hasMenu = value;
	}
	/*
	 * visible property
	 */
	get visible() {
		return !(!this.domElement.offsetWidth || !this.domElement.offsetHeight)
	}
}
