# Generated React README
This README will guide you through the process of using the generated React SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/react` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#react).

# Table of Contents
- [**Overview**](#generated-react-readme)
- [**TanStack Query Firebase & TanStack React Query**](#tanstack-query-firebase-tanstack-react-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-react-query-packages)
  - [*Configuring TanStack Query*](#configuring-tanstack-query)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUserByEmail*](#getuserbyemail)
  - [*GetUser*](#getuser)
  - [*ListPapers*](#listpapers)
  - [*GetPaper*](#getpaper)
  - [*SearchPapers*](#searchpapers)
  - [*ListChatSessions*](#listchatsessions)
  - [*GetChatSession*](#getchatsession)
  - [*GetChatsForSession*](#getchatsforsession)
  - [*GetChatPapersForChat*](#getchatpapersforchat)
  - [*GetCodeLinksForPaper*](#getcodelinksforpaper)
  - [*ListSearchHistory*](#listsearchhistory)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*AddPaper*](#addpaper)
  - [*UpdatePaperIngestionStatus*](#updatepaperingestionstatus)
  - [*DeletePaper*](#deletepaper)
  - [*TogglePaperFavorite*](#togglepaperfavorite)
  - [*CreateChatSession*](#createchatsession)
  - [*UpdateChatSession*](#updatechatsession)
  - [*DeleteChatSession*](#deletechatsession)
  - [*AddChat*](#addchat)
  - [*LinkPaperToChat*](#linkpapertochat)
  - [*AddCodeLink*](#addcodelink)
  - [*DeleteCodeLink*](#deletecodelink)
  - [*AddSearchHistory*](#addsearchhistory)

# TanStack Query Firebase & TanStack React Query
This SDK provides [React](https://react.dev/) hooks generated specific to your application, for the operations found in the connector `example`. These hooks are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack React Query v5](https://tanstack.com/query/v5/docs/framework/react/overview).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated React SDK.

## Installing TanStack Query Firebase and TanStack React Query Packages
In order to use the React generated SDK, you must install the `TanStack React Query` and `TanStack Query Firebase` packages.
```bash
npm i --save @tanstack/react-query @tanstack-query-firebase/react
```
```bash
npm i --save firebase@latest # Note: React has a peer dependency on ^11.3.0
```

You can also follow the installation instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#tanstack-install), or the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react) and [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/installation).

## Configuring TanStack Query
In order to use the React generated SDK in your application, you must wrap your application's component tree in a `QueryClientProvider` component from TanStack React Query. None of your generated React SDK hooks will work without this provider.

```javascript
import { QueryClientProvider } from '@tanstack/react-query';

// Create a TanStack Query client instance
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <MyApplication />
    </QueryClientProvider>
  )
}
```

To learn more about `QueryClientProvider`, see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/quick-start) and the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/react#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the hooks provided from your generated React SDK.

# Queries

The React generated SDK provides Query hook functions that call and return [`useDataConnectQuery`](https://react-query-firebase.invertase.dev/react/data-connect/querying) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/querying).

TanStack React Query caches the results of your Queries, so using the same Query hook function in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query hooks execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries).

To learn more about TanStack React Query's Queries, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/queries).

## Using Query Hooks
Here's a general overview of how to use the generated Query hooks in your code:

- If the Query has no variables, the Query hook function does not require arguments.
- If the Query has any required variables, the Query hook function will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query hook function does not require any arguments.
- Query hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Query hooks functions can be called with or without passing in an `options` argument of type `useDataConnectQueryOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query hook function without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `example` connector's generated Query hook functions to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## GetUserByEmail
You can execute the `GetUserByEmail` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables, options?: useDataConnectQueryOptions<GetUserByEmailData>): UseDataConnectQueryResult<GetUserByEmailData, GetUserByEmailVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetUserByEmail(vars: GetUserByEmailVariables, options?: useDataConnectQueryOptions<GetUserByEmailData>): UseDataConnectQueryResult<GetUserByEmailData, GetUserByEmailVariables>;
```

### Variables
The `GetUserByEmail` Query requires an argument of type `GetUserByEmailVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetUserByEmailVariables {
  email: string;
}
```
### Return Type
Recall that calling the `GetUserByEmail` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetUserByEmail` Query is of type `GetUserByEmailData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface GetUserByEmailData {
  users: ({
    id: UUIDString;
    name: string;
    email: string;
    createdAt: TimestampString;
  } & User_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetUserByEmail`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetUserByEmailVariables } from '@dataconnect/generated';
import { useGetUserByEmail } from '@dataconnect/generated/react'

export default function GetUserByEmailComponent() {
  // The `useGetUserByEmail` Query hook requires an argument of type `GetUserByEmailVariables`:
  const getUserByEmailVars: GetUserByEmailVariables = {
    email: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetUserByEmail(getUserByEmailVars);
  // Variables can be defined inline as well.
  const query = useGetUserByEmail({ email: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetUserByEmail(dataConnect, getUserByEmailVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetUserByEmail(getUserByEmailVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetUserByEmail(dataConnect, getUserByEmailVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.users);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetUser
You can execute the `GetUser` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetUser(dc: DataConnect, vars: GetUserVariables, options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, GetUserVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetUser(vars: GetUserVariables, options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, GetUserVariables>;
```

### Variables
The `GetUser` Query requires an argument of type `GetUserVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that calling the `GetUser` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetUser` Query is of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface GetUserData {
  user?: {
    id: UUIDString;
    name: string;
    email: string;
    createdAt: TimestampString;
  } & User_Key;
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetUser`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetUserVariables } from '@dataconnect/generated';
import { useGetUser } from '@dataconnect/generated/react'

export default function GetUserComponent() {
  // The `useGetUser` Query hook requires an argument of type `GetUserVariables`:
  const getUserVars: GetUserVariables = {
    userId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetUser(getUserVars);
  // Variables can be defined inline as well.
  const query = useGetUser({ userId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetUser(dataConnect, getUserVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetUser(getUserVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetUser(dataConnect, getUserVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.user);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListPapers
You can execute the `ListPapers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListPapers(dc: DataConnect, vars: ListPapersVariables, options?: useDataConnectQueryOptions<ListPapersData>): UseDataConnectQueryResult<ListPapersData, ListPapersVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListPapers(vars: ListPapersVariables, options?: useDataConnectQueryOptions<ListPapersData>): UseDataConnectQueryResult<ListPapersData, ListPapersVariables>;
```

### Variables
The `ListPapers` Query requires an argument of type `ListPapersVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListPapersVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that calling the `ListPapers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListPapers` Query is of type `ListPapersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListPapers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListPapersVariables } from '@dataconnect/generated';
import { useListPapers } from '@dataconnect/generated/react'

export default function ListPapersComponent() {
  // The `useListPapers` Query hook requires an argument of type `ListPapersVariables`:
  const listPapersVars: ListPapersVariables = {
    userId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListPapers(listPapersVars);
  // Variables can be defined inline as well.
  const query = useListPapers({ userId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListPapers(dataConnect, listPapersVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListPapers(listPapersVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListPapers(dataConnect, listPapersVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.papers);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetPaper
You can execute the `GetPaper` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetPaper(dc: DataConnect, vars: GetPaperVariables, options?: useDataConnectQueryOptions<GetPaperData>): UseDataConnectQueryResult<GetPaperData, GetPaperVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetPaper(vars: GetPaperVariables, options?: useDataConnectQueryOptions<GetPaperData>): UseDataConnectQueryResult<GetPaperData, GetPaperVariables>;
```

### Variables
The `GetPaper` Query requires an argument of type `GetPaperVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetPaperVariables {
  paperId: UUIDString;
}
```
### Return Type
Recall that calling the `GetPaper` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetPaper` Query is of type `GetPaperData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetPaper`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetPaperVariables } from '@dataconnect/generated';
import { useGetPaper } from '@dataconnect/generated/react'

export default function GetPaperComponent() {
  // The `useGetPaper` Query hook requires an argument of type `GetPaperVariables`:
  const getPaperVars: GetPaperVariables = {
    paperId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetPaper(getPaperVars);
  // Variables can be defined inline as well.
  const query = useGetPaper({ paperId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetPaper(dataConnect, getPaperVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetPaper(getPaperVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetPaper(dataConnect, getPaperVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.paper);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## SearchPapers
You can execute the `SearchPapers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useSearchPapers(dc: DataConnect, vars: SearchPapersVariables, options?: useDataConnectQueryOptions<SearchPapersData>): UseDataConnectQueryResult<SearchPapersData, SearchPapersVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useSearchPapers(vars: SearchPapersVariables, options?: useDataConnectQueryOptions<SearchPapersData>): UseDataConnectQueryResult<SearchPapersData, SearchPapersVariables>;
```

### Variables
The `SearchPapers` Query requires an argument of type `SearchPapersVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface SearchPapersVariables {
  userId: UUIDString;
  searchTerm: string;
}
```
### Return Type
Recall that calling the `SearchPapers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `SearchPapers` Query is of type `SearchPapersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `SearchPapers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, SearchPapersVariables } from '@dataconnect/generated';
import { useSearchPapers } from '@dataconnect/generated/react'

export default function SearchPapersComponent() {
  // The `useSearchPapers` Query hook requires an argument of type `SearchPapersVariables`:
  const searchPapersVars: SearchPapersVariables = {
    userId: ..., 
    searchTerm: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useSearchPapers(searchPapersVars);
  // Variables can be defined inline as well.
  const query = useSearchPapers({ userId: ..., searchTerm: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useSearchPapers(dataConnect, searchPapersVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useSearchPapers(searchPapersVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useSearchPapers(dataConnect, searchPapersVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.papers);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListChatSessions
You can execute the `ListChatSessions` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListChatSessions(dc: DataConnect, vars: ListChatSessionsVariables, options?: useDataConnectQueryOptions<ListChatSessionsData>): UseDataConnectQueryResult<ListChatSessionsData, ListChatSessionsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListChatSessions(vars: ListChatSessionsVariables, options?: useDataConnectQueryOptions<ListChatSessionsData>): UseDataConnectQueryResult<ListChatSessionsData, ListChatSessionsVariables>;
```

### Variables
The `ListChatSessions` Query requires an argument of type `ListChatSessionsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListChatSessionsVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that calling the `ListChatSessions` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListChatSessions` Query is of type `ListChatSessionsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListChatSessions`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListChatSessionsVariables } from '@dataconnect/generated';
import { useListChatSessions } from '@dataconnect/generated/react'

export default function ListChatSessionsComponent() {
  // The `useListChatSessions` Query hook requires an argument of type `ListChatSessionsVariables`:
  const listChatSessionsVars: ListChatSessionsVariables = {
    userId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListChatSessions(listChatSessionsVars);
  // Variables can be defined inline as well.
  const query = useListChatSessions({ userId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListChatSessions(dataConnect, listChatSessionsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListChatSessions(listChatSessionsVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListChatSessions(dataConnect, listChatSessionsVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.chatSessions);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetChatSession
You can execute the `GetChatSession` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetChatSession(dc: DataConnect, vars: GetChatSessionVariables, options?: useDataConnectQueryOptions<GetChatSessionData>): UseDataConnectQueryResult<GetChatSessionData, GetChatSessionVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetChatSession(vars: GetChatSessionVariables, options?: useDataConnectQueryOptions<GetChatSessionData>): UseDataConnectQueryResult<GetChatSessionData, GetChatSessionVariables>;
```

### Variables
The `GetChatSession` Query requires an argument of type `GetChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetChatSessionVariables {
  sessionId: UUIDString;
}
```
### Return Type
Recall that calling the `GetChatSession` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetChatSession` Query is of type `GetChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetChatSession`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetChatSessionVariables } from '@dataconnect/generated';
import { useGetChatSession } from '@dataconnect/generated/react'

export default function GetChatSessionComponent() {
  // The `useGetChatSession` Query hook requires an argument of type `GetChatSessionVariables`:
  const getChatSessionVars: GetChatSessionVariables = {
    sessionId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetChatSession(getChatSessionVars);
  // Variables can be defined inline as well.
  const query = useGetChatSession({ sessionId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetChatSession(dataConnect, getChatSessionVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetChatSession(getChatSessionVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetChatSession(dataConnect, getChatSessionVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.chatSession);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetChatsForSession
You can execute the `GetChatsForSession` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetChatsForSession(dc: DataConnect, vars: GetChatsForSessionVariables, options?: useDataConnectQueryOptions<GetChatsForSessionData>): UseDataConnectQueryResult<GetChatsForSessionData, GetChatsForSessionVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetChatsForSession(vars: GetChatsForSessionVariables, options?: useDataConnectQueryOptions<GetChatsForSessionData>): UseDataConnectQueryResult<GetChatsForSessionData, GetChatsForSessionVariables>;
```

### Variables
The `GetChatsForSession` Query requires an argument of type `GetChatsForSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetChatsForSessionVariables {
  sessionId: UUIDString;
}
```
### Return Type
Recall that calling the `GetChatsForSession` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetChatsForSession` Query is of type `GetChatsForSessionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetChatsForSession`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetChatsForSessionVariables } from '@dataconnect/generated';
import { useGetChatsForSession } from '@dataconnect/generated/react'

export default function GetChatsForSessionComponent() {
  // The `useGetChatsForSession` Query hook requires an argument of type `GetChatsForSessionVariables`:
  const getChatsForSessionVars: GetChatsForSessionVariables = {
    sessionId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetChatsForSession(getChatsForSessionVars);
  // Variables can be defined inline as well.
  const query = useGetChatsForSession({ sessionId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetChatsForSession(dataConnect, getChatsForSessionVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetChatsForSession(getChatsForSessionVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetChatsForSession(dataConnect, getChatsForSessionVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.chats);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetChatPapersForChat
You can execute the `GetChatPapersForChat` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetChatPapersForChat(dc: DataConnect, vars: GetChatPapersForChatVariables, options?: useDataConnectQueryOptions<GetChatPapersForChatData>): UseDataConnectQueryResult<GetChatPapersForChatData, GetChatPapersForChatVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetChatPapersForChat(vars: GetChatPapersForChatVariables, options?: useDataConnectQueryOptions<GetChatPapersForChatData>): UseDataConnectQueryResult<GetChatPapersForChatData, GetChatPapersForChatVariables>;
```

### Variables
The `GetChatPapersForChat` Query requires an argument of type `GetChatPapersForChatVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetChatPapersForChatVariables {
  chatId: UUIDString;
}
```
### Return Type
Recall that calling the `GetChatPapersForChat` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetChatPapersForChat` Query is of type `GetChatPapersForChatData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetChatPapersForChat`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetChatPapersForChatVariables } from '@dataconnect/generated';
import { useGetChatPapersForChat } from '@dataconnect/generated/react'

export default function GetChatPapersForChatComponent() {
  // The `useGetChatPapersForChat` Query hook requires an argument of type `GetChatPapersForChatVariables`:
  const getChatPapersForChatVars: GetChatPapersForChatVariables = {
    chatId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetChatPapersForChat(getChatPapersForChatVars);
  // Variables can be defined inline as well.
  const query = useGetChatPapersForChat({ chatId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetChatPapersForChat(dataConnect, getChatPapersForChatVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetChatPapersForChat(getChatPapersForChatVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetChatPapersForChat(dataConnect, getChatPapersForChatVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.chatPapers);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetCodeLinksForPaper
You can execute the `GetCodeLinksForPaper` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetCodeLinksForPaper(dc: DataConnect, vars: GetCodeLinksForPaperVariables, options?: useDataConnectQueryOptions<GetCodeLinksForPaperData>): UseDataConnectQueryResult<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetCodeLinksForPaper(vars: GetCodeLinksForPaperVariables, options?: useDataConnectQueryOptions<GetCodeLinksForPaperData>): UseDataConnectQueryResult<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
```

### Variables
The `GetCodeLinksForPaper` Query requires an argument of type `GetCodeLinksForPaperVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetCodeLinksForPaperVariables {
  paperId: UUIDString;
}
```
### Return Type
Recall that calling the `GetCodeLinksForPaper` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetCodeLinksForPaper` Query is of type `GetCodeLinksForPaperData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetCodeLinksForPaper`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetCodeLinksForPaperVariables } from '@dataconnect/generated';
import { useGetCodeLinksForPaper } from '@dataconnect/generated/react'

export default function GetCodeLinksForPaperComponent() {
  // The `useGetCodeLinksForPaper` Query hook requires an argument of type `GetCodeLinksForPaperVariables`:
  const getCodeLinksForPaperVars: GetCodeLinksForPaperVariables = {
    paperId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetCodeLinksForPaper(getCodeLinksForPaperVars);
  // Variables can be defined inline as well.
  const query = useGetCodeLinksForPaper({ paperId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetCodeLinksForPaper(dataConnect, getCodeLinksForPaperVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetCodeLinksForPaper(getCodeLinksForPaperVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetCodeLinksForPaper(dataConnect, getCodeLinksForPaperVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.codeLinks);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListSearchHistory
You can execute the `ListSearchHistory` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListSearchHistory(dc: DataConnect, vars: ListSearchHistoryVariables, options?: useDataConnectQueryOptions<ListSearchHistoryData>): UseDataConnectQueryResult<ListSearchHistoryData, ListSearchHistoryVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListSearchHistory(vars: ListSearchHistoryVariables, options?: useDataConnectQueryOptions<ListSearchHistoryData>): UseDataConnectQueryResult<ListSearchHistoryData, ListSearchHistoryVariables>;
```

### Variables
The `ListSearchHistory` Query requires an argument of type `ListSearchHistoryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListSearchHistoryVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that calling the `ListSearchHistory` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListSearchHistory` Query is of type `ListSearchHistoryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListSearchHistoryData {
  searchHistories: ({
    id: UUIDString;
    query: string;
    resultsCount?: number | null;
    createdAt: TimestampString;
  } & SearchHistory_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListSearchHistory`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListSearchHistoryVariables } from '@dataconnect/generated';
import { useListSearchHistory } from '@dataconnect/generated/react'

export default function ListSearchHistoryComponent() {
  // The `useListSearchHistory` Query hook requires an argument of type `ListSearchHistoryVariables`:
  const listSearchHistoryVars: ListSearchHistoryVariables = {
    userId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListSearchHistory(listSearchHistoryVars);
  // Variables can be defined inline as well.
  const query = useListSearchHistory({ userId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListSearchHistory(dataConnect, listSearchHistoryVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListSearchHistory(listSearchHistoryVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListSearchHistory(dataConnect, listSearchHistoryVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.searchHistories);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

# Mutations

The React generated SDK provides Mutations hook functions that call and return [`useDataConnectMutation`](https://react-query-firebase.invertase.dev/react/data-connect/mutations) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/mutations).

Mutation hooks do not execute their Mutations automatically when called. Rather, after calling the Mutation hook function and getting a `UseMutationResult` object, you must call the `UseMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack React Query's Mutations, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).

## Using Mutation Hooks
Here's a general overview of how to use the generated Mutation hooks in your code:

- Mutation hook functions are not called with the arguments to the Mutation. Instead, arguments are passed to `UseMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation hook function does not require any arguments.
- Mutation hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Mutation hooks also accept an `options` argument of type `useDataConnectMutationOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-side-effects).
  - `UseMutationResult.mutate()` also accepts an `options` argument of type `useDataConnectMutationOptions`.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `UseMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `example` connector's generated Mutation hook functions to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## CreateUser
You can execute the `CreateUser` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
```

### Variables
The `CreateUser` Mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateUserVariables {
  email: string;
  name: string;
}
```
### Return Type
Recall that calling the `CreateUser` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateUser` Mutation is of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateUserData {
  user_insert: User_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateUser`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateUserVariables } from '@dataconnect/generated';
import { useCreateUser } from '@dataconnect/generated/react'

export default function CreateUserComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateUser();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateUser(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateUser(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateUser(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateUser` Mutation requires an argument of type `CreateUserVariables`:
  const createUserVars: CreateUserVariables = {
    email: ..., 
    name: ..., 
  };
  mutation.mutate(createUserVars);
  // Variables can be defined inline as well.
  mutation.mutate({ email: ..., name: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createUserVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.user_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## AddPaper
You can execute the `AddPaper` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useAddPaper(options?: useDataConnectMutationOptions<AddPaperData, FirebaseError, AddPaperVariables>): UseDataConnectMutationResult<AddPaperData, AddPaperVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useAddPaper(dc: DataConnect, options?: useDataConnectMutationOptions<AddPaperData, FirebaseError, AddPaperVariables>): UseDataConnectMutationResult<AddPaperData, AddPaperVariables>;
```

### Variables
The `AddPaper` Mutation requires an argument of type `AddPaperVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `AddPaper` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `AddPaper` Mutation is of type `AddPaperData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface AddPaperData {
  paper_insert: Paper_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `AddPaper`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, AddPaperVariables } from '@dataconnect/generated';
import { useAddPaper } from '@dataconnect/generated/react'

export default function AddPaperComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useAddPaper();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useAddPaper(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddPaper(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddPaper(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useAddPaper` Mutation requires an argument of type `AddPaperVariables`:
  const addPaperVars: AddPaperVariables = {
    userId: ..., 
    title: ..., 
    authors: ..., 
    year: ..., // optional
    paperType: ..., // optional
    abstract: ..., // optional
    arxivId: ..., // optional
    pdfUrl: ..., // optional
  };
  mutation.mutate(addPaperVars);
  // Variables can be defined inline as well.
  mutation.mutate({ userId: ..., title: ..., authors: ..., year: ..., paperType: ..., abstract: ..., arxivId: ..., pdfUrl: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(addPaperVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.paper_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdatePaperIngestionStatus
You can execute the `UpdatePaperIngestionStatus` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdatePaperIngestionStatus(options?: useDataConnectMutationOptions<UpdatePaperIngestionStatusData, FirebaseError, UpdatePaperIngestionStatusVariables>): UseDataConnectMutationResult<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdatePaperIngestionStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePaperIngestionStatusData, FirebaseError, UpdatePaperIngestionStatusVariables>): UseDataConnectMutationResult<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
```

### Variables
The `UpdatePaperIngestionStatus` Mutation requires an argument of type `UpdatePaperIngestionStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdatePaperIngestionStatusVariables {
  paperId: UUIDString;
  status: string;
}
```
### Return Type
Recall that calling the `UpdatePaperIngestionStatus` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdatePaperIngestionStatus` Mutation is of type `UpdatePaperIngestionStatusData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdatePaperIngestionStatusData {
  paper_update?: Paper_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdatePaperIngestionStatus`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdatePaperIngestionStatusVariables } from '@dataconnect/generated';
import { useUpdatePaperIngestionStatus } from '@dataconnect/generated/react'

export default function UpdatePaperIngestionStatusComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdatePaperIngestionStatus();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdatePaperIngestionStatus(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePaperIngestionStatus(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePaperIngestionStatus(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdatePaperIngestionStatus` Mutation requires an argument of type `UpdatePaperIngestionStatusVariables`:
  const updatePaperIngestionStatusVars: UpdatePaperIngestionStatusVariables = {
    paperId: ..., 
    status: ..., 
  };
  mutation.mutate(updatePaperIngestionStatusVars);
  // Variables can be defined inline as well.
  mutation.mutate({ paperId: ..., status: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updatePaperIngestionStatusVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.paper_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## DeletePaper
You can execute the `DeletePaper` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useDeletePaper(options?: useDataConnectMutationOptions<DeletePaperData, FirebaseError, DeletePaperVariables>): UseDataConnectMutationResult<DeletePaperData, DeletePaperVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useDeletePaper(dc: DataConnect, options?: useDataConnectMutationOptions<DeletePaperData, FirebaseError, DeletePaperVariables>): UseDataConnectMutationResult<DeletePaperData, DeletePaperVariables>;
```

### Variables
The `DeletePaper` Mutation requires an argument of type `DeletePaperVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface DeletePaperVariables {
  paperId: UUIDString;
}
```
### Return Type
Recall that calling the `DeletePaper` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `DeletePaper` Mutation is of type `DeletePaperData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeletePaperData {
  paper_delete?: Paper_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `DeletePaper`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, DeletePaperVariables } from '@dataconnect/generated';
import { useDeletePaper } from '@dataconnect/generated/react'

export default function DeletePaperComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useDeletePaper();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useDeletePaper(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeletePaper(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeletePaper(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useDeletePaper` Mutation requires an argument of type `DeletePaperVariables`:
  const deletePaperVars: DeletePaperVariables = {
    paperId: ..., 
  };
  mutation.mutate(deletePaperVars);
  // Variables can be defined inline as well.
  mutation.mutate({ paperId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(deletePaperVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.paper_delete);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## TogglePaperFavorite
You can execute the `TogglePaperFavorite` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useTogglePaperFavorite(options?: useDataConnectMutationOptions<TogglePaperFavoriteData, FirebaseError, TogglePaperFavoriteVariables>): UseDataConnectMutationResult<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useTogglePaperFavorite(dc: DataConnect, options?: useDataConnectMutationOptions<TogglePaperFavoriteData, FirebaseError, TogglePaperFavoriteVariables>): UseDataConnectMutationResult<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
```

### Variables
The `TogglePaperFavorite` Mutation requires an argument of type `TogglePaperFavoriteVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface TogglePaperFavoriteVariables {
  paperId: UUIDString;
  isFavorite: boolean;
}
```
### Return Type
Recall that calling the `TogglePaperFavorite` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `TogglePaperFavorite` Mutation is of type `TogglePaperFavoriteData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface TogglePaperFavoriteData {
  paper_update?: Paper_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `TogglePaperFavorite`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, TogglePaperFavoriteVariables } from '@dataconnect/generated';
import { useTogglePaperFavorite } from '@dataconnect/generated/react'

export default function TogglePaperFavoriteComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useTogglePaperFavorite();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useTogglePaperFavorite(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useTogglePaperFavorite(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useTogglePaperFavorite(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useTogglePaperFavorite` Mutation requires an argument of type `TogglePaperFavoriteVariables`:
  const togglePaperFavoriteVars: TogglePaperFavoriteVariables = {
    paperId: ..., 
    isFavorite: ..., 
  };
  mutation.mutate(togglePaperFavoriteVars);
  // Variables can be defined inline as well.
  mutation.mutate({ paperId: ..., isFavorite: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(togglePaperFavoriteVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.paper_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateChatSession
You can execute the `CreateChatSession` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateChatSession(options?: useDataConnectMutationOptions<CreateChatSessionData, FirebaseError, CreateChatSessionVariables>): UseDataConnectMutationResult<CreateChatSessionData, CreateChatSessionVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateChatSession(dc: DataConnect, options?: useDataConnectMutationOptions<CreateChatSessionData, FirebaseError, CreateChatSessionVariables>): UseDataConnectMutationResult<CreateChatSessionData, CreateChatSessionVariables>;
```

### Variables
The `CreateChatSession` Mutation requires an argument of type `CreateChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateChatSessionVariables {
  userId: UUIDString;
  title: string;
}
```
### Return Type
Recall that calling the `CreateChatSession` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateChatSession` Mutation is of type `CreateChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateChatSessionData {
  chatSession_insert: ChatSession_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateChatSession`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateChatSessionVariables } from '@dataconnect/generated';
import { useCreateChatSession } from '@dataconnect/generated/react'

export default function CreateChatSessionComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateChatSession();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateChatSession(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateChatSession(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateChatSession(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateChatSession` Mutation requires an argument of type `CreateChatSessionVariables`:
  const createChatSessionVars: CreateChatSessionVariables = {
    userId: ..., 
    title: ..., 
  };
  mutation.mutate(createChatSessionVars);
  // Variables can be defined inline as well.
  mutation.mutate({ userId: ..., title: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createChatSessionVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.chatSession_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateChatSession
You can execute the `UpdateChatSession` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateChatSession(options?: useDataConnectMutationOptions<UpdateChatSessionData, FirebaseError, UpdateChatSessionVariables>): UseDataConnectMutationResult<UpdateChatSessionData, UpdateChatSessionVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateChatSession(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateChatSessionData, FirebaseError, UpdateChatSessionVariables>): UseDataConnectMutationResult<UpdateChatSessionData, UpdateChatSessionVariables>;
```

### Variables
The `UpdateChatSession` Mutation requires an argument of type `UpdateChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateChatSessionVariables {
  sessionId: UUIDString;
  title: string;
}
```
### Return Type
Recall that calling the `UpdateChatSession` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateChatSession` Mutation is of type `UpdateChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateChatSessionData {
  chatSession_update?: ChatSession_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateChatSession`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateChatSessionVariables } from '@dataconnect/generated';
import { useUpdateChatSession } from '@dataconnect/generated/react'

export default function UpdateChatSessionComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateChatSession();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateChatSession(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateChatSession(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateChatSession(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateChatSession` Mutation requires an argument of type `UpdateChatSessionVariables`:
  const updateChatSessionVars: UpdateChatSessionVariables = {
    sessionId: ..., 
    title: ..., 
  };
  mutation.mutate(updateChatSessionVars);
  // Variables can be defined inline as well.
  mutation.mutate({ sessionId: ..., title: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateChatSessionVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.chatSession_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## DeleteChatSession
You can execute the `DeleteChatSession` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useDeleteChatSession(options?: useDataConnectMutationOptions<DeleteChatSessionData, FirebaseError, DeleteChatSessionVariables>): UseDataConnectMutationResult<DeleteChatSessionData, DeleteChatSessionVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useDeleteChatSession(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteChatSessionData, FirebaseError, DeleteChatSessionVariables>): UseDataConnectMutationResult<DeleteChatSessionData, DeleteChatSessionVariables>;
```

### Variables
The `DeleteChatSession` Mutation requires an argument of type `DeleteChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface DeleteChatSessionVariables {
  sessionId: UUIDString;
}
```
### Return Type
Recall that calling the `DeleteChatSession` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `DeleteChatSession` Mutation is of type `DeleteChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteChatSessionData {
  chatSession_delete?: ChatSession_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `DeleteChatSession`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, DeleteChatSessionVariables } from '@dataconnect/generated';
import { useDeleteChatSession } from '@dataconnect/generated/react'

export default function DeleteChatSessionComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useDeleteChatSession();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useDeleteChatSession(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteChatSession(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteChatSession(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useDeleteChatSession` Mutation requires an argument of type `DeleteChatSessionVariables`:
  const deleteChatSessionVars: DeleteChatSessionVariables = {
    sessionId: ..., 
  };
  mutation.mutate(deleteChatSessionVars);
  // Variables can be defined inline as well.
  mutation.mutate({ sessionId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(deleteChatSessionVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.chatSession_delete);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## AddChat
You can execute the `AddChat` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useAddChat(options?: useDataConnectMutationOptions<AddChatData, FirebaseError, AddChatVariables>): UseDataConnectMutationResult<AddChatData, AddChatVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useAddChat(dc: DataConnect, options?: useDataConnectMutationOptions<AddChatData, FirebaseError, AddChatVariables>): UseDataConnectMutationResult<AddChatData, AddChatVariables>;
```

### Variables
The `AddChat` Mutation requires an argument of type `AddChatVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface AddChatVariables {
  sessionId: UUIDString;
  content: string;
  response?: string | null;
  paperIds?: UUIDString[] | null;
}
```
### Return Type
Recall that calling the `AddChat` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `AddChat` Mutation is of type `AddChatData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface AddChatData {
  chat_insert: Chat_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `AddChat`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, AddChatVariables } from '@dataconnect/generated';
import { useAddChat } from '@dataconnect/generated/react'

export default function AddChatComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useAddChat();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useAddChat(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddChat(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddChat(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useAddChat` Mutation requires an argument of type `AddChatVariables`:
  const addChatVars: AddChatVariables = {
    sessionId: ..., 
    content: ..., 
    response: ..., // optional
    paperIds: ..., // optional
  };
  mutation.mutate(addChatVars);
  // Variables can be defined inline as well.
  mutation.mutate({ sessionId: ..., content: ..., response: ..., paperIds: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(addChatVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.chat_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## LinkPaperToChat
You can execute the `LinkPaperToChat` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useLinkPaperToChat(options?: useDataConnectMutationOptions<LinkPaperToChatData, FirebaseError, LinkPaperToChatVariables>): UseDataConnectMutationResult<LinkPaperToChatData, LinkPaperToChatVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useLinkPaperToChat(dc: DataConnect, options?: useDataConnectMutationOptions<LinkPaperToChatData, FirebaseError, LinkPaperToChatVariables>): UseDataConnectMutationResult<LinkPaperToChatData, LinkPaperToChatVariables>;
```

### Variables
The `LinkPaperToChat` Mutation requires an argument of type `LinkPaperToChatVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface LinkPaperToChatVariables {
  chatId: UUIDString;
  paperId: UUIDString;
}
```
### Return Type
Recall that calling the `LinkPaperToChat` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `LinkPaperToChat` Mutation is of type `LinkPaperToChatData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface LinkPaperToChatData {
  chatPaper_insert: ChatPaper_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `LinkPaperToChat`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, LinkPaperToChatVariables } from '@dataconnect/generated';
import { useLinkPaperToChat } from '@dataconnect/generated/react'

export default function LinkPaperToChatComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useLinkPaperToChat();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useLinkPaperToChat(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useLinkPaperToChat(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useLinkPaperToChat(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useLinkPaperToChat` Mutation requires an argument of type `LinkPaperToChatVariables`:
  const linkPaperToChatVars: LinkPaperToChatVariables = {
    chatId: ..., 
    paperId: ..., 
  };
  mutation.mutate(linkPaperToChatVars);
  // Variables can be defined inline as well.
  mutation.mutate({ chatId: ..., paperId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(linkPaperToChatVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.chatPaper_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## AddCodeLink
You can execute the `AddCodeLink` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useAddCodeLink(options?: useDataConnectMutationOptions<AddCodeLinkData, FirebaseError, AddCodeLinkVariables>): UseDataConnectMutationResult<AddCodeLinkData, AddCodeLinkVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useAddCodeLink(dc: DataConnect, options?: useDataConnectMutationOptions<AddCodeLinkData, FirebaseError, AddCodeLinkVariables>): UseDataConnectMutationResult<AddCodeLinkData, AddCodeLinkVariables>;
```

### Variables
The `AddCodeLink` Mutation requires an argument of type `AddCodeLinkVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface AddCodeLinkVariables {
  paperId: UUIDString;
  url: string;
  repositoryName?: string | null;
}
```
### Return Type
Recall that calling the `AddCodeLink` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `AddCodeLink` Mutation is of type `AddCodeLinkData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface AddCodeLinkData {
  codeLink_insert: CodeLink_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `AddCodeLink`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, AddCodeLinkVariables } from '@dataconnect/generated';
import { useAddCodeLink } from '@dataconnect/generated/react'

export default function AddCodeLinkComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useAddCodeLink();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useAddCodeLink(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddCodeLink(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddCodeLink(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useAddCodeLink` Mutation requires an argument of type `AddCodeLinkVariables`:
  const addCodeLinkVars: AddCodeLinkVariables = {
    paperId: ..., 
    url: ..., 
    repositoryName: ..., // optional
  };
  mutation.mutate(addCodeLinkVars);
  // Variables can be defined inline as well.
  mutation.mutate({ paperId: ..., url: ..., repositoryName: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(addCodeLinkVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.codeLink_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## DeleteCodeLink
You can execute the `DeleteCodeLink` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useDeleteCodeLink(options?: useDataConnectMutationOptions<DeleteCodeLinkData, FirebaseError, DeleteCodeLinkVariables>): UseDataConnectMutationResult<DeleteCodeLinkData, DeleteCodeLinkVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useDeleteCodeLink(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCodeLinkData, FirebaseError, DeleteCodeLinkVariables>): UseDataConnectMutationResult<DeleteCodeLinkData, DeleteCodeLinkVariables>;
```

### Variables
The `DeleteCodeLink` Mutation requires an argument of type `DeleteCodeLinkVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface DeleteCodeLinkVariables {
  linkId: UUIDString;
}
```
### Return Type
Recall that calling the `DeleteCodeLink` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `DeleteCodeLink` Mutation is of type `DeleteCodeLinkData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteCodeLinkData {
  codeLink_delete?: CodeLink_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `DeleteCodeLink`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, DeleteCodeLinkVariables } from '@dataconnect/generated';
import { useDeleteCodeLink } from '@dataconnect/generated/react'

export default function DeleteCodeLinkComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useDeleteCodeLink();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useDeleteCodeLink(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteCodeLink(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useDeleteCodeLink(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useDeleteCodeLink` Mutation requires an argument of type `DeleteCodeLinkVariables`:
  const deleteCodeLinkVars: DeleteCodeLinkVariables = {
    linkId: ..., 
  };
  mutation.mutate(deleteCodeLinkVars);
  // Variables can be defined inline as well.
  mutation.mutate({ linkId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(deleteCodeLinkVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.codeLink_delete);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## AddSearchHistory
You can execute the `AddSearchHistory` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useAddSearchHistory(options?: useDataConnectMutationOptions<AddSearchHistoryData, FirebaseError, AddSearchHistoryVariables>): UseDataConnectMutationResult<AddSearchHistoryData, AddSearchHistoryVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useAddSearchHistory(dc: DataConnect, options?: useDataConnectMutationOptions<AddSearchHistoryData, FirebaseError, AddSearchHistoryVariables>): UseDataConnectMutationResult<AddSearchHistoryData, AddSearchHistoryVariables>;
```

### Variables
The `AddSearchHistory` Mutation requires an argument of type `AddSearchHistoryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface AddSearchHistoryVariables {
  userId: UUIDString;
  query: string;
  resultsCount?: number | null;
}
```
### Return Type
Recall that calling the `AddSearchHistory` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `AddSearchHistory` Mutation is of type `AddSearchHistoryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface AddSearchHistoryData {
  searchHistory_insert: SearchHistory_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `AddSearchHistory`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, AddSearchHistoryVariables } from '@dataconnect/generated';
import { useAddSearchHistory } from '@dataconnect/generated/react'

export default function AddSearchHistoryComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useAddSearchHistory();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useAddSearchHistory(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddSearchHistory(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useAddSearchHistory(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useAddSearchHistory` Mutation requires an argument of type `AddSearchHistoryVariables`:
  const addSearchHistoryVars: AddSearchHistoryVariables = {
    userId: ..., 
    query: ..., 
    resultsCount: ..., // optional
  };
  mutation.mutate(addSearchHistoryVars);
  // Variables can be defined inline as well.
  mutation.mutate({ userId: ..., query: ..., resultsCount: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(addSearchHistoryVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.searchHistory_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

