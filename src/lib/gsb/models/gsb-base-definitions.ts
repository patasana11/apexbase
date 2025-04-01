import { GsbPropertyDef } from './gsb-entity-def.model';
import { DataType } from './gsb-entity-def.model';

export const BASE_PROPERTY_DEFINITIONS: GsbPropertyDef[] = [
  {
    "id": "f7b0f336-a2fa-43bd-97a4-b096aab76077",
    "dataType": DataType.StringUnicode,
    "maxLength": 64,
    "title": "Icon",
    "name": "icon",
    "usage": 1
  },
  {
    "id": "3623b7bc-7884-4989-aed0-e9f31c0693ea",
    "dataType": DataType.Reference,
    "title": "Image",
    "name": "image",
    "usage": 1,
  },
  {
    "id": "c6c34bf3-f51b-4e69-a689-b09847be74b9",
    "dataType": DataType.StringUnicode,
    "maxLength": 1024,
    "title": "Text",
    "description": "Text",
    "name": "Text",
    "usage": 0,
  },
  {
    "id": "dfa41997-3031-42d0-bab3-0302f1d1db1b",
    "dataType": DataType.Binary,
    "title": "Binary",
    "description": "Binary",
    "name": "Binary",
    "usage": 1
  },
  {
    "id": "e03f84c0-774d-4c9a-9c90-cb68a6ce8462",
    "dataType": DataType.Long,
    "title": "Token",
    "description": "Token",
    "name": "Token"
  },
  {
    "id": "3513db3c-a1a7-464d-adab-05dbec8117e0",
    "dataType": DataType.Long,
    "title": "Long",
    "description": "Long",
    "name": "Long"
  }
]; 