import {IEntityStore} from '..';
import {AnyAzureObject} from './schema';

export class EntityStore implements IEntityStore<AnyAzureObject> {
  private readonly idToItem: Map<string, AnyAzureObject>;
  private readonly idToAlias: Map<string, string>;

  constructor() {
    this.idToItem = new Map<string, AnyAzureObject>();
    this.idToAlias = new Map<string, string>();
  }

  public registerEntity(entity: AnyAzureObject, alias: string) {
    this.idToItem.set(entity.id, entity);

    if (alias !== '') {
      this.idToAlias.set(entity.id, alias);
    }
  }

  public getEntity<T extends AnyAzureObject>(id: string): T {
    if (!this.idToItem.has(id)) {
      throw new Error(`Failed to find item with id '${id}'`);
    }

    return this.idToItem.get(id) as T;
  }

  public getAlias(id: string): string {
    const result = this.idToAlias.get(id);

    if (!result) {
      throw new Error(`Failed to find alias for id '${id}`);
    }

    return result;
  }
}
