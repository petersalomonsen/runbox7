import { TestBed, async, ComponentFixture, getTestBed, tick, fakeAsync } from '@angular/core/testing';
import { DialogModule } from './dialog.module';
import { ProgressSnackbarComponent } from './progresssnackbar.component';
import { MatSnackBar } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProgressService', () => {

    let injector: TestBed;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                DialogModule]
        }).compileComponents();
        injector = getTestBed();
    }));



    fit('should see changes in the progress snackbar', async(() => {
        const snackbar: MatSnackBar = injector.get(MatSnackBar);

        expect(snackbar.openFromComponent).toBeDefined();

        const comp = ProgressSnackbarComponent.create(snackbar);

        expect(injector.get(ProgressSnackbarComponent)).toBeDefined();
        console.log(injector.get(ProgressSnackbarComponent));
        comp.postMessage('Test1');
        tick(1000);

        const snackbarElement: HTMLElement = document.querySelector('snack-bar-container');

        expect(snackbarElement.innerText.trim()).toBe('Test1');
        comp.postMessage('Test2');
        tick(1000);

        expect(snackbarElement.innerText.trim()).toBe('Test2');
        comp.close();

        tick(1000);
        expect(document.querySelector('snack-bar-container')).toBeNull();
    }));
});
