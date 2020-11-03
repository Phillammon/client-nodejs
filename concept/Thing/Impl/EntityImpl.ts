class EntityImpl extends ThingImpl implements Entity {
    constructor(iid: string) {
        super(iid);
    }

    asRemote(transaction: Transaction) {
        return new RemoteEntityImpl(transaction, this.getIID());
    }

    asEntity() {
        return this;
    }
}

class RemoteEntityImpl extends RemoteThingImpl implements RemoteEntity, Entity {
    constructor(transaction: Transaction, iid: string) {
        super(transaction, iid);
    }

    public asRemote(transaction: Transaction) {
        return new RemoteEntityImpl(transaction, this.getIID());
    }

    getType(): EntityTypeImpl {
        return super.getType().asEntityType();
    }

    asEntity() {
        return this;
    }
}