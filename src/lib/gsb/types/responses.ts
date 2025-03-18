export class GsbQueryResponse {
    message?: string | undefined;
    status?: number | undefined;
    entities?: any[] | undefined;
    entity?: any;
    totalCount?: number | undefined;
}

export class GsbGetCodeResponse {
    message?: string | undefined;
    status?: number | undefined;
    code?: string | undefined;
}

export class GsbQueryOpResponse {
    message?: string | undefined;
    status?: number | undefined;
    affectedRowCount?: number | undefined;
    deleteCount?: any;
}

export class GsbSaveResponse {
    message?: string | undefined;
    status?: number | undefined;
    id?: string | undefined;
}

export class GsbDefinitionResponse {
    message?: string | undefined;
    status?: number | undefined;
    entityDef?: any;
}

export class GsbSaveMultiResponse {
    message?: string | undefined;
    status?: number | undefined;
    ids?: string[] | undefined;
} 