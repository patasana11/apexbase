import { GsbProperty } from './gsb-entity-def.model';
import { GsbModule } from './gsb-module.model';
import { GsbUser } from './gsb-user.model';

export class GsbEnumVal {
  public orderNumber?: number;
  public id?: string;
  public lastUpdateDate?: Date;
  public createDate?: Date;
  public ownerEnum_id?: string;
  public passive?: boolean;
  public ownerEnum?: GsbEnum;
  public title?: string;
  public value?: number;
  public name?: string;
  public description?: string;
}

export class GsbEnum {
  public entProperties?: GsbProperty[];
  public name?: string;
  public module?: GsbModule;
  public lastUpdatedBy_id?: string;
  public lastUpdateDate?: Date;
  public id?: string;
  public createdBy_id?: string;
  public values?: GsbEnumVal[];
  public createDate?: Date;
  public module_id?: string;
  public lastUpdatedBy?: GsbUser;
  public createdBy?: GsbUser;
  public description?: string;
  public title?: string;
} 