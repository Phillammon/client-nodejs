import { RPCTransaction } from "../rpc/RPCTransaction";
import { GraknOptions } from "../GraknOptions";
import QueryProto from "graknlabs-grpc-protocol/protobuf/query_pb";
import Query = QueryProto.Query;
import Graql = QueryProto.Graql;
import TransactionProto from "graknlabs-grpc-protocol/protobuf/transaction_pb";
import Transaction = TransactionProto.Transaction;
import { ProtoBuilder } from "../common/ProtoBuilder";

export class QueryManager {
    private readonly _rpcTransaction: RPCTransaction;
    constructor (transaction: RPCTransaction) {
        this._rpcTransaction = transaction;
    }

    // public match(query: string, options?: GraknOptions): Promise<Transaction.Res> {
    //     const matchQuery = new Query.Req().setMatchReq(
    //         new Graql.Match.Req().setQuery(query));
    //     return this._iterateQuery(matchQuery, options ? options : new GraknOptions(), (res: Transaction.Res) => res.getQueryRes().getMatchRes().getAnswerList());
    // }


    public insert(query: string, options?: GraknOptions): Promise<Transaction.Res> {
        const insertQuery = new Query.Req().setInsertReq(
            new Graql.Insert.Req().setQuery(query));
        return this._iterateQuery(insertQuery, options ? options : new GraknOptions(), (res: Transaction.Res) => res.getQueryRes().getInsertRes().getAnswerList());
    }

    public delete(query: string, options?: GraknOptions): Promise<void> {
        const deleteQuery = new Query.Req().setDeleteReq(
            new Graql.Delete.Req().setQuery(query));
        return this._runQuery(deleteQuery, options ? options : new GraknOptions())
    }

    public define(query: string, options?: GraknOptions): Promise<void> {
        const defineQuery = new Query.Req().setDefineReq(
                    new Graql.Define.Req().setQuery(query));
        return this._runQuery(defineQuery, options ? options : new GraknOptions())
    }

    public undefine(query: string, options?: GraknOptions): Promise<void> {
        const undefineQuery = new Query.Req().setUndefineReq(
            new Graql.Undefine.Req().setQuery(query));
        return this._runQuery(undefineQuery, options ? options : new GraknOptions())
    }

    private async _runQuery(request: Query.Req, options: GraknOptions): Promise<void> {
        const transactionRequest = new Transaction.Req()
            .setQueryReq(
                request.setOptions(ProtoBuilder.options(options))
            )
        await this._rpcTransaction.execute(transactionRequest);
    }

    private async _iterateQuery(request: Query.Req, options: GraknOptions, responseReader: (res: Transaction.Res) => any): Promise<Transaction.Res> {
        const transactionRequest = new Transaction.Req()
            .setQueryReq(
                request.setOptions(ProtoBuilder.options(options))
            )
        return this._rpcTransaction.stream(transactionRequest, responseReader);
    }
}
