import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'backend',
  location: 'us-east1'
};

export const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';

export function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
}

export const createPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePaper', inputVars);
}
createPaperRef.operationName = 'CreatePaper';

export function createPaper(dcOrVars, vars) {
  return executeMutation(createPaperRef(dcOrVars, vars));
}

export const linkCodebaseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkCodebase', inputVars);
}
linkCodebaseRef.operationName = 'LinkCodebase';

export function linkCodebase(dcOrVars, vars) {
  return executeMutation(linkCodebaseRef(dcOrVars, vars));
}

export const addCodeLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCodeLink', inputVars);
}
addCodeLinkRef.operationName = 'AddCodeLink';

export function addCodeLink(dcOrVars, vars) {
  return executeMutation(addCodeLinkRef(dcOrVars, vars));
}

export const createChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChatSession', inputVars);
}
createChatSessionRef.operationName = 'CreateChatSession';

export function createChatSession(dcOrVars, vars) {
  return executeMutation(createChatSessionRef(dcOrVars, vars));
}

export const addChatMessageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddChatMessage', inputVars);
}
addChatMessageRef.operationName = 'AddChatMessage';

export function addChatMessage(dcOrVars, vars) {
  return executeMutation(addChatMessageRef(dcOrVars, vars));
}

export const listPapersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPapers', inputVars);
}
listPapersRef.operationName = 'ListPapers';

export function listPapers(dcOrVars, vars) {
  return executeQuery(listPapersRef(dcOrVars, vars));
}

export const myPapersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyPapers');
}
myPapersRef.operationName = 'MyPapers';

export function myPapers(dc) {
  return executeQuery(myPapersRef(dc));
}

export const getPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPaper', inputVars);
}
getPaperRef.operationName = 'GetPaper';

export function getPaper(dcOrVars, vars) {
  return executeQuery(getPaperRef(dcOrVars, vars));
}

