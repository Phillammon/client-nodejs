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

import { Thing, RemoteThing } from "./Thing";
import { AttributeType } from "../Type/AttributeType";
import ValueClass = AttributeType.ValueClass;
import { Grakn } from "../../Grakn";
import Transaction = Grakn.Transaction;
import { Merge } from "../../common/utils";

export interface Attribute<T extends ValueClass> extends Thing {
    getValue(): T;

    asRemote(transaction: Transaction): RemoteAttribute<T>;
}

export interface RemoteAttribute<T extends ValueClass> extends Merge<RemoteThing, Attribute<T>> {
    getType(): AttributeType;
    asRemote(transaction: Transaction): RemoteAttribute<T>;
}

export interface BooleanAttribute extends Attribute<boolean> {
    asRemote(transaction: Transaction): RemoteBooleanAttribute;
}

export interface RemoteBooleanAttribute extends Merge<RemoteAttribute<boolean>, BooleanAttribute> {
    asRemote(transaction: Transaction): RemoteBooleanAttribute;
}

export interface LongAttribute extends Attribute<number> {
    asRemote(transaction: Transaction): RemoteLongAttribute;
}

export interface RemoteLongAttribute extends Merge<RemoteAttribute<number>, LongAttribute> {
    asRemote(transaction: Transaction): RemoteLongAttribute;
}

export interface DoubleAttribute extends Attribute<number> {
    asRemote(transaction: Transaction): RemoteDoubleAttribute;
}

export interface RemoteDoubleAttribute extends Merge<RemoteAttribute<number>, LongAttribute> {
    asRemote(transaction: Transaction): RemoteDoubleAttribute;
}

export interface StringAttribute extends Attribute<string> {
    asRemote(transaction: Transaction): RemoteStringAttribute;
}

export interface RemoteStringAttribute extends Merge<RemoteAttribute<string>, StringAttribute> {
    asRemote(transaction: Transaction): RemoteStringAttribute;
}

export interface DateTimeAttribute extends Attribute<Date> {
    asRemote(transaction: Transaction): RemoteDateTimeAttribute;
}

export interface RemoteDateTimeAttribute extends Merge<RemoteAttribute<Date>, DateTimeAttribute> {
    asRemote(transaction: Transaction): RemoteDateTimeAttribute;
}
