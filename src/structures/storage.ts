import * as crypto from 'node:crypto';
import { keys, find, filter, pathEq } from 'ramda';

interface StoreRecord<Data> {
  _id: string;
  key: string;
  value: Data;
}
type FindDocument = Record<string, any>;

export default class Store<Data> {
  private data: StoreRecord<Data>[] = [];
  async findOne(document: FindDocument) {
    return find(
      (record) =>
        keys(document).every((key) =>
          pathEq(key.split('.'), document[key], record)
        ),
      this.data
    );
  }
  async findMany(document: FindDocument) {
    return filter(
      (record) =>
        keys(document).every((key) =>
          pathEq(key.split('.'), document[key], record)
        ),
      this.data
    );
  }
  async create(document: Omit<StoreRecord<Data>, '_id'>) {
    this.data.push({ _id: crypto.randomUUID(), ...document });
  }
  async updateOne(document: FindDocument, update: Partial<StoreRecord<Data>>) {
    const record = this.findOne(document);
    if (record) {
      Object.assign(record, update);
    }
  }
}
