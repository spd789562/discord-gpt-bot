/* if you want to using this file, remember remove this line */
/* @ts-ignore */
import mongoose from 'mongoose';

import { FindDocument, StoreRecord, IStore } from './storage';

const StoreSchema = new mongoose.Schema<IStore<any>>({
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: false },
});

const StoreModel = mongoose.model('Store', StoreSchema);

/**
 * this is mongoose example, remember install mongoose and connect to database somewhere
 * mongoose.connect(`mongodb://${MongoHost}:${MongoPort}`, {
 *   useNewUrlParser: true,
 *   dbName: 'test',
 * });
 * also instead implement IStore<Data> you can use StoreModel directly
 */

export default class MongoStore<Data> implements IStore<Data> {
  async findOne(document: FindDocument) {
    return await StoreModel.findOne(document);
  }
  async findMany(document: FindDocument) {
    return await StoreModel.find(document);
  }
  async create(document: Omit<StoreRecord<Data>, '_id'>) {
    await StoreModel.create({ ...document });
  }
  async updateOne(document: FindDocument, update: Partial<StoreRecord<Data>>) {
    await StoreModel.updateOne(document, {
      $set: update,
    });
  }
}
