const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'paper-477421-2-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const getUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByEmail', inputVars);
}
getUserByEmailRef.operationName = 'GetUserByEmail';
exports.getUserByEmailRef = getUserByEmailRef;

exports.getUserByEmail = function getUserByEmail(dcOrVars, vars) {
  return executeQuery(getUserByEmailRef(dcOrVars, vars));
};

const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';
exports.getUserRef = getUserRef;

exports.getUser = function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
};

const listPapersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPapers', inputVars);
}
listPapersRef.operationName = 'ListPapers';
exports.listPapersRef = listPapersRef;

exports.listPapers = function listPapers(dcOrVars, vars) {
  return executeQuery(listPapersRef(dcOrVars, vars));
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

const searchPapersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchPapers', inputVars);
}
searchPapersRef.operationName = 'SearchPapers';
exports.searchPapersRef = searchPapersRef;

exports.searchPapers = function searchPapers(dcOrVars, vars) {
  return executeQuery(searchPapersRef(dcOrVars, vars));
};

const listChatSessionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListChatSessions', inputVars);
}
listChatSessionsRef.operationName = 'ListChatSessions';
exports.listChatSessionsRef = listChatSessionsRef;

exports.listChatSessions = function listChatSessions(dcOrVars, vars) {
  return executeQuery(listChatSessionsRef(dcOrVars, vars));
};

const getChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChatSession', inputVars);
}
getChatSessionRef.operationName = 'GetChatSession';
exports.getChatSessionRef = getChatSessionRef;

exports.getChatSession = function getChatSession(dcOrVars, vars) {
  return executeQuery(getChatSessionRef(dcOrVars, vars));
};

const getChatsForSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChatsForSession', inputVars);
}
getChatsForSessionRef.operationName = 'GetChatsForSession';
exports.getChatsForSessionRef = getChatsForSessionRef;

exports.getChatsForSession = function getChatsForSession(dcOrVars, vars) {
  return executeQuery(getChatsForSessionRef(dcOrVars, vars));
};

const getChatPapersForChatRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChatPapersForChat', inputVars);
}
getChatPapersForChatRef.operationName = 'GetChatPapersForChat';
exports.getChatPapersForChatRef = getChatPapersForChatRef;

exports.getChatPapersForChat = function getChatPapersForChat(dcOrVars, vars) {
  return executeQuery(getChatPapersForChatRef(dcOrVars, vars));
};

const getCodeLinksForPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCodeLinksForPaper', inputVars);
}
getCodeLinksForPaperRef.operationName = 'GetCodeLinksForPaper';
exports.getCodeLinksForPaperRef = getCodeLinksForPaperRef;

exports.getCodeLinksForPaper = function getCodeLinksForPaper(dcOrVars, vars) {
  return executeQuery(getCodeLinksForPaperRef(dcOrVars, vars));
};

const listSearchHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSearchHistory', inputVars);
}
listSearchHistoryRef.operationName = 'ListSearchHistory';
exports.listSearchHistoryRef = listSearchHistoryRef;

exports.listSearchHistory = function listSearchHistory(dcOrVars, vars) {
  return executeQuery(listSearchHistoryRef(dcOrVars, vars));
};

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const addPaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddPaper', inputVars);
}
addPaperRef.operationName = 'AddPaper';
exports.addPaperRef = addPaperRef;

exports.addPaper = function addPaper(dcOrVars, vars) {
  return executeMutation(addPaperRef(dcOrVars, vars));
};

const updatePaperIngestionStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePaperIngestionStatus', inputVars);
}
updatePaperIngestionStatusRef.operationName = 'UpdatePaperIngestionStatus';
exports.updatePaperIngestionStatusRef = updatePaperIngestionStatusRef;

exports.updatePaperIngestionStatus = function updatePaperIngestionStatus(dcOrVars, vars) {
  return executeMutation(updatePaperIngestionStatusRef(dcOrVars, vars));
};

const deletePaperRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeletePaper', inputVars);
}
deletePaperRef.operationName = 'DeletePaper';
exports.deletePaperRef = deletePaperRef;

exports.deletePaper = function deletePaper(dcOrVars, vars) {
  return executeMutation(deletePaperRef(dcOrVars, vars));
};

const togglePaperFavoriteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'TogglePaperFavorite', inputVars);
}
togglePaperFavoriteRef.operationName = 'TogglePaperFavorite';
exports.togglePaperFavoriteRef = togglePaperFavoriteRef;

exports.togglePaperFavorite = function togglePaperFavorite(dcOrVars, vars) {
  return executeMutation(togglePaperFavoriteRef(dcOrVars, vars));
};

const createChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChatSession', inputVars);
}
createChatSessionRef.operationName = 'CreateChatSession';
exports.createChatSessionRef = createChatSessionRef;

exports.createChatSession = function createChatSession(dcOrVars, vars) {
  return executeMutation(createChatSessionRef(dcOrVars, vars));
};

const updateChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateChatSession', inputVars);
}
updateChatSessionRef.operationName = 'UpdateChatSession';
exports.updateChatSessionRef = updateChatSessionRef;

exports.updateChatSession = function updateChatSession(dcOrVars, vars) {
  return executeMutation(updateChatSessionRef(dcOrVars, vars));
};

const deleteChatSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteChatSession', inputVars);
}
deleteChatSessionRef.operationName = 'DeleteChatSession';
exports.deleteChatSessionRef = deleteChatSessionRef;

exports.deleteChatSession = function deleteChatSession(dcOrVars, vars) {
  return executeMutation(deleteChatSessionRef(dcOrVars, vars));
};

const addChatRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddChat', inputVars);
}
addChatRef.operationName = 'AddChat';
exports.addChatRef = addChatRef;

exports.addChat = function addChat(dcOrVars, vars) {
  return executeMutation(addChatRef(dcOrVars, vars));
};

const linkPaperToChatRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkPaperToChat', inputVars);
}
linkPaperToChatRef.operationName = 'LinkPaperToChat';
exports.linkPaperToChatRef = linkPaperToChatRef;

exports.linkPaperToChat = function linkPaperToChat(dcOrVars, vars) {
  return executeMutation(linkPaperToChatRef(dcOrVars, vars));
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

const deleteCodeLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCodeLink', inputVars);
}
deleteCodeLinkRef.operationName = 'DeleteCodeLink';
exports.deleteCodeLinkRef = deleteCodeLinkRef;

exports.deleteCodeLink = function deleteCodeLink(dcOrVars, vars) {
  return executeMutation(deleteCodeLinkRef(dcOrVars, vars));
};

const addSearchHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddSearchHistory', inputVars);
}
addSearchHistoryRef.operationName = 'AddSearchHistory';
exports.addSearchHistoryRef = addSearchHistoryRef;

exports.addSearchHistory = function addSearchHistory(dcOrVars, vars) {
  return executeMutation(addSearchHistoryRef(dcOrVars, vars));
};
