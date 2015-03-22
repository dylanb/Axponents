import {Component, Template, bootstrap, NgElement} from 'angular2/angular2';
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
    menubar:any;
    constructor(el: NgElement) {
        this.menubar = el.domElement.shadowRoot.querySelector('aria-menubar');
    }
    handleMenuChange() {
        console.log("application menu changed", this.menubar.getAttribute('value'));
    }
}
bootstrap(MyApp);