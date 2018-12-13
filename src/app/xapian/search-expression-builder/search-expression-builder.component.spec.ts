// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2018 Runbox Solutions AS (runbox.com).
// 
// This file is part of Runbox 7.
// 
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
// 
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchExpressionBuilderComponent } from './search-expression-builder.component';
import { MatMenuModule, MatIconModule, MatInputModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchExpressionBuilderComponent', () => {
  let component: SearchExpressionBuilderComponent;
  let fixture: ComponentFixture<SearchExpressionBuilderComponent>;

  const searchInputField = document.createElement('input');
  searchInputField.style.display = 'block';
  document.documentElement.appendChild(searchInputField);

  const toSearchInputField = document.createElement('input');
  toSearchInputField.style.display = 'inline';
  document.documentElement.appendChild(toSearchInputField);

  const fromSearchInputField = document.createElement('input');
  fromSearchInputField.style.display = 'inline';
  document.documentElement.appendChild(fromSearchInputField);

  const subjectSearchInputElement = document.createElement('input');
  subjectSearchInputElement.style.display = 'inline';
  document.documentElement.appendChild(subjectSearchInputElement);

  const dateSearchInputElement = document.createElement('input');
  dateSearchInputElement.style.display = 'inline';
  document.documentElement.appendChild(dateSearchInputElement);

  const freeTextSearchInputField = document.createElement('input');
  freeTextSearchInputField.style.display = 'block';
  document.documentElement.appendChild(freeTextSearchInputField);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatMenuModule,
        MatIconModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      declarations: [ SearchExpressionBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchExpressionBuilderComponent);
    component = fixture.componentInstance;

    component.searchInputField = searchInputField;
    component.subjectSearchInputField = subjectSearchInputElement;
    component.freeTextSearchInputField = freeTextSearchInputField;
    component.toSearchInputField = toSearchInputField;
    component.fromSearchInputField = fromSearchInputField;
    component.dateSearchInputField = dateSearchInputElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should toggle input fields and create expressions', () => {
    component.subject();
    expect(subjectSearchInputElement.style.display).toBe('none');

    component.subject();
    expect(subjectSearchInputElement.style.display).toBe('inline');

    subjectSearchInputElement.value = 'testsubject';
    subjectSearchInputElement.dispatchEvent(new Event('keyup'));
    expect(component.searchInputField.value).toBe('subject:"testsubject"');

    freeTextSearchInputField.value = 'some text';
    subjectSearchInputElement.dispatchEvent(new Event('keyup'));
    expect(component.searchInputField.value).toBe('subject:"testsubject" AND (some text)');

    component.selectYear(new Date());
    expect(component.searchInputField.value).toBe(`subject:"testsubject" AND date:${new Date().getFullYear()} AND (some text)`);
  });
});
