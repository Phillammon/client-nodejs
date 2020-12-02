/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Attribute, BooleanAttribute, DateTimeAttribute, DoubleAttribute, LongAttribute, StringAttribute } from "./Attribute";
import { Concept, RemoteConcept } from "../Concept";
import { ThingType } from "../Type/ThingType";
import { AttributeType, BooleanAttributeType, DateTimeAttributeType, DoubleAttributeType, LongAttributeType, StringAttributeType } from "../Type/AttributeType";
import { RoleType } from "../Type/RoleType";
import { Grakn } from "../../Grakn";
import Transaction = Grakn.Transaction;
import { Merge } from "../../common/utils";
import { Stream } from "../../rpc/Stream";
import { Relation } from "./Relation";

export interface Thing extends Concept {
    getIID(): string;
    asRemote(transaction: Transaction): RemoteThing;
}

export interface RemoteThing extends Merge<RemoteConcept, Thing> {
    getType(): Promise<ThingType>;
    isInferred(): Promise<boolean>;

    setHas(attribute: Attribute<any>): Promise<void>;
    unsetHas(attribute: Attribute<any>): Promise<void>;

    getHas(onlyKey: boolean): Stream<Attribute<any>>;
    getHas(attributeType: BooleanAttributeType): Stream<BooleanAttribute>;
    getHas(attributeType: LongAttributeType): Stream<LongAttribute>;
    getHas(attributeType: DoubleAttributeType): Stream<DoubleAttribute>;
    getHas(attributeType: StringAttributeType): Stream<StringAttribute>;
    getHas(attributeType: DateTimeAttributeType): Stream<DateTimeAttribute>;
    getHas(attributeTypes: AttributeType[]): Stream<Attribute<any>>;

    getPlays(): Stream<RoleType>;
    getRelations(roleTypes: RoleType[]): Stream<Relation>;

    asRemote(transaction: Transaction): RemoteThing;
}
