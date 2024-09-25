import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep, includes, set } from 'lodash';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})

export class MainComponent implements OnInit {
  dbId: string | null = null; // Variable to store dynamic path

  // constrcutor
  constructor(private route: ActivatedRoute, private Api: ApiService, private fb: FormBuilder) { }
  title = 'ui';
  
  docs: any;
  activeTabIndex = 0;
  dbs = {
    totalSize: 0,
    databases: [],
  };
  isLoadingDbs = false;
  menuData: any;
  stats = {
    databases: 0,
    collections: 0,
    size: 0,
  };
  /* Forms related stuff */
  // Forms
  addDBForm!: FormGroup;
  addTableForm!: FormGroup;
  dropTableForm!: FormGroup;
  /* tab related operations */
  tabs = [];
  /* collection related operations */
  // create new collection
  addTableLoader = false;
  // drop collection
  dropTableLoader = false;
  /* methods to open & close Modals */
  addDB = false;
  addTable = false;
  dropTable = false;
  active = 'databases';
  db: any;

  /* side-nav */
  getDatabases() {
    this.isLoadingDbs = true;
    this.Api.getDbs()
      .subscribe(
        (res: any) => {
          this.dbs = res;
          this.computeStats();
          this.menuData = cloneDeep(this.dbs.databases);
          if (this.active === 'collections') this.showCollections(this.db);
        }
      )
      .add(() => {
        this.isLoadingDbs = false;
      });
  }
  reloadSideNav() {
    this.getDatabases();
  }
  computeStats() {
    this.stats.databases = this.dbs.databases.length;
    this.stats.collections = this.dbs.databases.reduce(
      (count, db) => count + db.collections.length,
      0
    );
    this.stats.size = this.dbs.totalSize;
  }

  mustMatch(controlName, matchingControlName) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors.confirmedValidator
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  initForms() {
    this.addTableForm = this.fb.group({
      database: [null, [Validators.required]],
      collection: [null, [Validators.required]],
    });
    this.addDBForm = this.fb.group({
      database: [null, [Validators.required]],
      collection: [null, [Validators.required]],
    });
    this.dropTableForm = this.fb.group(
      {
        database: [null, [Validators.required]],
        collection: [null, [Validators.required]],
        confirmCollection: [null, [Validators.required]],
      },
      {
        validators: this.mustMatch('collection', 'confirmCollection'),
      }
    );
  }
  ngOnInit() {
    this.dbId = this.route.snapshot.paramMap.get('dbId');
    this.Api.setDbId(this.dbId);
    this.getDatabases();
    this.initForms();
  }

  expand(e, database) {
    if (includes(e.target.classList, 'collection_item')) return;
    this.closeAllTabs();
    e.stopPropagation();
    e.target.classList.toggle('open');
    this.showCollections(database);
  }

  activateTab(index) {
    this.activeTabIndex = index;
  }
  openTab(database, collection) {
    const id = `${database}.${collection}`;
    const tabIndex = this.tabs.findIndex((tab) => tab.id === id);
    if (tabIndex > -1) {
      this.activateTab(tabIndex);
      return;
    }
    this.tabs.push({
      id,
      database,
      collection,
    });
    this.activateTab(this.tabs.length - 1);
  }
  closeTab(id) {
    this.active = 'databases';
    const idx = this.tabs.findIndex((tab) => tab.id === id);
    this.tabs.splice(idx, 1);
    if (this.tabs.length) {
      this.activeTabIndex = this.tabs.length - 1;
    }
  }
  showCollections(database) {
    this.Api.getCollections(database.name)
      .subscribe((res:any) => {
        set(database, 'collections', res);
        this.db = database;
        this.active = 'collections';
      });
  }
  closeTabsByDataBase(database) {
    this.tabs = this.tabs.filter((tab) => tab.database !== database);
  }
  closeAllTabs() {
    this.tabs = [];
  }
  openDashBoard() {
    this.active = 'databases';
    this.closeAllTabs();
  }
  createTable() {
    if (!this.addTableForm.valid) { return; }

    this.addTableLoader = true;

    const body = this.addTableForm.value;
    this.Api.createCollection(body)
      .subscribe(() => {
        this.getDatabases(); // re-renders side nav
        this.openTab(body.database, body.collection);
        this.closeModal('addTable');
      })
      .add(() => {
        this.addTableLoader = false;
      });
  }
  dropCollection() {
    if (!this.dropTableForm.valid) { return; }

    this.dropTableLoader = true;

    const body = this.dropTableForm.value;
    this.Api.dropCollection(body)
      .subscribe(() => {
        this.getDatabases(); // re-render side nav
        this.closeTab(`${body.database}.${body.collection}`);
        this.closeModal('dropTable');
      })
      .add(() => {
        this.dropTableLoader = false;
      });
  }
  closeModal(title) {
    this[title] = false;
  }

  openModal(title, options) {
    // initializes values
    if (title === 'addTable') {
      this.addTableForm.reset();
      this.addTableForm.controls.database.setValue(options.database);
    }
    if (title === 'addDB') {
      this.addDBForm.reset();
    }
    if (title === 'dropTable') {
      this.dropTableForm.reset();
      this.dropTableForm.controls.database.setValue(options.database);
      this.dropTableForm.controls.collection.setValue(options.collection);
    }
    // opens modal
    this[title] = true;
  }
}
