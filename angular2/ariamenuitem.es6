import {Component, Template, NgElement, Parent, Ancestor} from 'angular2/angular2';
import {Optional} from 'angular2/di';
import {AriaMenubar} from 'myapp/ariamenubar';
import {AriaMenu} from 'myapp/ariamenu';

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

// Annotation section
@Component({
	selector: 'aria-menuitem',
	events: {
		'^blur': 'handleBlur($event)',
		'^focus': 'handleFocus($event)'
	},
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
	parent:any;
	domElement:any;
	menu:any;
	constructor(el: NgElement,
		@Optional() @Parent() parentMenubar: AriaMenubar,
		@Optional() @Parent() parentMenu: AriaMenu) {
		this.domElement = el.domElement;
		this.parent = (parentMenu !== null) ? parentMenu : parentMenubar;
		this.parent.registerChild(this);
		this.domElement.setAttribute('role', 'menuitem');

		// TODO: figure out how to do this via component APIs
		if (!this.domElement.previousElementSibling &&
			(this.domElement.parentNode.nodeName !== 'ARIA-MENU' || this.domElement.parentNode.hasAttribute('popup'))) {
			// only make this element focusable if it is the topmost first element in the tree
			this.domElement.tabIndex = 0;
		} else {
			this.domElement.tabIndex = -1;
		}

	}
	onDestroy(el: NgElement) {
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
		console.log('close');

		this.menu.removeFocus();

		this.domElement.classList.remove('open');
		this.domElement.tabIndex = 0;
		this.domElement.setAttribute('aria-expanded', false);
		this.domElement.focus();
	}
	open() {
		console.log('open');
		this.domElement.classList.add('open');
		this.domElement.tabIndex = -1;
		this.domElement.setAttribute('aria-expanded', true);

		var coords = getElementCoordinates(this.domElement);
		this.menu.takeFocus(coords.width, coords.left, coords.top, coords.height);
	}
	closeMenu() {
		this.close();
	}
	takeFocus() {
		this.domElement.tabIndex = 0;
		this.domElement.focus();
	}
	removeFocus() {
		this.domElement.tabIndex = -1;
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
					this.domElement.setAttribute('selected', 'true');
					this.value = '';
				} else {
					this.close();
					this.domElement.setAttribute('selected', 'false');
				}
			} else {
				this.domElement.dispatchEvent(new Event('change', {'bubbles': true, 'cancelable': true}));
				this.domElement.tabIndex = 0;
				this.domElement.focus();
				this.domElement.setAttribute('selected', 'true');
			}
		} else {
			if (this.hasMenu && this.menu.visible) {
				this.close();
			} else {
				this.domElement.tabIndex = -1;
			}
			this.domElement.setAttribute('selected', 'false');
		}
	}
	get selected() {
		return (this.domElement.getAttribute('selected') === 'true');
	}
	/*
	 * value property
	 */
	set value(value) {
		this.domElement.setAttribute('value', value);
	}
	get value() {
		return this.domElement.getAttribute('value');
	}
	/*
	 * width property
	 */
	set width(value) {
		this.domElement.style.width = value
		this.domElement.setAttribute('width', value);
	}
	/*
	 * hasMenu property
	 */
	get hasMenu() {
		return (this.domElement.getAttribute('aria-haspopup') === 'true');
	}
	set hasMenu(value) {
		if (value === true) {
			this.domElement.setAttribute('aria-expanded', false);
		}
		this.domElement.setAttribute('aria-haspopup', value);
	}
	/*
	 * visible property
	 */
	get visible() {
		return !(!this.domElement.offsetWidth || !this.domElement.offsetHeight)
	}
}
