export enum AggregateFunction {
    None = 0,
    Sum = 1,
    Average = 2,
    Count = 3,
    Maximum = 4,
    Minimum = 5,
    Variance = 6
  }
  

export class SelectCol {
    aggregateFunction?: AggregateFunction;
    dateModifier?: string | undefined;
    name?: string | undefined;
    script?: string | undefined;
    groupBy?: boolean | undefined;
    fullName?: string | undefined;
    title?: string | undefined;
    value?: any | undefined;
    nameScript?: string | undefined;
    valScript?: string | undefined;
    selectAsTitle?: string | undefined;

    constructor(cName: string | undefined = undefined) {
        this.name = cName;
    }
}

export class SortCol {
    col: SelectCol | undefined;
    sortType: string | undefined;
}

export enum QueryFunction {
    Equals = 0,
    Like = 1,
    Greater = 2,
    Smaller = 3,
    BitwiseAnd = 5,
    BitwiseOr = 6,
    BitwiseXor = 7,
    In = 8,
    Is = 9,
    FullTextSearch = 11,
    Contains = 12,
    ILike = 15,
    RegexMatch = 16,
    RegexMatchCaseInsensitive = 17,
    IsNull = 18,
    Between = 19,
    PhraseSearch = 20,
    GeometryOverlaps = 21,
    PointInGeometry = 22,
    GPSDistance = 23,
    GPSWithinRadius = 24,
    JsonContains = 25,
    JsonHasKey = 26,
    MatchArrays = 27
}

export enum QueryRelation {
    And = 'and',
    Or = 'or'
}

export enum QuerySortType {
    Ascending = 'asc',
    Descending = 'desc'
}

export enum QueryType {
    Single = 0,
    List = 1,
    Search = 2,
    AutoComplete = 3,
    Full = 4,
    FullWithSingleRefs = 5,
    FullNonPersonal = 6
}

export class PropertyValue {
    name?: string | undefined;
    value?: any;
    valueScript?: string | undefined;
    type?: string | undefined;
    label?: string | undefined;

    constructor(name: string | undefined = undefined, value: any = undefined, label: string | undefined = undefined, type: string | undefined = undefined) {
        this.name = name;
        this.value = value;
        this.label = label;
        this.type = type;
    }
}

export class SingleQuery {
    col?: SelectCol;
    val?: SelectCol;
    relationLevel?: number | undefined;
    children?: SingleQuery[] | undefined;
    relation?: QueryRelation;
    name?: string | undefined;
    negate?: boolean = false;
    private function?: QueryFunction | undefined;

    constructor(propName: string | undefined = undefined, propVal: any = undefined, func: QueryFunction | undefined = undefined) {
        this.col = new SelectCol(propName);
        this.val = new SelectCol();
        this.val.value = propVal;
        this.function = func;
    }

    aggregate(func: AggregateFunction) {
        if (!this.col) this.col = new SelectCol();
        this.col.aggregateFunction = func;
        return this;
    }

    groupBy(value: boolean = true) {
        if (!this.col) this.col = new SelectCol();
        this.col.groupBy = value;
        return this;
    }

    isEqual(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.Equals;
        this.val.value = value;
        return this;
    }

    isLike(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.Like;
        this.val.value = value;
        return this;
    }

    isGreater(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.Greater;
        this.val.value = value;
        return this;
    }

    isSmaller(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.Smaller;
        this.val.value = value;
        return this;
    }

    contains(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.Contains;
        this.val.value = value;
        return this;
    }

    bitwiseAnd(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.BitwiseAnd;
        this.val.value = value;
        return this;
    }
  

    bitwiseOr(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.BitwiseOr;
        this.val.value = value;
        return this;
    }

    bitwiseXor(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.BitwiseXor;
        this.val.value = value;
        return this;
    }

    in(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.In;
        this.val.value = value;
        return this;
    }

    fullTextSeach(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.FullTextSearch;
        this.val.value = value;
        return this;
    }

    is(value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = QueryFunction.Is;
        this.val.value = value;
        return this;
    }

    not() {
        this.negate = true;
        return this;
    }

    funcVal(queryFunction: QueryFunction, value: any) {
        if (!this.val) this.val = new SelectCol();
        this.function = queryFunction;
        this.val.value = value;
        return this;
    }
    
} 