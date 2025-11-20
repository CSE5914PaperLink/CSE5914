import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'paper-477421-2-service',
  location: 'us-east4'
};

export const getUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByEmail', inputVars);
}
getUserByEmailRef.operationName = 'GetUserByEmail';

export function getUserByEmail(dcOrVars, vars) {
  return executeQuery(getUserByEmailRef(dcOrVars, vars));
}

export const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';

export function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
}

export const listPapersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPapers', inputVars);
}
listPapersRef.operationName = 'ListPapers';

export function listPapers(dcOrVars, vars) {
  return executeQuery(listPapersRef(dcOrVars, vars));
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

export const searchPapersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchPapers', inputVars);
}
searchPapersRef.operationName = 'SearchPapers';

export function searchPapers(dcOrVars, vars) {
  return executeQuery(searchPapersRef(dcOrVars, vars));
}

export const listChatSessionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListChatSessions', inputVars);
}
listChatSessionsRef.operationName = 'ListChatSessions';

export function listChatSessions(dcOrVars, vars) {
  return executeQuery(listChatSessionsRef(dcOrVars, vars));
}

export const getChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChatSession', inputVars);
}
getChatSessionRef.operationName = 'GetChatSession';

export function getChatSession(dcOrVars, vars) {
  return executeQuery(getChatSessionRef(dcOrVars, vars));
}

export const getChatsForSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChatsForSession', inputVars);
}
getChatsForSessionRef.operationName = 'GetChatsForSession';

export function getChatsForSession(dcOrVars, vars) {
  return executeQuery(getChatsForSessionRef(dcOrVars, vars));
}

export const getChatPapersForChatRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChatPapersForChat', inputVars);
}
getChatPapersForChatRef.operationName = 'GetChatPapersForChat';

export function getChatPapersForChat(dcOrVars, vars) {
  return executeQuery(getChatPapersForChatRef(dcOrVars, vars));
}

export const getCodeLinksForPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCodeLinksForPaper', inputVars);
}
getCodeLinksForPaperRef.operationName = 'GetCodeLinksForPaper';

export function getCodeLinksForPaper(dcOrVars, vars) {
  return executeQuery(getCodeLinksForPaperRef(dcOrVars, vars));
}

export const listSearchHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSearchHistory', inputVars);
}
listSearchHistoryRef.operationName = 'ListSearchHistory';

export function listSearchHistory(dcOrVars, vars) {
  return executeQuery(listSearchHistoryRef(dcOrVars, vars));
}

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const addPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddPaper', inputVars);
}
addPaperRef.operationName = 'AddPaper';

export function addPaper(dcOrVars, vars) {
  return executeMutation(addPaperRef(dcOrVars, vars));
}

export const updatePaperIngestionStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePaperIngestionStatus', inputVars);
}
updatePaperIngestionStatusRef.operationName = 'UpdatePaperIngestionStatus';

export function updatePaperIngestionStatus(dcOrVars, vars) {
  return executeMutation(updatePaperIngestionStatusRef(dcOrVars, vars));
}

export const deletePaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeletePaper', inputVars);
}
deletePaperRef.operationName = 'DeletePaper';

export function deletePaper(dcOrVars, vars) {
  return executeMutation(deletePaperRef(dcOrVars, vars));
}

export const togglePaperFavoriteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'TogglePaperFavorite', inputVars);
}
togglePaperFavoriteRef.operationName = 'TogglePaperFavorite';

export function togglePaperFavorite(dcOrVars, vars) {
  return executeMutation(togglePaperFavoriteRef(dcOrVars, vars));
}

export const createChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChatSession', inputVars);
}
createChatSessionRef.operationName = 'CreateChatSession';

export function createChatSession(dcOrVars, vars) {
  return executeMutation(createChatSessionRef(dcOrVars, vars));
}

export const updateChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateChatSession', inputVars);
}
updateChatSessionRef.operationName = 'UpdateChatSession';

export function updateChatSession(dcOrVars, vars) {
  return executeMutation(updateChatSessionRef(dcOrVars, vars));
}

export const deleteChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteChatSession', inputVars);
}
deleteChatSessionRef.operationName = 'DeleteChatSession';

export function deleteChatSession(dcOrVars, vars) {
  return executeMutation(deleteChatSessionRef(dcOrVars, vars));
}

export const addChatRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddChat', inputVars);
}
addChatRef.operationName = 'AddChat';

export function addChat(dcOrVars, vars) {
  return executeMutation(addChatRef(dcOrVars, vars));
}

export const linkPaperToChatRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkPaperToChat', inputVars);
}
linkPaperToChatRef.operationName = 'LinkPaperToChat';

export function linkPaperToChat(dcOrVars, vars) {
  return executeMutation(linkPaperToChatRef(dcOrVars, vars));
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

export const deleteCodeLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCodeLink', inputVars);
}
deleteCodeLinkRef.operationName = 'DeleteCodeLink';

export function deleteCodeLink(dcOrVars, vars) {
  return executeMutation(deleteCodeLinkRef(dcOrVars, vars));
}

export const addSearchHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddSearchHistory', inputVars);
}
addSearchHistoryRef.operationName = 'AddSearchHistory';

export function addSearchHistory(dcOrVars, vars) {
  return executeMutation(addSearchHistoryRef(dcOrVars, vars));
}

