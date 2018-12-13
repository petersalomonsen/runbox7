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

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-search-expression-builder',
  templateUrl: './search-expression-builder.component.html',
  styleUrls: ['./search-expression-builder.component.scss']
})
export class SearchExpressionBuilderComponent implements OnInit {

  @Input()
  searchInputField: HTMLInputElement;

  @Input()
  toSearchInputField: HTMLInputElement;

  @Input()
  fromSearchInputField: HTMLInputElement;

  subjectSearchInputFieldDisplayValue: string;
  @Input()
  subjectSearchInputField: HTMLInputElement;

  dateSearchInputFieldDisplayValue: string;
  @Input()
  dateSearchInputField: HTMLInputElement;

  @Input()
  freeTextSearchInputField: HTMLInputElement;

  @Input()
  currentFolder: string;

  constructor() { }

  ngOnInit() {
    this.subjectSearchInputFieldDisplayValue = this.subjectSearchInputField.style.display;
    this.subjectSearchInputField.onkeyup = () => this.rebuildSearchExpression();
    this.dateSearchInputFieldDisplayValue = this.dateSearchInputField.style.display;
    this.dateSearchInputField.onkeyup = () => this.rebuildSearchExpression();
  }

  rebuildSearchExpression() {
    let firstExpression = true;
    const and = () => {
      if (firstExpression) {
        firstExpression = false;
        return '';
      } else {
        return ' AND ';
      }
    };
    this.searchInputField.value = (this.subjectSearchInputField.value ?
        `${and()}subject:"${this.subjectSearchInputField.value}"` : '') +
        (this.toSearchInputField.value ?
          `${and()}to:"${this.toSearchInputField.value}"` : '') +
        (this.fromSearchInputField.value ?
          `${and()}from:"${this.fromSearchInputField.value}"` : '') +
        (this.dateSearchInputField.value ?
          `${and()}date:${this.dateSearchInputField.value}` : '') +
        (this.freeTextSearchInputField.value ?
        `${and()}(${this.freeTextSearchInputField.value})` : '');
    this.searchInputField.dispatchEvent(new Event('keyup'));
  }

  setSearchInputField(val: string) {
    this.searchInputField.value = val;
    this.searchInputField.dispatchEvent(new Event('keyup'));
  }

  toggleVisible(element: HTMLInputElement) {
    if (element.style.display === 'none') {
      element.style.display = this.subjectSearchInputFieldDisplayValue;
    } else {
      element.style.display = 'none';
    }
  }

  subject() {
    this.toggleVisible(this.subjectSearchInputField);
  }

  from() {
    this.setSearchInputField('from:"Type from address here"');
  }

  to() {
    this.setSearchInputField('to:"Type to address here"');
  }

  removeTimezoneFromDate(date: Date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  }

  selectYear(event: Date) {
    const d = this.removeTimezoneFromDate(event);
    this.dateSearchInputField.value = `${d.getFullYear()}`;
    this.dateSearchInputField.dispatchEvent(new Event('keyup'));
  }

  selectMonth(event: Date) {
    const d = this.removeTimezoneFromDate(event);
    this.dateSearchInputField.value = `${d.toJSON().replace(/\-/g, '').substring(0, 'yyyyMM'.length)}`;
    this.dateSearchInputField.dispatchEvent(new Event('keyup'));
  }

  selectDate(event: any) {
    const d = this.removeTimezoneFromDate(event.value);
    this.dateSearchInputField.value = `${d.toJSON().replace(/\-/g, '').substring(0, 'yyyyMMdd'.length)}`;
    this.dateSearchInputField.dispatchEvent(new Event('keyup'));
  }

  limitToSelectedFolder() {
    let currentInputFieldValue = this.searchInputField.value;
    let folder: string;

    if (this.currentFolder) {
      folder = this.currentFolder.replace(/\//g, '\.');
    } else {
      // For RMM6
      folder = document.getElementById('rmm_current_folder_name').innerText;
    }

    if (currentInputFieldValue.indexOf('folder') > -1) {
      currentInputFieldValue = '';
    }

    this.searchInputField.value = `folder:"${folder}" AND ` +
      `${currentInputFieldValue ? currentInputFieldValue : 'yourtext'}`;

    this.searchInputField.dispatchEvent(new Event('keyup'));
  }


}
