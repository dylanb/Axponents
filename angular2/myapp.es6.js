import {bootstrap, ElementRef, Directive} from 'angular2/angular2';
import {ComponentAnnotation as Component, ViewAnnotation as View} from "angular2/angular2";
import {AriaMenubar} from 'ariamenubar';
import {AriaMenu} from 'ariamenu';
import {AriaMenuitem} from 'ariamenuitem';

// console.log(Directive)

@Component({
    selector:'my-app'
})
@View({
    templateUrl: 'myapp.html',
    directives:[AriaMenubar, AriaMenuitem, AriaMenu]
})
class MyApp {
    elem:ElementRef;
    string:menuValue;
    constructor(el: ElementRef) {
        this.elem = el;
        this.menuValue = 'nothing';
    }
    handleMenuChange() {
        this.menuValue = this.elem.domElement.querySelector('aria-menubar').getAttribute('value');
        console.log("application menu changed", this.menuValue);
    }
}

bootstrap(MyApp);

