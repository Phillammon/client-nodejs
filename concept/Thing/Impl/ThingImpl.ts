import { Thing, RemoteThing } from "../../../internal";
import { Attribute } from "../../../internal";
import { Type } from "../../../internal";
import { QueryIterator } from "../../../internal";
import { AttributeType } from "../../../internal";
import { RoleType } from "../../../internal";
import ConceptProto from "grakn-protocol/concept_pb";
import { EntityImpl } from "../../../internal";
import { RelationImpl } from "../../../internal";
import { AttributeImpl } from "../../../internal";
import { ThingTypeImpl } from "../../../internal";
import { Grakn } from "../../../internal";
import Transaction = Grakn.Transaction;

export abstract class ThingImpl implements Thing {
    private readonly _iid: string;

    // TODO: all error messages should be extracted into ErrorMessage class or namespace
    protected constructor(iid: string) {
        if (!iid) {
            throw "IID Missing"
        }
        this._iid = iid;
    }

    static of(thingProto: ConceptProto.Thing): ThingImpl {
        switch (thingProto.getEncoding()) {
            case ConceptProto.Thing.ENCODING.ENTITY:
                return EntityImpl.of(thingProto);
            case ConceptProto.Thing.ENCODING.RELATION:
                return RelationImpl.of(thingProto);
            case ConceptProto.Thing.ENCODING.ATTRIBUTE:
                return AttributeImpl.of(thingProto);
            default:
                throw "Bad encoding"
        }
    }

    getIID(): string {
        return this._iid;
    }

    isRemote(): boolean {
        return false;
    }

    toString(): string {
        return `${ThingImpl.name}[iid:${this._iid}]`;
    }

    abstract asRemote(transaction: Transaction): RemoteThing;
}

export abstract class RemoteThingImpl implements RemoteThing {
    private readonly _iid: string;
    private readonly _transaction: Transaction;

    protected constructor(transaction: Transaction, iid: string) {
        if (!transaction) throw "Transaction Missing"
        if (!iid) throw "IID Missing"
        this._iid = iid;
        this._transaction = transaction;
    }

    getType(): ThingTypeImpl {
        throw "Not implemented yet";
    }

    isInferred(): boolean {
        throw "Not implemented yet";
    }

    abstract asRemote(transaction: Transaction): RemoteThing;

    delete(): void {
        throw "Not implemented yet";
    }

    getIID(): string {
        return this._iid;
    }

    isDeleted(): boolean {
        return false;
    }

    isRemote(): boolean {
        return true;
    }

    getHas(onlyKey: boolean): QueryIterator;
    getHas(attributeType: Type): QueryIterator;
    getHas(attributeType: Type): QueryIterator;
    getHas(attributeType: Type): QueryIterator;
    getHas(attributeType: Type): QueryIterator;
    getHas(attributeType: Type): QueryIterator;
    getHas(attributeTypes: AttributeType[]): QueryIterator;
    getHas(onlyKey: boolean | Type | AttributeType[]): QueryIterator {
        return new QueryIterator();
    }

    getPlays(): QueryIterator {
        return new QueryIterator();
    }

    getRelations(roleTypes: RoleType[]): QueryIterator {
        return new QueryIterator();
    }

    setHas(attribute: Attribute<AttributeType.ValueClass>): void {
        throw "Not implemented yet";
    }

    unsetHas(attribute: Attribute<AttributeType.ValueClass>): void {
        throw "Not implemented yet";
    }

    protected get transaction(): Transaction {
        return this._transaction;
    }

    toString(): string {
        return `${RemoteThingImpl.name}[iid:${this._iid}]`;
    }
}
