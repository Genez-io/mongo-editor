import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  BASE_URL = `${process.env.API_URL}/databases`;
  headers = {};

  setDbId(dbId: string) {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Accept-Version': 'genezio-webapp/0.3.0',
      'Db-Id': dbId
    };
  }

  getDbs() {
    return this.http.get(`${this.BASE_URL}?includeCollections=true`, {headers: this.headers});
  }
  getCollections(dbName) {
    return this.http.get(`${this.BASE_URL}/${dbName}/collections`, {headers: this.headers});
  }
  getDocumentsByCollection(dbName, collectionName) {
    return this.http.get(
      `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents?limit=10&ContentType=ejson`,
      {headers: this.headers}
    );
  }
  filterDocumentsByQuery(dbName, collectionName, query, pageIndex = 1, queryType = 'raw', prompt) {
    return this.http.post(
      `${
        this.BASE_URL
      }/${dbName}/collections/${collectionName}/documents/filter?limit=10&skip=${
        (pageIndex - 1) * 10
      }&ContentType=ejson&incomingType=ejson&queryType=${queryType}&prompt=${prompt}`,
      query, 
      {headers: this.headers}
    );
  }
  getDocumentCount(dbName, collectionName, query) {
    return this.http.post(
      `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents/count?incomingType=ejson&ContentType=ejson`,
      query,
      {headers: this.headers}
    );
  }
  deleteDocumentById(dbName, collectionName, document) {
    return this.http.post(
      `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents/delete?incomingType=ejson`,
      document,
      {headers: this.headers}
    );
  }
  // updateDocument(dbName, collectionName, document) {
  //   return this.http.put(
  //     `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents?incomingType=ejson`,
  //     document
  //   );
  // }
  // createDocument(dbName, collectionName, document) {
  //   return this.http.post(
  //     `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents?incomingType=ejson`,
  //     document
  //   );
  // }
  createDocuments(dbName, collectionName, document) {
    return this.http.post(
      `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents?incomingType=ejson`,
      document,
      {headers: this.headers}
    );
  }
  createCollection(body) {
    return this.http.post(
      `${this.BASE_URL}/${body.database}/collections`,
      body,
      {headers: this.headers}
    );
  }
  dropCollection(body) {
    return this.http.post(
      `${this.BASE_URL}/${body.database}/collections/delete`,
      body,
      {headers: this.headers}
    );
  }
  aggregate(dbName, collectionName, query) {
    return this.http.post(
      `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents/aggregate?ContentType=ejson&incomingType=ejson`,
      query,
      {headers: this.headers}
    );
  }

  getQueryFromPrompt(dbName, collectionName, prompt) {
    return this.http.post(
      `${this.BASE_URL}/${dbName}/collections/${collectionName}/documents/generate-query`,
      { prompt },
      {headers: this.headers}
    );
  }
}
