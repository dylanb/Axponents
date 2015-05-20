import {ElementRef} from 'angular2/angular2';
import {Parent} from 'angular2/src/core/annotations_impl/visibility';
import {Optional} from 'angular2/src/di/annotations_impl';
import {Attribute} from 'angular2/src/core/annotations_impl/di';
import {ComponentAnnotation as Component, ViewAnnotation as View} from "angular2/angular2";
import {AriaMenu} from 'ariamenu';
import {AriaMenubar} from 'ariamenubar';

// Annotation section
@Component({
	selector: 'aria-menuitem',
	hostListeners: {
		'^blur': 'handleBlur($event)',
		'^focus': 'handleFocus($event)'
	},
	hostProperties: {
		'role': 'attr.role',
		'value': 'attr.value',
		'tabindex': 'tabindex',
		'expanded': 'attr.aria-expanded',
		'haspopup': 'attr.aria-haspopup',
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

	_value: string;

	role: string;

	expanded: boolean;

	haspopup: boolean;

	tabindex: number;

	constructor(el: ElementRef,
		@Attribute('value') value:string,
		@Optional() @Parent() parentMenu: AriaMenu,
		@Optional() @Parent() parentMenubar: AriaMenubar) {
		this.domElement = el.domElement;
		this.parent = (parentMenu !== null) ? parentMenu : parentMenubar;

		this.role = 'menuitem';

		this._hasMenu = false;
		this._selected = false;
		this._value = value;

		if (this.parent.registerChild(this)) {
			this.tabindex = 0;
		} else {
			this.tabindex = -1;
		}

	}
	/*
	 * Event handlers
	 */
	handleBlur(e) {
		this.parent.blur();
	}
	handleFocus(e) {
		this.parent.focus();
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
	close(dontFocus) {
		this.menu.removeFocus();

		this.tabindex = 0;
		this.expanded = false;
		if (!dontFocus) {
			this.domElement.focus();
		} else {
			this._selected = false;
		}
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
		this.tabindex = -1;
		this.expanded = true;

		var coords = getElementCoordinates(this.domElement);
		this.menu.takeFocus(coords.width, coords.left, coords.top, coords.height);
	}
	closeMenu() {
		this.close();
	}
	takeFocus() {
		this.tabindex = 0;
		this.domElement.focus();
	}
	removeFocus() {
		this.tabindex = -1;
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
				this.tabindex = 0;
				this.domElement.focus();
				this._selected = true;
				this.parent.value = this.value;
				this.parent.setSelected(this);
			}
		} else {
			if (this.hasMenu && this.menu.visible) {
				this.close();
			} else {
				this.tabindex = -1;
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
			this.expanded = false;
		}
		this.haspopup = value;
		this._hasMenu = value;
	}
	/*
	 * visible property
	 */
	get visible() {
		return !(!this.domElement.offsetWidth || !this.domElement.offsetHeight)
	}
}
