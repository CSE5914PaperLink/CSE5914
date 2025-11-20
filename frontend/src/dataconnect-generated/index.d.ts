import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddChatData {
  chat_insert: Chat_Key;
}

export interface AddChatVariables {
  sessionId: UUIDString;
  content: string;
  response?: string | null;
  paperIds?: UUIDString[] | null;
}

export interface AddCodeLinkData {
  codeLink_insert: CodeLink_Key;
}

export interface AddCodeLinkVariables {
  paperId: UUIDString;
  url: string;
  repositoryName?: string | null;
}

export interface AddPaperData {
  paper_insert: Paper_Key;
}

export interface AddPaperVariables {
  userId: UUIDString;
  title: string;
  authors: string[];
  year?: number | null;
  paperType?: string | null;
  abstract?: string | null;
  arxivId?: string | null;
  pdfUrl?: string | null;
}

export interface ChatPaper_Key {
  chatId: UUIDString;
  paperId: UUIDString;
  __typename?: 'ChatPaper_Key';
}

export interface ChatSession_Key {
  id: UUIDString;
  __typename?: 'ChatSession_Key';
}

export interface Chat_Key {
  id: UUIDString;
  __typename?: 'Chat_Key';
}

export interface CodeLink_Key {
  id: UUIDString;
  __typename?: 'CodeLink_Key';
}

export interface CreateChatSessionData {
  chatSession_insert: ChatSession_Key;
}

export interface CreateChatSessionVariables {
  userId: UUIDString;
  title: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  email: string;
  name: string;
}

export interface DeleteChatSessionData {
  chatSession_delete?: ChatSession_Key | null;
}

export interface DeleteChatSessionVariables {
  sessionId: UUIDString;
}

export interface DeleteCodeLinkData {
  codeLink_delete?: CodeLink_Key | null;
}

export interface DeleteCodeLinkVariables {
  linkId: UUIDString;
}

export interface DeletePaperData {
  paper_delete?: Paper_Key | null;
}

export interface DeletePaperVariables {
  paperId: UUIDString;
}

export interface GetChatPapersForChatData {
  chatPapers: ({
    chat: {
      id: UUIDString;
    } & Chat_Key;
      paper: {
        id: UUIDString;
        title: string;
        arxivId?: string | null;
      } & Paper_Key;
  })[];
}

export interface GetChatPapersForChatVariables {
  chatId: UUIDString;
}

export interface GetChatSessionData {
  chatSession?: {
    id: UUIDString;
    user: {
      id: UUIDString;
    } & User_Key;
      title: string;
      createdAt: TimestampString;
      updatedAt: TimestampString;
  } & ChatSession_Key;
}

export interface GetChatSessionVariables {
  sessionId: UUIDString;
}

export interface GetChatsForSessionData {
  chats: ({
    id: UUIDString;
    chatSession: {
      id: UUIDString;
    } & ChatSession_Key;
      content: string;
      response?: string | null;
      createdAt: TimestampString;
  } & Chat_Key)[];
}

export interface GetChatsForSessionVariables {
  sessionId: UUIDString;
}

export interface GetCodeLinksForPaperData {
  codeLinks: ({
    id: UUIDString;
    paper: {
      id: UUIDString;
    } & Paper_Key;
      url: string;
      repositoryName?: string | null;
  } & CodeLink_Key)[];
}

export interface GetCodeLinksForPaperVariables {
  paperId: UUIDString;
}

export interface GetPaperData {
  paper?: {
    id: UUIDString;
    title: string;
    authors: string[];
    year?: number | null;
    paperType?: string | null;
    abstract?: string | null;
    arxivId?: string | null;
    ingestionStatus: string;
    citationCount?: number | null;
    createdAt: TimestampString;
    pdfUrl?: string | null;
  } & Paper_Key;
}

export interface GetPaperVariables {
  paperId: UUIDString;
}

export interface GetUserByEmailData {
  users: ({
    id: UUIDString;
    name: string;
    email: string;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface GetUserByEmailVariables {
  email: string;
}

export interface GetUserData {
  user?: {
    id: UUIDString;
    name: string;
    email: string;
    createdAt: TimestampString;
  } & User_Key;
}

export interface GetUserVariables {
  userId: UUIDString;
}

export interface LinkPaperToChatData {
  chatPaper_insert: ChatPaper_Key;
}

export interface LinkPaperToChatVariables {
  chatId: UUIDString;
  paperId: UUIDString;
}

export interface ListChatSessionsData {
  chatSessions: ({
    id: UUIDString;
    user: {
      id: UUIDString;
    } & User_Key;
      title: string;
      createdAt: TimestampString;
      updatedAt: TimestampString;
  } & ChatSession_Key)[];
}

export interface ListChatSessionsVariables {
  userId: UUIDString;
}

export interface ListPapersData {
  papers: ({
    id: UUIDString;
    user: {
      id: UUIDString;
    } & User_Key;
      title: string;
      authors: string[];
      year?: number | null;
      paperType?: string | null;
      abstract?: string | null;
      arxivId?: string | null;
      ingestionStatus: string;
      citationCount?: number | null;
      isFavorite: boolean;
      createdAt: TimestampString;
      pdfUrl?: string | null;
  } & Paper_Key)[];
}

export interface ListPapersVariables {
  userId: UUIDString;
}

export interface Paper_Key {
  id: UUIDString;
  __typename?: 'Paper_Key';
}

export interface SearchPapersData {
  papers: ({
    id: UUIDString;
    user: {
      id: UUIDString;
    } & User_Key;
      title: string;
      authors: string[];
      year?: number | null;
      abstract?: string | null;
      arxivId?: string | null;
      ingestionStatus: string;
  } & Paper_Key)[];
}

export interface SearchPapersVariables {
  userId: UUIDString;
  searchTerm: string;
}

export interface TogglePaperFavoriteData {
  paper_update?: Paper_Key | null;
}

export interface TogglePaperFavoriteVariables {
  paperId: UUIDString;
  isFavorite: boolean;
}

export interface UpdateChatSessionData {
  chatSession_update?: ChatSession_Key | null;
}

export interface UpdateChatSessionVariables {
  sessionId: UUIDString;
  title: string;
}

export interface UpdatePaperIngestionStatusData {
  paper_update?: Paper_Key | null;
}

export interface UpdatePaperIngestionStatusVariables {
  paperId: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface AddPaperRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddPaperVariables): MutationRef<AddPaperData, AddPaperVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddPaperVariables): MutationRef<AddPaperData, AddPaperVariables>;
  operationName: string;
}
export const addPaperRef: AddPaperRef;

export function addPaper(vars: AddPaperVariables): MutationPromise<AddPaperData, AddPaperVariables>;
export function addPaper(dc: DataConnect, vars: AddPaperVariables): MutationPromise<AddPaperData, AddPaperVariables>;

interface UpdatePaperIngestionStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePaperIngestionStatusVariables): MutationRef<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePaperIngestionStatusVariables): MutationRef<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
  operationName: string;
}
export const updatePaperIngestionStatusRef: UpdatePaperIngestionStatusRef;

export function updatePaperIngestionStatus(vars: UpdatePaperIngestionStatusVariables): MutationPromise<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
export function updatePaperIngestionStatus(dc: DataConnect, vars: UpdatePaperIngestionStatusVariables): MutationPromise<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;

interface DeletePaperRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePaperVariables): MutationRef<DeletePaperData, DeletePaperVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeletePaperVariables): MutationRef<DeletePaperData, DeletePaperVariables>;
  operationName: string;
}
export const deletePaperRef: DeletePaperRef;

export function deletePaper(vars: DeletePaperVariables): MutationPromise<DeletePaperData, DeletePaperVariables>;
export function deletePaper(dc: DataConnect, vars: DeletePaperVariables): MutationPromise<DeletePaperData, DeletePaperVariables>;

interface TogglePaperFavoriteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: TogglePaperFavoriteVariables): MutationRef<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: TogglePaperFavoriteVariables): MutationRef<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
  operationName: string;
}
export const togglePaperFavoriteRef: TogglePaperFavoriteRef;

export function togglePaperFavorite(vars: TogglePaperFavoriteVariables): MutationPromise<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
export function togglePaperFavorite(dc: DataConnect, vars: TogglePaperFavoriteVariables): MutationPromise<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;

interface CreateChatSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
  operationName: string;
}
export const createChatSessionRef: CreateChatSessionRef;

export function createChatSession(vars: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;
export function createChatSession(dc: DataConnect, vars: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;

interface UpdateChatSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateChatSessionVariables): MutationRef<UpdateChatSessionData, UpdateChatSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateChatSessionVariables): MutationRef<UpdateChatSessionData, UpdateChatSessionVariables>;
  operationName: string;
}
export const updateChatSessionRef: UpdateChatSessionRef;

export function updateChatSession(vars: UpdateChatSessionVariables): MutationPromise<UpdateChatSessionData, UpdateChatSessionVariables>;
export function updateChatSession(dc: DataConnect, vars: UpdateChatSessionVariables): MutationPromise<UpdateChatSessionData, UpdateChatSessionVariables>;

interface DeleteChatSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteChatSessionVariables): MutationRef<DeleteChatSessionData, DeleteChatSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteChatSessionVariables): MutationRef<DeleteChatSessionData, DeleteChatSessionVariables>;
  operationName: string;
}
export const deleteChatSessionRef: DeleteChatSessionRef;

export function deleteChatSession(vars: DeleteChatSessionVariables): MutationPromise<DeleteChatSessionData, DeleteChatSessionVariables>;
export function deleteChatSession(dc: DataConnect, vars: DeleteChatSessionVariables): MutationPromise<DeleteChatSessionData, DeleteChatSessionVariables>;

interface AddChatRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddChatVariables): MutationRef<AddChatData, AddChatVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddChatVariables): MutationRef<AddChatData, AddChatVariables>;
  operationName: string;
}
export const addChatRef: AddChatRef;

export function addChat(vars: AddChatVariables): MutationPromise<AddChatData, AddChatVariables>;
export function addChat(dc: DataConnect, vars: AddChatVariables): MutationPromise<AddChatData, AddChatVariables>;

interface LinkPaperToChatRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkPaperToChatVariables): MutationRef<LinkPaperToChatData, LinkPaperToChatVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LinkPaperToChatVariables): MutationRef<LinkPaperToChatData, LinkPaperToChatVariables>;
  operationName: string;
}
export const linkPaperToChatRef: LinkPaperToChatRef;

export function linkPaperToChat(vars: LinkPaperToChatVariables): MutationPromise<LinkPaperToChatData, LinkPaperToChatVariables>;
export function linkPaperToChat(dc: DataConnect, vars: LinkPaperToChatVariables): MutationPromise<LinkPaperToChatData, LinkPaperToChatVariables>;

interface AddCodeLinkRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCodeLinkVariables): MutationRef<AddCodeLinkData, AddCodeLinkVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddCodeLinkVariables): MutationRef<AddCodeLinkData, AddCodeLinkVariables>;
  operationName: string;
}
export const addCodeLinkRef: AddCodeLinkRef;

export function addCodeLink(vars: AddCodeLinkVariables): MutationPromise<AddCodeLinkData, AddCodeLinkVariables>;
export function addCodeLink(dc: DataConnect, vars: AddCodeLinkVariables): MutationPromise<AddCodeLinkData, AddCodeLinkVariables>;

interface DeleteCodeLinkRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCodeLinkVariables): MutationRef<DeleteCodeLinkData, DeleteCodeLinkVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCodeLinkVariables): MutationRef<DeleteCodeLinkData, DeleteCodeLinkVariables>;
  operationName: string;
}
export const deleteCodeLinkRef: DeleteCodeLinkRef;

export function deleteCodeLink(vars: DeleteCodeLinkVariables): MutationPromise<DeleteCodeLinkData, DeleteCodeLinkVariables>;
export function deleteCodeLink(dc: DataConnect, vars: DeleteCodeLinkVariables): MutationPromise<DeleteCodeLinkData, DeleteCodeLinkVariables>;

interface GetUserByEmailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  operationName: string;
}
export const getUserByEmailRef: GetUserByEmailRef;

export function getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;
export function getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface ListPapersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
  operationName: string;
}
export const listPapersRef: ListPapersRef;

export function listPapers(vars: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;
export function listPapers(dc: DataConnect, vars: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;

interface GetPaperRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPaperVariables): QueryRef<GetPaperData, GetPaperVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPaperVariables): QueryRef<GetPaperData, GetPaperVariables>;
  operationName: string;
}
export const getPaperRef: GetPaperRef;

export function getPaper(vars: GetPaperVariables): QueryPromise<GetPaperData, GetPaperVariables>;
export function getPaper(dc: DataConnect, vars: GetPaperVariables): QueryPromise<GetPaperData, GetPaperVariables>;

interface SearchPapersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchPapersVariables): QueryRef<SearchPapersData, SearchPapersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchPapersVariables): QueryRef<SearchPapersData, SearchPapersVariables>;
  operationName: string;
}
export const searchPapersRef: SearchPapersRef;

export function searchPapers(vars: SearchPapersVariables): QueryPromise<SearchPapersData, SearchPapersVariables>;
export function searchPapers(dc: DataConnect, vars: SearchPapersVariables): QueryPromise<SearchPapersData, SearchPapersVariables>;

interface ListChatSessionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListChatSessionsVariables): QueryRef<ListChatSessionsData, ListChatSessionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListChatSessionsVariables): QueryRef<ListChatSessionsData, ListChatSessionsVariables>;
  operationName: string;
}
export const listChatSessionsRef: ListChatSessionsRef;

export function listChatSessions(vars: ListChatSessionsVariables): QueryPromise<ListChatSessionsData, ListChatSessionsVariables>;
export function listChatSessions(dc: DataConnect, vars: ListChatSessionsVariables): QueryPromise<ListChatSessionsData, ListChatSessionsVariables>;

interface GetChatSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChatSessionVariables): QueryRef<GetChatSessionData, GetChatSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetChatSessionVariables): QueryRef<GetChatSessionData, GetChatSessionVariables>;
  operationName: string;
}
export const getChatSessionRef: GetChatSessionRef;

export function getChatSession(vars: GetChatSessionVariables): QueryPromise<GetChatSessionData, GetChatSessionVariables>;
export function getChatSession(dc: DataConnect, vars: GetChatSessionVariables): QueryPromise<GetChatSessionData, GetChatSessionVariables>;

interface GetChatsForSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChatsForSessionVariables): QueryRef<GetChatsForSessionData, GetChatsForSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetChatsForSessionVariables): QueryRef<GetChatsForSessionData, GetChatsForSessionVariables>;
  operationName: string;
}
export const getChatsForSessionRef: GetChatsForSessionRef;

export function getChatsForSession(vars: GetChatsForSessionVariables): QueryPromise<GetChatsForSessionData, GetChatsForSessionVariables>;
export function getChatsForSession(dc: DataConnect, vars: GetChatsForSessionVariables): QueryPromise<GetChatsForSessionData, GetChatsForSessionVariables>;

interface GetChatPapersForChatRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChatPapersForChatVariables): QueryRef<GetChatPapersForChatData, GetChatPapersForChatVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetChatPapersForChatVariables): QueryRef<GetChatPapersForChatData, GetChatPapersForChatVariables>;
  operationName: string;
}
export const getChatPapersForChatRef: GetChatPapersForChatRef;

export function getChatPapersForChat(vars: GetChatPapersForChatVariables): QueryPromise<GetChatPapersForChatData, GetChatPapersForChatVariables>;
export function getChatPapersForChat(dc: DataConnect, vars: GetChatPapersForChatVariables): QueryPromise<GetChatPapersForChatData, GetChatPapersForChatVariables>;

interface GetCodeLinksForPaperRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCodeLinksForPaperVariables): QueryRef<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCodeLinksForPaperVariables): QueryRef<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
  operationName: string;
}
export const getCodeLinksForPaperRef: GetCodeLinksForPaperRef;

export function getCodeLinksForPaper(vars: GetCodeLinksForPaperVariables): QueryPromise<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
export function getCodeLinksForPaper(dc: DataConnect, vars: GetCodeLinksForPaperVariables): QueryPromise<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;

