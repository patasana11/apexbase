export class SelectCol {
    aggregateFunction?: string | undefined;
    dateModifier?: string | undefined;
    name?: string | undefined;
    script?: string | undefined;
    groupBy?: boolean | undefined;
    fullName?: string | undefined;
    title?: string | undefined;

    constructor(cName: string | undefined = undefined) {
        this.name = cName;
    }
}

export class SortCol {
    col: SelectCol | undefined;
    sortType: string | undefined;
}

export enum QueryFunction {
    Equals = 'equals',
    Like = 'like',
    Greater = 'greater',
    Smaller = 'smaller',
    Contains = 'contains',
    In = 'in',
    FullTextSearch = 'fullTextSearch',
    Is = 'is'
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
    propVal: PropertyValue;
    relationLevel?: number | undefined;
    children?: SingleQuery[] | undefined;
    relation?: QueryRelation;
    name?: string | undefined;
    negate?: boolean = false;
    private function?: QueryFunction | undefined;

    constructor(propName: string | undefined = undefined, propVal: any = undefined, func: QueryFunction | undefined = undefined) {
        this.propVal = new PropertyValue(propName, propVal);
        this.function = func;
    }

    isEqual(value: any) {
        this.function = QueryFunction.Equals;
        this.propVal.value = value;
        return this;
    }

    isLike(value: any) {
        this.function = QueryFunction.Like;
        this.propVal.value = value;
        return this;
    }

    isGreater(value: any) {
        this.function = QueryFunction.Greater;
        this.propVal.value = value;
        return this;
    }

    isSmaller(value: any) {
        this.function = QueryFunction.Smaller;
        this.propVal.value = value;
        return this;
    }

    contains(value: any) {
        this.function = QueryFunction.Contains;
        this.propVal.value = value;
        return this;
    }

    in(value: any) {
        this.function = QueryFunction.In;
        this.propVal.value = value;
        return this;
    }

    fullTextSeach(value: any) {
        this.function = QueryFunction.FullTextSearch;
        this.propVal.value = value;
        return this;
    }

    is(value: any) {
        this.function = QueryFunction.Is;
        this.propVal.value = value;
        return this;
    }

    not() {
        this.negate = true;
        return this;
    }

    funcVal(queryFunction: QueryFunction, value: any) {
        this.function = queryFunction;
        this.propVal.value = value;
        return this;
    }
} 