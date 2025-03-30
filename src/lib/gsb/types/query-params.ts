import { SelectCol, SortCol, SingleQuery, QueryFunction, QueryRelation } from './query';

export class QueryParams<T extends object> {
    propertyName?: string = '';
    entity?: T | null = null;
    id?: string;
    cached?: boolean;
    cacheName?: string;
    cacheVersion?: string;
    entityId?: string;
    entityDef?: { id?: string; name?: string };
    selectCols?: SelectCol[] = [];
    includes?: IncludeQuery<any>[] = [];
    query?: SingleQuery[] = [];
    startIndex?: number;
    count?: number;
    sortCols?: SortCol[] = [];
    groupBy?: string[] | undefined;
    variation?: any;
    querySortType?: string | undefined;
    filter?: any;
    calcTotalCount?: boolean;
    queryType?: number;
    mapColName?: string | undefined;
    widgetQuery?: any;
    filterQuery?: any;

    get entDefId() {
        if (this.entityDef)
            return this.entityDef.id;
    }
    set entDefId(v) {
        if (!this.entityDef)
            this.entityDef = {};
        this.entityDef.id = v;
    }

    get entDefName() {
        if (this.entityDef)
            return this.entityDef.name;
    }
    set entDefName(v) {
        if (!this.entityDef)
            this.entityDef = {};
        this.entityDef.name = v;
    }

    static ApplyWhere(eqp: QueryParams<any>, propName: string, value: any, relation: QueryRelation | undefined = undefined, queryName: string | undefined = undefined) {
        if (!eqp.query) {
            eqp.query = [];
        }
        if (queryName) {
            let qR = eqp.query.find(p => p.name === queryName);
            let qrIdx = eqp.query.indexOf(qR!);
            eqp.query.splice(qrIdx, 1);
        }

        let q = new SingleQuery(propName, value);
        q.name = queryName;
        q.relation = relation;
        eqp.query.push(q);
        return eqp;
    }

    private getPropMatch(conditionFn: (item: T) => any): string {
        const conditionString = conditionFn.toString();
        const propertyRegex = /p\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)/;
        const propertyMatch = conditionString.match(propertyRegex);
        if (!propertyMatch) {
            throw new Error('Invalid property expression');
        }
        return propertyMatch[1];
    }

    prop(conditionFn: (item: T) => any): SingleQuery {
        let propName = this.getPropMatch(conditionFn);
        let q = new SingleQuery(propName);

        if (!this.query) {
            this.query = [];
        }
        this.query.push(q);
        return q;
    }

    property = this.prop;

    where(propName: string, value: any, queryFunction: QueryFunction = QueryFunction.Equals, relation?: QueryRelation): QueryParams<T> {
        if (!this.query) {
            this.query = [];
        }

        let q = new SingleQuery(propName, value, queryFunction);
        q.relation = relation;
        this.query.push(q);
        return this;
    }

    select(col: (string | string[] | ((item: T) => any)), options?: SelectCol): QueryParams<T> {
        if (!this.selectCols)
            this.selectCols = [];

        if (Array.isArray(col)) {
            for (let name of col) {
                let selCol = this.selectCols.find(p => p.name == name);
                if (!selCol) {
                    selCol = new SelectCol(name);
                    this.selectCols.push(selCol);
                }
                if (options) {
                    Object.assign(selCol, options);
                }
            }
        }
        else {
            let name;
            if (typeof (col) == "function") {
                let propName = this.getPropMatch(col);
                name = propName;
            }
            else {
                name = col;
            }
            let selCol = this.selectCols.find(p => p.name == name);
            if (!selCol) {
                selCol = new SelectCol(name);
                this.selectCols.push(selCol);
            }
            if (options) {
                Object.assign(selCol, options);
            }
        }

        return this;
    }

    apply(callback: (qb: QueryParams<T>) => QueryParams<T>): QueryParams<T> {
        callback(this);
        return this;
    }

    include<R extends object = T>(...colNames: (string | ((item: T) => any))[]): { self: QueryParams<T>; inc: IncludeQuery<R> | null } {
        if (!this.includes) {
            this.includes = [];
        }
        if (!colNames || colNames.length === 0) {
            return { self: this, inc: null };
        }
        let inc: IncludeQuery<R> | null = null;
        for (let col of colNames) {
            let name: string;
            if (typeof col === "function") {
                name = this.getPropMatch(col);
            } else {
                name = col;
            }
            let incQ = this.includes.find(p => p.propertyName === name);
            if (!incQ) {
                incQ = new IncludeQuery<R>(name);
                this.includes.push(incQ);
            }
            inc = incQ as IncludeQuery<R>;
        }

        return { self: this, inc };
    }

    sortBy(conditionFn: (item: T) => any, sortType: string): QueryParams<T> {
        let name = this.getPropMatch(conditionFn);

        if (!this.sortCols) {
            this.sortCols = [];
        }
        let selCol = this.sortCols.find(p => p.col?.name === name);
        if (!selCol) {
            let inc = new SelectCol(name);
            let sort = new SortCol();
            sort.col = inc;
            sort.sortType = sortType;
            this.sortCols.push(sort);
        }
        return this;
    }

    incS(propnames: string | string[]): QueryParams<T> {
        if (!this.includes) {
            this.includes = [];
        }
        if (typeof propnames === 'string') {
            this.includes.push(new IncludeQuery(propnames));
        } else {
            for (let propname of propnames) {
                this.includes.push(new IncludeQuery(propname));
            }
        }
        return this;
    }

    incQ(q: IncludeQuery<any> | IncludeQuery<any>[]): QueryParams<T> {
        if (!this.includes) {
            this.includes = [];
        }
        if (Array.isArray(q)) {
            for (let qItem of q) {
                this.includes.push(qItem);
            }
        } else {
            this.includes.push(q);
        }
        return this;
    }

    constructor(definition: string | { new(): T }, widgetQuery?: any, includes?: IncludeQuery<any>[], filterQuery?: any) {
        if (typeof definition === 'string') {
            this.entDefName = definition;
        } else {
            const instance = new definition();
            if ('_entDefName' in instance) {
                this.entDefName = (instance as any)._entDefName;
            }
        }
        this.widgetQuery = widgetQuery;
        if (includes) {
            this.includes = includes;
        }
        this.filterQuery = filterQuery;
    }
}

export class IncludeQuery<T extends object> extends QueryParams<T> {
    constructor(propertyName: string) {
        super('');
        this.propertyName = propertyName;
    }
} 

export class EntityQueryParams<T extends object> extends QueryParams<T>{
    constructor(definition: string | { new(): T }, widgetQuery = undefined, includes = undefined, filterQuery = undefined) {
        super(definition, widgetQuery, includes, filterQuery);
    }
} 