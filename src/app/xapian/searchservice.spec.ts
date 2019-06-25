import { SearchService, XAPIAN_GLASS_WR } from './searchservice';
import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { RunboxWebmailAPI, RunboxMe, FolderCountEntry } from '../rmmapi/rbwebmail';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule, MatDialogModule } from '@angular/material';
import { ProgressService } from '../http/progress.service';
import { MessageListService } from '../rmmapi/messagelist.service';
import { XapianAPI } from './rmmxapianapi';
import { xapianLoadedSubject } from './xapianwebloader';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

declare var FS;
declare var IDBFS;
declare var Module;

describe('SearchService', () => {

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
        const folders = [
            [1, 1, 2, 'inbox', 'Inbox', 'Inbox', 0 ],
            [2, 0, 0, 'spam', 'Spam', 'Spam', 0],
            [3, 0, 0, 'trash', 'Trash', 'Trash', 0 ]
        ];

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
        const indexLastUpdateTime = new Date().getTime();
        FS.writeFile('indexLastUpdateTime', '' +  indexLastUpdateTime, { encoding: 'utf8' });

        await new Promise(resolve => FS.syncfs(false, resolve));
        console.log('index created');

        FS.chdir('..');
        FS.unmount('/' + localdir);
        FS.rmdir(localdir);

        // Close indexeddb
        Object.keys(IDBFS.dbs).forEach(k => IDBFS.dbs[k].close());
        IDBFS.dbs = {};

        const searchService = injector.get(SearchService);
        let req = httpMock.expectOne(`/rest/v1/me`);
        req.flush( { result: {
                uid: testuserid
            } as RunboxMe
        });

        req = httpMock.expectOne('/ajax?action=ajax_getfoldercount');
        req.flush(folders);

        expect(await searchService.initSubject.toPromise()).toBeTruthy();
        expect(searchService.localSearchActivated).toBeTruthy();
        expect(localdir).toEqual(searchService.localdir);

        expect(indexLastUpdateTime).toEqual(searchService.indexLastUpdateTime);

        req = httpMock.expectOne('/ajax?action=ajax_getfoldercount');
        req.flush(folders);

        await new Promise(resolve => setTimeout(resolve, 100));

        const messageListService = injector.get(MessageListService);
        expect(messageListService.trashFolderName).toEqual('Trash');
        expect(messageListService.spamFolderName).toEqual('Spam');
        expect(messageListService.folderCountSubject.value.length).toBe(3);

        const testMessageId = 3463499;
        await new Promise(resolve => setTimeout(resolve, 100));
        req = httpMock.expectOne('/mail/download_xapian_index?' +
            'listallmessages=1&page=0&sinceid=0&sincechangeddate=' + Math.floor(indexLastUpdateTime / 1000) +
            '&pagesize=1000&skipcontent=1');
        const testMessageTime = 1561442028;
        req.flush(testMessageId + '\t' + testMessageTime + '\t1561389614\tInbox\t1\t0\t0\t' +
            'Cloud Web Services <cloud-marketing-email-replies@cloudsuperhosting.com>\ttest@example.com	Analyse Data at Scale\ty');

        await new Promise(resolve => setTimeout(resolve, 100));

        const sincechangeddate = new Date(indexLastUpdateTime - new Date().getTimezoneOffset() * 60 * 1000);
        const datestring = sincechangeddate.toJSON().replace('T', ' ').substr(0, 'yyyy-MM-dd HH:mm:ss'.length);

        req = httpMock.expectOne(`/rest/v1/list/deleted_messages/${datestring}`);
        req.flush({
            message_ids: []
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        req = httpMock.expectOne('/rest/v1/email/' + testMessageId);
        req.flush({
            result: {
                text: {
                    text: 'message body test text SecretSauceFormula'
                }
            }
        });

        for (let n = 0; n < 10; n++) {
            if (indexLastUpdateTime !== searchService.indexLastUpdateTime) {
                break;
            }
            console.log('wait for polling server and update index', n);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        expect(searchService.indexLastUpdateTime).toBe(testMessageTime * 1000);

        expect(searchService.api.sortedXapianQuery('SecretSauceFormula', 0, 0, 0, 100, -1).length).toBe(1);
        expect(searchService.api.getXapianDocCount()).toBe(2);
    });
});
