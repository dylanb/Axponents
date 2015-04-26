import {Component, View, bootstrap, NgElement} from 'angular2/angular2';
import {AriaMenubar} from 'ariamenubar';
import {AriaMenu} from 'ariamenu';
import {AriaMenuitem} from 'ariamenuitem';

@Component({
    selector:'my-app'
})
@View({
  template: `
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
    </aria-menubar>
    <div class="content">
        {{menuValue}}
    </div>
    <style>@import "myapp.css";</style>
    `,
    directives:[AriaMenubar, AriaMenuitem, AriaMenu]
})
class MyApp {
    elem:NgElement;
    string:menuValue;
    constructor(el: NgElement) {
        this.elem = el;
        this.menuValue = 'nothing';
    }
    handleMenuChange() {
        this.menuValue = this.elem.domElement.querySelector('aria-menubar').getAttribute('value');
        console.log("application menu changed", this.menuValue);
    }
}
bootstrap(MyApp);
