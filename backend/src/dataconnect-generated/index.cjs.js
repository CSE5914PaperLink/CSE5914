const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'backend',
  location: 'us-east1'
};
exports.connectorConfig = connectorConfig;

const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';
exports.upsertUserRef = upsertUserRef;

exports.upsertUser = function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
};

const createPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePaper', inputVars);
}
createPaperRef.operationName = 'CreatePaper';
exports.createPaperRef = createPaperRef;

exports.createPaper = function createPaper(dcOrVars, vars) {
  return executeMutation(createPaperRef(dcOrVars, vars));
};

const linkCodebaseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkCodebase', inputVars);
}
linkCodebaseRef.operationName = 'LinkCodebase';
exports.linkCodebaseRef = linkCodebaseRef;

exports.linkCodebase = function linkCodebase(dcOrVars, vars) {
  return executeMutation(linkCodebaseRef(dcOrVars, vars));
};

const addCodeLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCodeLink', inputVars);
}
addCodeLinkRef.operationName = 'AddCodeLink';
exports.addCodeLinkRef = addCodeLinkRef;

exports.addCodeLink = function addCodeLink(dcOrVars, vars) {
  return executeMutation(addCodeLinkRef(dcOrVars, vars));
};

const createChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChatSession', inputVars);
}
createChatSessionRef.operationName = 'CreateChatSession';
exports.createChatSessionRef = createChatSessionRef;

exports.createChatSession = function createChatSession(dcOrVars, vars) {
  return executeMutation(createChatSessionRef(dcOrVars, vars));
};

const addChatMessageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddChatMessage', inputVars);
}
addChatMessageRef.operationName = 'AddChatMessage';
exports.addChatMessageRef = addChatMessageRef;

exports.addChatMessage = function addChatMessage(dcOrVars, vars) {
  return executeMutation(addChatMessageRef(dcOrVars, vars));
};

const listPapersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPapers', inputVars);
}
listPapersRef.operationName = 'ListPapers';
exports.listPapersRef = listPapersRef;

exports.listPapers = function listPapers(dcOrVars, vars) {
  return executeQuery(listPapersRef(dcOrVars, vars));
};

const myPapersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyPapers');
}
myPapersRef.operationName = 'MyPapers';
exports.myPapersRef = myPapersRef;

exports.myPapers = function myPapers(dc) {
  return executeQuery(myPapersRef(dc));
};

const getPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPaper', inputVars);
}
getPaperRef.operationName = 'GetPaper';
exports.getPaperRef = getPaperRef;

exports.getPaper = function getPaper(dcOrVars, vars) {
  return executeQuery(getPaperRef(dcOrVars, vars));
};
