import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddChatMessageData {
  chatMessage_insert: ChatMessage_Key;
}

export interface AddChatMessageVariables {
  sessionId: UUIDString;
  role: string;
  content: string;
}

export interface AddCodeLinkData {
  codeLink_upsert: CodeLink_Key;
}

export interface AddCodeLinkVariables {
  paperId: UUIDString;
  url: string;
}

export interface ChatMessage_Key {
  id: UUIDString;
  __typename?: 'ChatMessage_Key';
}

export interface ChatSession_Key {
  id: UUIDString;
  __typename?: 'ChatSession_Key';
}

export interface CodeLink_Key {
  paperId: UUIDString;
  url: string;
  __typename?: 'CodeLink_Key';
}

export interface Codebase_Key {
  id: UUIDString;
  __typename?: 'Codebase_Key';
}

export interface Commit_Key {
  id: UUIDString;
  __typename?: 'Commit_Key';
}

export interface CreateChatSessionData {
  chatSession_insert: ChatSession_Key;
}

export interface CreateChatSessionVariables {
  title?: string | null;
}

export interface CreatePaperData {
  paper_insert: Paper_Key;
}

export interface CreatePaperVariables {
  title: string;
  authors?: string[] | null;
  year?: number | null;
  abstract?: string | null;
}

export interface DiscoveredPaper_Key {
  source: string;
  externalId: string;
  __typename?: 'DiscoveredPaper_Key';
}

export interface FileNode_Key {
  id: UUIDString;
  __typename?: 'FileNode_Key';
}

export interface GetPaperData {
  paper?: {
    id: UUIDString;
    title: string;
    authors?: string[] | null;
    year?: number | null;
    abstract?: string | null;
    citationCount?: number | null;
    codebase?: {
      repositoryUrl: string;
      isLinked: boolean;
      lastSyncedAt?: DateString | null;
      commits_on_codebase: ({
        sha: string;
        message?: string | null;
        author?: string | null;
        date: DateString;
      })[];
    };
      codeLinks: ({
        url: string;
      })[];
  } & Paper_Key;
}

export interface GetPaperVariables {
  id: UUIDString;
}

export interface LinkCodebaseData {
  codebase_upsert: Codebase_Key;
}

export interface LinkCodebaseVariables {
  paperId: UUIDString;
  repositoryUrl: string;
}

export interface ListPapersData {
  papers: ({
    id: UUIDString;
    title: string;
    year?: number | null;
    citationCount?: number | null;
    ingestionStatus?: string | null;
  } & Paper_Key)[];
}

export interface ListPapersVariables {
  pageSize?: number | null;
  offset?: number | null;
}

export interface MyPapersData {
  user?: {
    id: string;
    name?: string | null;
    email: string;
    curated: ({
      paper: {
        id: UUIDString;
        title: string;
        year?: number | null;
      } & Paper_Key;
    })[];
  } & User_Key;
}

export interface Paper_Key {
  id: UUIDString;
  __typename?: 'Paper_Key';
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  name?: string | null;
  email: string;
}

export interface UserPaper_Key {
  userId: string;
  paperId: UUIDString;
  __typename?: 'UserPaper_Key';
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface CreatePaperRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePaperVariables): MutationRef<CreatePaperData, CreatePaperVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePaperVariables): MutationRef<CreatePaperData, CreatePaperVariables>;
  operationName: string;
}
export const createPaperRef: CreatePaperRef;

export function createPaper(vars: CreatePaperVariables): MutationPromise<CreatePaperData, CreatePaperVariables>;
export function createPaper(dc: DataConnect, vars: CreatePaperVariables): MutationPromise<CreatePaperData, CreatePaperVariables>;

interface LinkCodebaseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkCodebaseVariables): MutationRef<LinkCodebaseData, LinkCodebaseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LinkCodebaseVariables): MutationRef<LinkCodebaseData, LinkCodebaseVariables>;
  operationName: string;
}
export const linkCodebaseRef: LinkCodebaseRef;

export function linkCodebase(vars: LinkCodebaseVariables): MutationPromise<LinkCodebaseData, LinkCodebaseVariables>;
export function linkCodebase(dc: DataConnect, vars: LinkCodebaseVariables): MutationPromise<LinkCodebaseData, LinkCodebaseVariables>;

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

interface CreateChatSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
  operationName: string;
}
export const createChatSessionRef: CreateChatSessionRef;

export function createChatSession(vars?: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;
export function createChatSession(dc: DataConnect, vars?: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;

interface AddChatMessageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddChatMessageVariables): MutationRef<AddChatMessageData, AddChatMessageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddChatMessageVariables): MutationRef<AddChatMessageData, AddChatMessageVariables>;
  operationName: string;
}
export const addChatMessageRef: AddChatMessageRef;

export function addChatMessage(vars: AddChatMessageVariables): MutationPromise<AddChatMessageData, AddChatMessageVariables>;
export function addChatMessage(dc: DataConnect, vars: AddChatMessageVariables): MutationPromise<AddChatMessageData, AddChatMessageVariables>;

interface ListPapersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
  operationName: string;
}
export const listPapersRef: ListPapersRef;

export function listPapers(vars?: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;
export function listPapers(dc: DataConnect, vars?: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;

interface MyPapersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyPapersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyPapersData, undefined>;
  operationName: string;
}
export const myPapersRef: MyPapersRef;

export function myPapers(): QueryPromise<MyPapersData, undefined>;
export function myPapers(dc: DataConnect): QueryPromise<MyPapersData, undefined>;

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

