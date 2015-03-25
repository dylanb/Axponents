import {Component, Template, bootstrap, NgElement} from 'angular2/angular2';
import {bind} from 'angular2/di';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {AriaMenubar} from 'myapp/ariamenubar';
import {AriaMenuitem} from 'myapp/ariamenuitem';
import {AriaMenu} from 'myapp/ariamenu';

@Component({
    selector:'my-app'
})
@Template({
  inline: `
    <aria-menubar (change)="handleMenuChange()">
        <aria-menuitem>
            <label>One</label>
            <aria-menu>
                <aria-menuitem value="oneone">
                    <label>One One</label>
                </aria-menuitem>
                <aria-menuitem value="onetwo">
                    <label>One Two</label>
                </aria-menuitem>
                <aria-menuitem value="onethree">
                    <label>One Three</label>
                </aria-menuitem>
            </aria-menu>
        </aria-menuitem>
        <aria-menuitem value="two">
            <label>Two</label>
        </aria-menuitem>
        <aria-menuitem>
            <label>Three</label>
            <aria-menu>
                <aria-menuitem value="threeone">
                    <label>Three One</label>
                </aria-menuitem>
                <aria-menuitem value="threetwo">
                    <label>Three Two</label>
                </aria-menuitem>
                <aria-menuitem value="threethree">
                    <label>Three Three</label>
                </aria-menuitem>
            </aria-menu>
        </aria-menuitem>
    </aria-menubar>`,
  directives:[AriaMenubar, AriaMenuitem, AriaMenu]
})
class MyApp {
    elem:NgElement;
    constructor(el: NgElement) {
        this.elem = el;
    }
    handleMenuChange() {
        console.log("application menu changed", this.elem.domElement.shadowRoot.querySelector('aria-menubar').getAttribute('value'));
    }
}
bootstrap(MyApp, 'function' === typeof document.body.createShadowRoot ?
    [bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy)] : undefined);
