import Dexie, { Table } from 'dexie';
import { Group, Environment, ApiData, Project,ApiTestHistory } from '../types';

export class Storage extends Dexie {
  project!: Table<Project, number>;
  group!: Table<Group, number>;
  environment!: Table<Environment, number>;
  apiData!: Table<ApiData, number>;
  apiTestHistory!: Table<ApiTestHistory, number>;

  constructor() {
    super('eoapi_default');
    this.version(1).stores({
      project: '++uuid, name',
      environment: '++uuid, name, projectID',
      group: '++uuid, name, projectID, parentID',
      apiData: '++uuid, name, projectID, groupID',
      apiTestHistory: '++uuid, projectID, apiDataID',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    await this.project.add({
      uuid: 1,
      name: 'Default'
    });
  }
}

export default Storage;
