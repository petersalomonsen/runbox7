import { Component } from '@angular/core';
import { MatSnackBarRef, MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

@Component({
    template: `{{progressmessage | async}}`
})
export class ProgressSnackbarComponent {
    progressmessage = new BehaviorSubject<string>('');

    snackbarRef: MatSnackBarRef<ProgressSnackbarComponent>;

    public static create(
        snackBar: MatSnackBar,
    ): ProgressSnackbarComponent {
        const ref = snackBar.openFromComponent(ProgressSnackbarComponent);
        ref.instance.snackbarRef = ref;
        return ref.instance;
    }

    postMessage(message: string) {
        this.progressmessage.next(message);
    }

    close() {
        this.snackbarRef.dismiss();
    }
}
