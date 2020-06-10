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

const messages = require("../../../../grpc/nodejs/protocol/session/Session_pb");
const answerMessages = require("../../../../grpc/nodejs/protocol/session/Answer_pb");
const ConceptsBaseType = require("../concept/BaseTypeConstants").baseType;
const ProtoValueType = require("../../../../grpc/nodejs/protocol/session/Concept_pb").AttributeType.VALUE_TYPE;
const INFER_TRUE_MESSAGE = messages.Transaction.Query.INFER.TRUE;
const INFER_FALSE_MESSAGE = messages.Transaction.Query.INFER.FALSE;

// Helper functions

function RunConceptMethodRequest(conceptId, actionReq) {
  const conceptMethodReq = new messages.Transaction.ConceptMethod.Req();
  conceptMethodReq.setId(conceptId);
  conceptMethodReq.setMethod(actionReq);
  const transactionReq = new messages.Transaction.Req();
  transactionReq.setConceptmethodReq(conceptMethodReq);
  return transactionReq;
}

function RunConceptMethodIterRequest(conceptId, iterReq) {
  const conceptMessage = new messages.Transaction.ConceptMethod.Iter.Req();
  conceptMessage.setId(conceptId);
  conceptMessage.setMethod(iterReq);

  const iterMessage = new messages.Transaction.Iter.Req();
  iterMessage.setOptions(IterOptions());
  iterMessage.setConceptmethodIterReq(conceptMessage);

  return iterMessage;
}

function IterOptions(batchSize = 50) {
  const optionsMessage = new messages.Transaction.Iter.Req.Options();
  if (batchSize > 0) {
    optionsMessage.setNumber(batchSize);
  } else {
    optionsMessage.setAll(true);
  }
  return optionsMessage;
}

function convertBaseType(baseType) {
  switch (baseType) {
    case ConceptsBaseType.ATTRIBUTE: return messages.Concept.BASE_TYPE.ATTRIBUTE;
    case ConceptsBaseType.ATTRIBUTE_TYPE: return messages.Concept.BASE_TYPE.ATTRIBUTE_TYPE;
    case ConceptsBaseType.ENTITY: return messages.Concept.BASE_TYPE.ENTITY;
    case ConceptsBaseType.ENTITY_TYPE: return messages.Concept.BASE_TYPE.ENTITY_TYPE;
    case ConceptsBaseType.RELATION: return messages.Concept.BASE_TYPE.RELATION;
    case ConceptsBaseType.RELATION_TYPE: return messages.Concept.BASE_TYPE.RELATION_TYPE;
    case ConceptsBaseType.ROLE: return messages.Concept.BASE_TYPE.ROLE;
    case ConceptsBaseType.RULE: return messages.Concept.BASE_TYPE.RULE;
    case ConceptsBaseType.META_TYPE: return messages.Concept.BASE_TYPE.META_TYPE;
  }
}

function toGrpcConcept(conceptObject) {
  if (!conceptObject.id) throw new Error("Provided Concept without Id field.");
  if (!conceptObject.baseType) throw new Error("Provided Concept without baseType field.");

  const conceptMessage = new messages.Concept();
  conceptMessage.setId(conceptObject.id);
  conceptMessage.setBasetype(convertBaseType(conceptObject.baseType));
  return conceptMessage;
}

function setAttributeValueObject(valueObject, dataType, value) {
  if (dataType == null) throw new Error('Valuetype of AttributeType not specified.');
  switch (dataType) {
    case ProtoValueType.STRING: valueObject.setString(value); break;
    case ProtoValueType.BOOLEAN: valueObject.setBoolean(value); break;
    case ProtoValueType.INTEGER: valueObject.setInteger(value); break;
    case ProtoValueType.LONG: valueObject.setLong(value); break;
    case ProtoValueType.FLOAT: valueObject.setFloat(value); break;
    case ProtoValueType.DOUBLE: valueObject.setDouble(value); break;
    case ProtoValueType.DATETIME: valueObject.setDatetime(value.getTime()); break; // Send epoch time in milliseconds to server
    default: throw new Error('ValueType of attribute not recognised.');
  }
}

const methods = {
  // Concept
  deleteConcept: function (conceptId) {
    const deleteReq = new messages.Concept.Delete.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setConceptDeleteReq(deleteReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Schema concept
  getLabel: function (conceptId) {
    const getLabelReq = new messages.SchemaConcept.GetLabel.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setSchemaconceptGetlabelReq(getLabelReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  setLabel: function (conceptId, label) {
    const setLabelReq = new messages.SchemaConcept.SetLabel.Req();
    setLabelReq.setLabel(label);
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setSchemaconceptSetlabelReq(setLabelReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  subs: function (conceptId) {
    const subsReq = new messages.SchemaConcept.Subs.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setSchemaconceptSubsIterReq(subsReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  sups: function (conceptId) {
    const supsReq = new messages.SchemaConcept.Sups.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setSchemaconceptSupsIterReq(supsReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  getSup: function (conceptId) {
    const getSupReq = new messages.SchemaConcept.GetSup.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setSchemaconceptGetsupReq(getSupReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  setSup: function (conceptId, superConcept) {
    const setSupReq = new messages.SchemaConcept.SetSup.Req();
    setSupReq.setSchemaconcept(toGrpcConcept(superConcept));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setSchemaconceptSetsupReq(setSupReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Rule
  getWhen: function (conceptId) {
    const whenReq = new messages.Rule.When.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setRuleWhenReq(whenReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getThen: function (conceptId) {
    const thenReq = new messages.Rule.Then.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setRuleThenReq(thenReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Role
  getRelationTypesThatRelateRole: function (conceptId) {
    const relationsReq = new messages.Role.Relations.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setRoleRelationsIterReq(relationsReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  getTypesThatPlayRole: function (conceptId) {
    const playersReq = new messages.Role.Players.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setRolePlayersIterReq(playersReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  // Type
  instances: function (conceptId) {
    const instancesReq = new messages.Type.Instances.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setTypeInstancesIterReq(instancesReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },
  getAttributeTypes: function (conceptId) {
    const attributesReq = new messages.Type.Attributes.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setTypeAttributesIterReq(attributesReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },
  setAttributeType: function (conceptId, type) {
    const hasReq = new messages.Type.Has.Req();
    hasReq.setAttributetype(toGrpcConcept(type));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypeHasReq(hasReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  unsetAttributeType: function (conceptId, type) {
    const unhasReq = new messages.Type.Unhas.Req();
    unhasReq.setAttributetype(toGrpcConcept(type));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypeUnhasReq(unhasReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getKeyTypes: function (conceptId) {
    const keysReq = new messages.Type.Keys.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setTypeKeysIterReq(keysReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },
  setKeyType: function (conceptId, keyType) {
    const keyReq = new messages.Type.Key.Req();
    keyReq.setAttributetype(toGrpcConcept(keyType));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypeKeyReq(keyReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  unsetKeyType: function (conceptId, keyType) {
    const unkeyReq = new messages.Type.Unkey.Req();
    unkeyReq.setAttributetype(toGrpcConcept(keyType));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypeUnkeyReq(unkeyReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  isAbstract: function (conceptId) {
    const isAbstractReq = new messages.Type.IsAbstract.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypeIsabstractReq(isAbstractReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  setAbstract: function (conceptId, bool) {
    const setAbstractReq = new messages.Type.SetAbstract.Req();
    setAbstractReq.setAbstract(bool);
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypeSetabstractReq(setAbstractReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getRolesPlayedByType: function (conceptId) {
    const playingReq = new messages.Type.Playing.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setTypePlayingIterReq(playingReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },
  setRolePlayedByType: function (conceptId, role) {
    const playsReq = new messages.Type.Plays.Req();
    playsReq.setRole(toGrpcConcept(role));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypePlaysReq(playsReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  unsetRolePlayedByType: function (conceptId, role) {
    const unPlayReq = new messages.Type.Unplay.Req();
    unPlayReq.setRole(toGrpcConcept(role));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setTypeUnplayReq(unPlayReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Entity Type
  addEntity: function (conceptId) {
    const createEntityReq = new messages.EntityType.Create.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setEntitytypeCreateReq(createEntityReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Relation Type
  addRelation: function (conceptId) {
    const createRelationReq = new messages.RelationType.Create.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setRelationtypeCreateReq(createRelationReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getRelatedRoles: function (conceptId) {
    const roleReq = new messages.RelationType.Roles.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setRelationtypeRolesIterReq(roleReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  setRelatedRole: function (conceptId, role) {
    const relatesReq = new messages.RelationType.Relates.Req();
    relatesReq.setRole(toGrpcConcept(role))
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setRelationtypeRelatesReq(relatesReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  unsetRelatedRole: function (conceptId, role) {
    const unrelateReq = new messages.RelationType.Unrelate.Req();
    unrelateReq.setRole(toGrpcConcept(role))
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setRelationtypeUnrelateReq(unrelateReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Attribute type
  putAttribute: function (conceptId, dataType, value) {
    const createAttributeReq = new messages.AttributeType.Create.Req();
    const valueObject = new messages.ValueObject();
    setAttributeValueObject(valueObject, dataType, value)
    createAttributeReq.setValue(valueObject);
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setAttributetypeCreateReq(createAttributeReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getAttribute: function (conceptId, dataType, value) {
    const attributeReq = new messages.AttributeType.Attribute.Req();
    const valueObject = new messages.ValueObject();
    setAttributeValueObject(valueObject, dataType, value)
    attributeReq.setValue(valueObject);
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setAttributetypeAttributeReq(attributeReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getValueTypeOfType: function (conceptId) {
    const attributeTypeValueTypeReq = new messages.AttributeType.ValueType.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setAttributetypeValuetypeReq(attributeTypeValueTypeReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getRegex: function (conceptId) {
    const getRegexReq = new messages.AttributeType.GetRegex.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setAttributetypeGetregexReq(getRegexReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  setRegex: function (conceptId, regex) {
    const setRegexReq = new messages.AttributeType.SetRegex.Req();
    setRegexReq.setRegex(regex);
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setAttributetypeSetregexReq(setRegexReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Thing 

  isInferred: function (conceptId) {
    const isInferredReq = new messages.Thing.IsInferred.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setThingIsinferredReq(isInferredReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  getDirectType: function (conceptId) {
    const typeReq = new messages.Thing.Type.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setThingTypeReq(typeReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  getRelationsByRoles: function (conceptId, roles) {
    const relationsReq = new messages.Thing.Relations.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    if (roles.length) relationsReq.setRolesList(roles.map(role => toGrpcConcept(role)));
    conceptMethodReq.setThingRelationsIterReq(relationsReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  getRolesPlayedByThing: function (conceptId) {
    const rolesReq = new messages.Thing.Roles.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setThingRolesIterReq(rolesReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  getAttributesByTypes: function (conceptId, types) {
    const attributesReq = new messages.Thing.Attributes.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    if (types.length) attributesReq.setAttributetypesList(types.map(type => toGrpcConcept(type)));
    conceptMethodReq.setThingAttributesIterReq(attributesReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  getKeysByTypes: function (conceptId, types) {
    const keysReq = new messages.Thing.Keys.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    if (types.length) keysReq.setAttributetypesList(types.map(type => toGrpcConcept(type)));
    conceptMethodReq.setThingKeysIterReq(keysReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },
  setAttribute: function (conceptId, attribute) {
    const thingHasReq = new messages.Thing.Has.Req();
    const conceptMethodReq = new messages.Method.Req();
    thingHasReq.setAttribute(toGrpcConcept(attribute));
    conceptMethodReq.setThingHasReq(thingHasReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  unsetAttribute: function (conceptId, attribute) {
    const thingUnhasReq = new messages.Thing.Unhas.Req();
    const conceptMethodReq = new messages.Method.Req();
    thingUnhasReq.setAttribute(toGrpcConcept(attribute));
    conceptMethodReq.setThingUnhasReq(thingUnhasReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  // Relation
  rolePlayersMap: function (conceptId) {
    const rolePlayersMapReq = new messages.Relation.RolePlayersMap.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setRelationRoleplayersmapIterReq(rolePlayersMapReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },
  rolePlayers: function (conceptId, roles) {
    const rolePlayersReq = new messages.Relation.RolePlayers.Iter.Req();
    if (roles.length) rolePlayersReq.setRolesList(roles.map(role => toGrpcConcept(role)))
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setRelationRoleplayersIterReq(rolePlayersReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },
  setRolePlayer: function (conceptId, role, thing) {
    const assignReq = new messages.Relation.Assign.Req();
    assignReq.setRole(toGrpcConcept(role));
    assignReq.setPlayer(toGrpcConcept(thing));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setRelationAssignReq(assignReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  unsetRolePlayer: function (conceptId, role, thing) {
    const unassignReq = new messages.Relation.Unassign.Req();
    unassignReq.setRole(toGrpcConcept(role));
    unassignReq.setPlayer(toGrpcConcept(thing));
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setRelationUnassignReq(unassignReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },

  //Attribute
  getValue: function (conceptId) {
    const attributeValueReq = new messages.Attribute.Value.Req();
    const conceptMethodReq = new messages.Method.Req();
    conceptMethodReq.setAttributeValueReq(attributeValueReq);
    return RunConceptMethodRequest(conceptId, conceptMethodReq);
  },
  getOwners: function (conceptId) {
    const attributeValueReq = new messages.Attribute.Owners.Iter.Req();
    const conceptMethodReq = new messages.Method.Iter.Req();
    conceptMethodReq.setAttributeOwnersIterReq(attributeValueReq);
    return RunConceptMethodIterRequest(conceptId, conceptMethodReq);
  },

  //Transaction methods
  getConcept: function (conceptId) {
    const txRequest = new messages.Transaction.Req();
    const getMessage = new messages.Transaction.GetConcept.Req();
    getMessage.setId(conceptId);
    txRequest.setGetconceptReq(getMessage);
    return txRequest;
  },
  getSchemaConcept: function (label) {
    const txRequest = new messages.Transaction.Req();
    const getMessage = new messages.Transaction.GetSchemaConcept.Req();
    getMessage.setLabel(label);
    txRequest.setGetschemaconceptReq(getMessage);
    return txRequest;
  },
  putEntityType: function (label) {
    const txRequest = new messages.Transaction.Req();
    const putMessage = new messages.Transaction.PutEntityType.Req();
    putMessage.setLabel(label);
    txRequest.setPutentitytypeReq(putMessage);
    return txRequest;
  },
  putRelationType: function (label) {
    const txRequest = new messages.Transaction.Req();
    const putMessage = new messages.Transaction.PutRelationType.Req();
    putMessage.setLabel(label);
    txRequest.setPutrelationtypeReq(putMessage);
    return txRequest;
  },
  putRole: function (label) {
    const txRequest = new messages.Transaction.Req();
    const putMessage = new messages.Transaction.PutRole.Req();
    putMessage.setLabel(label);
    txRequest.setPutroleReq(putMessage);
    return txRequest;
  },
  putRule: function (label, when, then) {
    const txRequest = new messages.Transaction.Req();
    const putMessage = new messages.Transaction.PutRule.Req();
    putMessage.setLabel(label);
    putMessage.setWhen(when);
    putMessage.setThen(then);
    txRequest.setPutruleReq(putMessage);
    return txRequest;
  },
  putAttributeType: function (label, valueType) {
    if (valueType == null) throw new Error('Valuetype of AttributeType not specified.');
    const txRequest = new messages.Transaction.Req();
    const putMessage = new messages.Transaction.PutAttributeType.Req();
    putMessage.setLabel(label);
    putMessage.setValuetype(valueType);
    txRequest.setPutattributetypeReq(putMessage);
    return txRequest;
  },
  openSession: function(keyspace, credentials) {
    const sessionRequest = new messages.Session.Open.Req();
    if (credentials) {
      sessionRequest.setUsername(credentials.username);
      sessionRequest.setPassword(credentials.password);
    }
    sessionRequest.setKeyspace(keyspace);
    return sessionRequest;
  },
  closeSession: function(sessionId) {
    const sessionRequest = new messages.Session.Close.Req();
    sessionRequest.setSessionid(sessionId);
    return sessionRequest;
  },
  openTx: function (sessionId, txType) {
    const openRequest = new messages.Transaction.Open.Req();
    const txRequest = new messages.Transaction.Req();
    openRequest.setSessionid(sessionId);
    openRequest.setType(txType);
    txRequest.setOpenReq(openRequest);
    return txRequest;
  },
  commit: function () {
    const txRequest = new messages.Transaction.Req();
    const commitMessage = new messages.Transaction.Commit.Req();
    txRequest.setCommitReq(commitMessage);
    return txRequest;
  },
  iterOptions: function (batchSize) {
    return IterOptions(batchSize)
  },
  txIter: function (iterReqMessage) {
    const txRequest = new messages.Transaction.Req();
    txRequest.setIterReq(iterReqMessage);
    return txRequest;
  },
  continueIter: function (id, iterOptionsMessage) {
    const iterMessage = new messages.Transaction.Iter.Req();
    iterMessage.setOptions(iterOptionsMessage);
    iterMessage.setIteratorid(id);
    return iterMessage;
  },
  startQueryIter: function (query, options, iterOptionsMessage) {
    const iterMessage = new messages.Transaction.Iter.Req();
    iterMessage.setOptions(iterOptionsMessage);
    const queryMessage = new messages.Transaction.Query.Iter.Req();
    queryMessage.setQuery(query);
    if (options) {
      if ('infer' in options) {
        queryMessage.setInfer(options.infer ? INFER_TRUE_MESSAGE : INFER_FALSE_MESSAGE);
      }
    }
    iterMessage.setQueryIterReq(queryMessage);
    return iterMessage;
  },
  startGetAttributesByValueIter: function (value, valueType, iterOptionsMessage) {
    if (valueType == null) throw new Error('Valuetype of AttributeType not specified.');
    const valueObject = new messages.ValueObject();
    const getAttributesReq = new messages.Transaction.GetAttributes.Iter.Req();
    setAttributeValueObject(valueObject, valueType, value);
    getAttributesReq.setValue(valueObject);
    const iterMessage = new messages.Transaction.Iter.Req();
    iterMessage.setOptions(iterOptionsMessage);
    iterMessage.setGetattributesIterReq(getAttributesReq);
    return iterMessage;
  },
  explanation: function (grpcConceptMap) {
    const txRequest = new messages.Transaction.Req();
    const explMessage = new answerMessages.Explanation.Req();
    explMessage.setExplainable(grpcConceptMap);
    txRequest.setExplanationReq(explMessage);
    return txRequest;
  }

};

module.exports = methods;
