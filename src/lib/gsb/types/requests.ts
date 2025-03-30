export interface GetTokenRequest {
    email: string;
    password: string;
    remember?: boolean;
    includeUserInfo?: boolean;
    variation?: {
        tenantCode: string;
    };
}


export class GsbSaveRequest {
    entDefName? = "";
    entDefId? = "";
    entityDef? = {};
    entity? = {};
    query? = [];
    entityId? = "";
}

export class GsbSaveMappedRequest {
    entDefName: string = '';
    entDefId: string = '';
    entityDef: Record<string, any> = {};
    items: any[] = [];
    entityId: string = '';
    propName: string | undefined;
}

export class GsbSaveMultiRequest {
    entDefName = "";
    entDefId = "";
    entityDef = {};
    entities = [];
}

export class GsbGetCodeRequest {
    codeGeneratorId = "";
}

export interface HttpCallRequest {
    method: string;
    protocol: string;
    hostName: string;
    port?: string;
    path?: string;
    content?: any;
    bearerToken?: string;
    contentType?: string;
    headers?: Record<string, string>;
    jsonResponse?: boolean;
    noAuth?: boolean;
} 