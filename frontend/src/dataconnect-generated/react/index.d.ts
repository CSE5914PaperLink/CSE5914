import { GetUserByEmailData, GetUserByEmailVariables, GetUserData, GetUserVariables, ListPapersData, ListPapersVariables, GetPaperData, GetPaperVariables, SearchPapersData, SearchPapersVariables, ListChatSessionsData, ListChatSessionsVariables, GetChatSessionData, GetChatSessionVariables, GetChatsForSessionData, GetChatsForSessionVariables, GetChatPapersForChatData, GetChatPapersForChatVariables, GetCodeLinksForPaperData, GetCodeLinksForPaperVariables, ListSearchHistoryData, ListSearchHistoryVariables, CreateUserData, CreateUserVariables, AddPaperData, AddPaperVariables, UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables, DeletePaperData, DeletePaperVariables, TogglePaperFavoriteData, TogglePaperFavoriteVariables, CreateChatSessionData, CreateChatSessionVariables, UpdateChatSessionData, UpdateChatSessionVariables, DeleteChatSessionData, DeleteChatSessionVariables, AddChatData, AddChatVariables, LinkPaperToChatData, LinkPaperToChatVariables, AddCodeLinkData, AddCodeLinkVariables, DeleteCodeLinkData, DeleteCodeLinkVariables, AddSearchHistoryData, AddSearchHistoryVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useGetUserByEmail(vars: GetUserByEmailVariables, options?: useDataConnectQueryOptions<GetUserByEmailData>): UseDataConnectQueryResult<GetUserByEmailData, GetUserByEmailVariables>;
export function useGetUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables, options?: useDataConnectQueryOptions<GetUserByEmailData>): UseDataConnectQueryResult<GetUserByEmailData, GetUserByEmailVariables>;

export function useGetUser(vars: GetUserVariables, options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, GetUserVariables>;
export function useGetUser(dc: DataConnect, vars: GetUserVariables, options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, GetUserVariables>;

export function useListPapers(vars: ListPapersVariables, options?: useDataConnectQueryOptions<ListPapersData>): UseDataConnectQueryResult<ListPapersData, ListPapersVariables>;
export function useListPapers(dc: DataConnect, vars: ListPapersVariables, options?: useDataConnectQueryOptions<ListPapersData>): UseDataConnectQueryResult<ListPapersData, ListPapersVariables>;

export function useGetPaper(vars: GetPaperVariables, options?: useDataConnectQueryOptions<GetPaperData>): UseDataConnectQueryResult<GetPaperData, GetPaperVariables>;
export function useGetPaper(dc: DataConnect, vars: GetPaperVariables, options?: useDataConnectQueryOptions<GetPaperData>): UseDataConnectQueryResult<GetPaperData, GetPaperVariables>;

export function useSearchPapers(vars: SearchPapersVariables, options?: useDataConnectQueryOptions<SearchPapersData>): UseDataConnectQueryResult<SearchPapersData, SearchPapersVariables>;
export function useSearchPapers(dc: DataConnect, vars: SearchPapersVariables, options?: useDataConnectQueryOptions<SearchPapersData>): UseDataConnectQueryResult<SearchPapersData, SearchPapersVariables>;

export function useListChatSessions(vars: ListChatSessionsVariables, options?: useDataConnectQueryOptions<ListChatSessionsData>): UseDataConnectQueryResult<ListChatSessionsData, ListChatSessionsVariables>;
export function useListChatSessions(dc: DataConnect, vars: ListChatSessionsVariables, options?: useDataConnectQueryOptions<ListChatSessionsData>): UseDataConnectQueryResult<ListChatSessionsData, ListChatSessionsVariables>;

export function useGetChatSession(vars: GetChatSessionVariables, options?: useDataConnectQueryOptions<GetChatSessionData>): UseDataConnectQueryResult<GetChatSessionData, GetChatSessionVariables>;
export function useGetChatSession(dc: DataConnect, vars: GetChatSessionVariables, options?: useDataConnectQueryOptions<GetChatSessionData>): UseDataConnectQueryResult<GetChatSessionData, GetChatSessionVariables>;

export function useGetChatsForSession(vars: GetChatsForSessionVariables, options?: useDataConnectQueryOptions<GetChatsForSessionData>): UseDataConnectQueryResult<GetChatsForSessionData, GetChatsForSessionVariables>;
export function useGetChatsForSession(dc: DataConnect, vars: GetChatsForSessionVariables, options?: useDataConnectQueryOptions<GetChatsForSessionData>): UseDataConnectQueryResult<GetChatsForSessionData, GetChatsForSessionVariables>;

export function useGetChatPapersForChat(vars: GetChatPapersForChatVariables, options?: useDataConnectQueryOptions<GetChatPapersForChatData>): UseDataConnectQueryResult<GetChatPapersForChatData, GetChatPapersForChatVariables>;
export function useGetChatPapersForChat(dc: DataConnect, vars: GetChatPapersForChatVariables, options?: useDataConnectQueryOptions<GetChatPapersForChatData>): UseDataConnectQueryResult<GetChatPapersForChatData, GetChatPapersForChatVariables>;

export function useGetCodeLinksForPaper(vars: GetCodeLinksForPaperVariables, options?: useDataConnectQueryOptions<GetCodeLinksForPaperData>): UseDataConnectQueryResult<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
export function useGetCodeLinksForPaper(dc: DataConnect, vars: GetCodeLinksForPaperVariables, options?: useDataConnectQueryOptions<GetCodeLinksForPaperData>): UseDataConnectQueryResult<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;

export function useListSearchHistory(vars: ListSearchHistoryVariables, options?: useDataConnectQueryOptions<ListSearchHistoryData>): UseDataConnectQueryResult<ListSearchHistoryData, ListSearchHistoryVariables>;
export function useListSearchHistory(dc: DataConnect, vars: ListSearchHistoryVariables, options?: useDataConnectQueryOptions<ListSearchHistoryData>): UseDataConnectQueryResult<ListSearchHistoryData, ListSearchHistoryVariables>;

export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useAddPaper(options?: useDataConnectMutationOptions<AddPaperData, FirebaseError, AddPaperVariables>): UseDataConnectMutationResult<AddPaperData, AddPaperVariables>;
export function useAddPaper(dc: DataConnect, options?: useDataConnectMutationOptions<AddPaperData, FirebaseError, AddPaperVariables>): UseDataConnectMutationResult<AddPaperData, AddPaperVariables>;

export function useUpdatePaperIngestionStatus(options?: useDataConnectMutationOptions<UpdatePaperIngestionStatusData, FirebaseError, UpdatePaperIngestionStatusVariables>): UseDataConnectMutationResult<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
export function useUpdatePaperIngestionStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePaperIngestionStatusData, FirebaseError, UpdatePaperIngestionStatusVariables>): UseDataConnectMutationResult<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;

export function useDeletePaper(options?: useDataConnectMutationOptions<DeletePaperData, FirebaseError, DeletePaperVariables>): UseDataConnectMutationResult<DeletePaperData, DeletePaperVariables>;
export function useDeletePaper(dc: DataConnect, options?: useDataConnectMutationOptions<DeletePaperData, FirebaseError, DeletePaperVariables>): UseDataConnectMutationResult<DeletePaperData, DeletePaperVariables>;

export function useTogglePaperFavorite(options?: useDataConnectMutationOptions<TogglePaperFavoriteData, FirebaseError, TogglePaperFavoriteVariables>): UseDataConnectMutationResult<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
export function useTogglePaperFavorite(dc: DataConnect, options?: useDataConnectMutationOptions<TogglePaperFavoriteData, FirebaseError, TogglePaperFavoriteVariables>): UseDataConnectMutationResult<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;

export function useCreateChatSession(options?: useDataConnectMutationOptions<CreateChatSessionData, FirebaseError, CreateChatSessionVariables>): UseDataConnectMutationResult<CreateChatSessionData, CreateChatSessionVariables>;
export function useCreateChatSession(dc: DataConnect, options?: useDataConnectMutationOptions<CreateChatSessionData, FirebaseError, CreateChatSessionVariables>): UseDataConnectMutationResult<CreateChatSessionData, CreateChatSessionVariables>;

export function useUpdateChatSession(options?: useDataConnectMutationOptions<UpdateChatSessionData, FirebaseError, UpdateChatSessionVariables>): UseDataConnectMutationResult<UpdateChatSessionData, UpdateChatSessionVariables>;
export function useUpdateChatSession(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateChatSessionData, FirebaseError, UpdateChatSessionVariables>): UseDataConnectMutationResult<UpdateChatSessionData, UpdateChatSessionVariables>;

export function useDeleteChatSession(options?: useDataConnectMutationOptions<DeleteChatSessionData, FirebaseError, DeleteChatSessionVariables>): UseDataConnectMutationResult<DeleteChatSessionData, DeleteChatSessionVariables>;
export function useDeleteChatSession(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteChatSessionData, FirebaseError, DeleteChatSessionVariables>): UseDataConnectMutationResult<DeleteChatSessionData, DeleteChatSessionVariables>;

export function useAddChat(options?: useDataConnectMutationOptions<AddChatData, FirebaseError, AddChatVariables>): UseDataConnectMutationResult<AddChatData, AddChatVariables>;
export function useAddChat(dc: DataConnect, options?: useDataConnectMutationOptions<AddChatData, FirebaseError, AddChatVariables>): UseDataConnectMutationResult<AddChatData, AddChatVariables>;

export function useLinkPaperToChat(options?: useDataConnectMutationOptions<LinkPaperToChatData, FirebaseError, LinkPaperToChatVariables>): UseDataConnectMutationResult<LinkPaperToChatData, LinkPaperToChatVariables>;
export function useLinkPaperToChat(dc: DataConnect, options?: useDataConnectMutationOptions<LinkPaperToChatData, FirebaseError, LinkPaperToChatVariables>): UseDataConnectMutationResult<LinkPaperToChatData, LinkPaperToChatVariables>;

export function useAddCodeLink(options?: useDataConnectMutationOptions<AddCodeLinkData, FirebaseError, AddCodeLinkVariables>): UseDataConnectMutationResult<AddCodeLinkData, AddCodeLinkVariables>;
export function useAddCodeLink(dc: DataConnect, options?: useDataConnectMutationOptions<AddCodeLinkData, FirebaseError, AddCodeLinkVariables>): UseDataConnectMutationResult<AddCodeLinkData, AddCodeLinkVariables>;

export function useDeleteCodeLink(options?: useDataConnectMutationOptions<DeleteCodeLinkData, FirebaseError, DeleteCodeLinkVariables>): UseDataConnectMutationResult<DeleteCodeLinkData, DeleteCodeLinkVariables>;
export function useDeleteCodeLink(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCodeLinkData, FirebaseError, DeleteCodeLinkVariables>): UseDataConnectMutationResult<DeleteCodeLinkData, DeleteCodeLinkVariables>;

export function useAddSearchHistory(options?: useDataConnectMutationOptions<AddSearchHistoryData, FirebaseError, AddSearchHistoryVariables>): UseDataConnectMutationResult<AddSearchHistoryData, AddSearchHistoryVariables>;
export function useAddSearchHistory(dc: DataConnect, options?: useDataConnectMutationOptions<AddSearchHistoryData, FirebaseError, AddSearchHistoryVariables>): UseDataConnectMutationResult<AddSearchHistoryData, AddSearchHistoryVariables>;
