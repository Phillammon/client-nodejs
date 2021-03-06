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

import { Then } from "@cucumber/cucumber";
import { sessions, transactions } from "../ConnectionSteps";
import DataTable from "@cucumber/cucumber/lib/models/data_table";
import { Grakn } from "../../../../dist/Grakn";
import TransactionType = Grakn.TransactionType;
import assert = require("assert");
import { assertThrows, assertThrowsWithMessage } from "../../util/Util";
import Transaction = Grakn.Transaction;
import Session = Grakn.Session;

Then('(for each )session(,) open(s) transaction(s) of type: {transaction_type}', async function (transactionType: TransactionType) {
    for (const session of sessions) {
        if (!transactions.has(session)) transactions.set(session, [])
        transactions.get(session).push(await session.transaction(transactionType));
    }
});

Then('(for each )session(,) open(s) transaction(s) of type:', async function (transactionTypeTable: DataTable) {
    const typeArray = dataTableToTransactionTypes(transactionTypeTable);
    for (const session of sessions) {
        if (!transactions.has(session)) transactions.set(session, [])
        for (const transactionType of typeArray) {
            transactions.get(session).push(await session.transaction(transactionType));
        }
    }
});

Then('(for each )session(,) open transaction(s) of type; throws exception: {transaction_type}', async function (transactionType: TransactionType) {
    for (const session of sessions) {
        await assertThrows(async () => await session.transaction(transactionType));
    }
});

Then('(for each )session(,) open transaction(s) of type; throws exception', async function (transactionTypeTable: DataTable) {
    const typeArray = dataTableToTransactionTypes(transactionTypeTable);
    for (const session of sessions) {
        if (!transactions.has(session)) transactions.set(session, [])
        for (const transactionType of typeArray) {
            await assertThrows(async () => await session.transaction(transactionType));
        }
    }
});

Then('(for each )session(,) transaction(s)( in parallel) is/are null: {bool}', function (isNull: boolean) {
    for (const session of sessions) assert.ok(transactions.has(session) !== isNull)
});

Then('(for each )session(,) transaction(s)( in parallel) is/are open: {bool}', function (isOpen: boolean) {
    for (const session of sessions) {
        assert.ok(transactions.has(session));
        for (const transaction of transactions.get(session)) {
            assert.ok(transaction.isOpen() === isOpen);
        }
    }
});

Then('transaction commits', async function () {
    await transactions.get(sessions[0])[0].commit();
});

Then('transaction commits; throws exception', async function () {
    await assertThrows(async () => await transactions.get(sessions[0])[0].commit());
});

Then('transaction commits; throws exception containing {string}', async function (error: string) {
    await assertThrowsWithMessage(async () => await transactions.get(sessions[0])[0].commit(), error);
});

Then('(for each )session(,) transaction(s) commit(s)', async function () {
    for (const session of sessions) {
        for (const transaction of transactions.get(session)) {
            await transaction.commit();
        }
    }
});

Then('(for each )session(,) transaction(s) commit(s); throws exception', async function () {
    for (const session of sessions) {
        for (const transaction of transactions.get(session)) {
            await assertThrows(async () => await transaction.commit());
        }
    }
});

Then('(for each )session(,) transaction(s) close(s)', async function () {
    for (const session of sessions) {
        for (const transaction of transactions.get(session)) {
            await transaction.close();
        }
    }
});

Then('(for each )session(,) transaction(s)( in parallel) has/have type: {transaction_type}', function (type: TransactionType) {
    for (const session of sessions) {
        for (const transaction of transactions.get(session)) {
            assert(transaction.type() === type);
        }
    }
});

Then('(for each )session(,) transaction(s)( in parallel) has/have type(s):', function (transactionTypeTable: DataTable) {
    const typeArray = dataTableToTransactionTypes(transactionTypeTable);
    for (const session of sessions) {
        const transactionArray = transactions.get(session)
        for (let i = 0; i < transactionArray.length; i++) {
            assert(transactionArray[i].type() === typeArray[i]);
        }
    }
});

Then('(for each )session(,) open transaction(s) in parallel of type:', async function (transactionTypeTable: DataTable) {
    const typeArray = dataTableToTransactionTypes(transactionTypeTable);
    const openings: Promise<Transaction>[] = []
    const sessionList: Session[] = []
    for (const type of typeArray) {
        for (const session of sessions) {
            openings.push(session.transaction(type));
            sessionList.push(session);
        }
    }
    const newTransactions = await Promise.all(openings);
    for (let i = 0; i < newTransactions.length; i++) {
        if (!transactions.has(sessionList[i])) transactions.set(sessionList[i], [])
        transactions.get(sessionList[i]).push(newTransactions[i]);
    }
});

function dataTableToTransactionTypes(transactionTypeTable: DataTable): TransactionType[] {
    const typeArray: TransactionType[] = [];
    for (const transactionTypeRow of transactionTypeTable.raw()) {
        switch (transactionTypeRow[0])  {
            case "write":
                typeArray.push(TransactionType.WRITE);
                break;
            case "read":
                typeArray.push(TransactionType.READ);
                break;
            default:
                throw "Behaviour asked for unrecognised Transaction Type. This is a problem with the feature file, not the client or server."
        }
    }
    return typeArray;
}
