import { SearchService, XAPIAN_GLASS_WR } from './searchservice';
import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { RunboxWebmailAPI, RunboxMe } from '../rmmapi/rbwebmail';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule, MatDialogModule } from '@angular/material';
import { ProgressService } from '../http/progress.service';
import { MessageListService } from '../rmmapi/messagelist.service';
import { XapianAPI } from './rmmxapianapi';
import { xapianLoadedSubject } from './xapianwebloader';
import { Observable } from 'rxjs';

declare var FS;
declare var IDBFS;
declare var Module;

fdescribe('SearchService', () => {

    let injector: Injector;
    let httpMock: HttpTestingController;

    beforeEach((() => {
        TestBed.configureTestingModule({
          imports: [
            HttpClientTestingModule,
            MatSnackBarModule,
            MatDialogModule
          ],
          providers: [ SearchService,
            ProgressService,
            MessageListService,
            RunboxWebmailAPI
          ]
        });

        injector = TestBed.get(Injector);
        httpMock = injector.get(HttpTestingController);
    }));

    it('should load searchservice, but no local index', async () => {
        const searchService = injector.get(SearchService);
        const req = httpMock.expectOne(`/rest/v1/me`);
        req.flush( { result: {
                uid: 555
            } as RunboxMe
        });
        expect(await searchService.initSubject.toPromise()).toBeFalsy();
        expect(searchService.localSearchActivated).toBeFalsy();

        await new Promise(resolve => {
            const idbreq = window.indexedDB.deleteDatabase('/' + searchService.localdir);
            idbreq.onsuccess = () => resolve();
        });

        console.log('deleted db', searchService.localdir);
    });

    it('should create local index and load searchservice', async () => {
        const testuserid = 444;
        const localdir =  'rmmsearchservice' + testuserid;

        await xapianLoadedSubject.toPromise();

        FS.mkdir(localdir);
        FS.mount(IDBFS, {}, '/' + localdir);
        FS.chdir('/' + localdir);

        const xapianapi = new XapianAPI();
        xapianapi.initXapianIndex(XAPIAN_GLASS_WR);
        const visibleFrom = 'Test person';
        xapianapi.addSortableEmailToXapianIndex(
            'Q' + 22,
            visibleFrom,
            visibleFrom.toUpperCase(),
            'test@example.com',
            'recipient@example',
            'Testsubject',
            'testsubject222',
            '20190223123322',
            22,
            'Message text content',
            'Inbox',
            false,
            false,
            false,
            false
        );
        xapianapi.commitXapianUpdates();
        xapianapi.closeXapianDatabase();
        FS.writeFile('indexLastUpdateTime', '' + new Date().getTime(), { encoding: 'utf8' });

        await new Promise(resolve => FS.syncfs(false, resolve));
        console.log('index created');

        console.log(FS.readdir('.'));
        FS.chdir('..');
        FS.unmount('/' + localdir);
        FS.rmdir(localdir);

        console.log(FS.readdir('.'));
        // Close indexeddb
        Object.keys(IDBFS.dbs).forEach(k => IDBFS.dbs[k].close());
        IDBFS.dbs = {};

        const searchService = injector.get(SearchService);
        const req = httpMock.expectOne(`/rest/v1/me`);
        req.flush( { result: {
                uid: testuserid
            } as RunboxMe
        });

        expect(await searchService.initSubject.toPromise()).toBeTruthy();
        // expect(searchService.localSearchActivated).toBeTruthy();
        expect(localdir).toEqual(searchService.localdir);
    });
});
