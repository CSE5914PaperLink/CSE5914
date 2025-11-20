# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
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

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUserByEmail
You can execute the `GetUserByEmail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByEmailRef:
```typescript
const name = getUserByEmailRef.operationName;
console.log(name);
```

### Variables
The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByEmailVariables {
  email: string;
}
```
### Return Type
Recall that executing the `GetUserByEmail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByEmailData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByEmailData {
  users: ({
    id: UUIDString;
    name: string;
    email: string;
    createdAt: TimestampString;
  } & User_Key)[];
}
```
### Using `GetUserByEmail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByEmail, GetUserByEmailVariables } from '@dataconnect/generated';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByEmail(getUserByEmailVars);
// Variables can be defined inline as well.
const { data } = await getUserByEmail({ email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByEmail(dataConnect, getUserByEmailVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByEmail(getUserByEmailVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByEmail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByEmailRef, GetUserByEmailVariables } from '@dataconnect/generated';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmailRef()` function to get a reference to the query.
const ref = getUserByEmailRef(getUserByEmailVars);
// Variables can be defined inline as well.
const ref = getUserByEmailRef({ email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByEmailRef(dataConnect, getUserByEmailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query requires an argument of type `GetUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserData {
  user?: {
    id: UUIDString;
    name: string;
    email: string;
    createdAt: TimestampString;
  } & User_Key;
}
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser, GetUserVariables } from '@dataconnect/generated';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  userId: ..., 
};

// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser(getUserVars);
// Variables can be defined inline as well.
const { data } = await getUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect, getUserVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser(getUserVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef, GetUserVariables } from '@dataconnect/generated';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  userId: ..., 
};

// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef(getUserVars);
// Variables can be defined inline as well.
const ref = getUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect, getUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListPapers
You can execute the `ListPapers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPapers(vars: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;

interface ListPapersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
}
export const listPapersRef: ListPapersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPapers(dc: DataConnect, vars: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;

interface ListPapersRef {
  ...
  (dc: DataConnect, vars: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
}
export const listPapersRef: ListPapersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPapersRef:
```typescript
const name = listPapersRef.operationName;
console.log(name);
```

### Variables
The `ListPapers` query requires an argument of type `ListPapersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPapersVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `ListPapers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPapersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListPapers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPapers, ListPapersVariables } from '@dataconnect/generated';

// The `ListPapers` query requires an argument of type `ListPapersVariables`:
const listPapersVars: ListPapersVariables = {
  userId: ..., 
};

// Call the `listPapers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPapers(listPapersVars);
// Variables can be defined inline as well.
const { data } = await listPapers({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPapers(dataConnect, listPapersVars);

console.log(data.papers);

// Or, you can use the `Promise` API.
listPapers(listPapersVars).then((response) => {
  const data = response.data;
  console.log(data.papers);
});
```

### Using `ListPapers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPapersRef, ListPapersVariables } from '@dataconnect/generated';

// The `ListPapers` query requires an argument of type `ListPapersVariables`:
const listPapersVars: ListPapersVariables = {
  userId: ..., 
};

// Call the `listPapersRef()` function to get a reference to the query.
const ref = listPapersRef(listPapersVars);
// Variables can be defined inline as well.
const ref = listPapersRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPapersRef(dataConnect, listPapersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.papers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.papers);
});
```

## GetPaper
You can execute the `GetPaper` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPaper(vars: GetPaperVariables): QueryPromise<GetPaperData, GetPaperVariables>;

interface GetPaperRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPaperVariables): QueryRef<GetPaperData, GetPaperVariables>;
}
export const getPaperRef: GetPaperRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPaper(dc: DataConnect, vars: GetPaperVariables): QueryPromise<GetPaperData, GetPaperVariables>;

interface GetPaperRef {
  ...
  (dc: DataConnect, vars: GetPaperVariables): QueryRef<GetPaperData, GetPaperVariables>;
}
export const getPaperRef: GetPaperRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPaperRef:
```typescript
const name = getPaperRef.operationName;
console.log(name);
```

### Variables
The `GetPaper` query requires an argument of type `GetPaperVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPaperVariables {
  paperId: UUIDString;
}
```
### Return Type
Recall that executing the `GetPaper` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPaperData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetPaper`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPaper, GetPaperVariables } from '@dataconnect/generated';

// The `GetPaper` query requires an argument of type `GetPaperVariables`:
const getPaperVars: GetPaperVariables = {
  paperId: ..., 
};

// Call the `getPaper()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPaper(getPaperVars);
// Variables can be defined inline as well.
const { data } = await getPaper({ paperId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPaper(dataConnect, getPaperVars);

console.log(data.paper);

// Or, you can use the `Promise` API.
getPaper(getPaperVars).then((response) => {
  const data = response.data;
  console.log(data.paper);
});
```

### Using `GetPaper`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPaperRef, GetPaperVariables } from '@dataconnect/generated';

// The `GetPaper` query requires an argument of type `GetPaperVariables`:
const getPaperVars: GetPaperVariables = {
  paperId: ..., 
};

// Call the `getPaperRef()` function to get a reference to the query.
const ref = getPaperRef(getPaperVars);
// Variables can be defined inline as well.
const ref = getPaperRef({ paperId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPaperRef(dataConnect, getPaperVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.paper);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.paper);
});
```

## SearchPapers
You can execute the `SearchPapers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
searchPapers(vars: SearchPapersVariables): QueryPromise<SearchPapersData, SearchPapersVariables>;

interface SearchPapersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchPapersVariables): QueryRef<SearchPapersData, SearchPapersVariables>;
}
export const searchPapersRef: SearchPapersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchPapers(dc: DataConnect, vars: SearchPapersVariables): QueryPromise<SearchPapersData, SearchPapersVariables>;

interface SearchPapersRef {
  ...
  (dc: DataConnect, vars: SearchPapersVariables): QueryRef<SearchPapersData, SearchPapersVariables>;
}
export const searchPapersRef: SearchPapersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchPapersRef:
```typescript
const name = searchPapersRef.operationName;
console.log(name);
```

### Variables
The `SearchPapers` query requires an argument of type `SearchPapersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchPapersVariables {
  userId: UUIDString;
  searchTerm: string;
}
```
### Return Type
Recall that executing the `SearchPapers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchPapersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `SearchPapers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchPapers, SearchPapersVariables } from '@dataconnect/generated';

// The `SearchPapers` query requires an argument of type `SearchPapersVariables`:
const searchPapersVars: SearchPapersVariables = {
  userId: ..., 
  searchTerm: ..., 
};

// Call the `searchPapers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchPapers(searchPapersVars);
// Variables can be defined inline as well.
const { data } = await searchPapers({ userId: ..., searchTerm: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchPapers(dataConnect, searchPapersVars);

console.log(data.papers);

// Or, you can use the `Promise` API.
searchPapers(searchPapersVars).then((response) => {
  const data = response.data;
  console.log(data.papers);
});
```

### Using `SearchPapers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchPapersRef, SearchPapersVariables } from '@dataconnect/generated';

// The `SearchPapers` query requires an argument of type `SearchPapersVariables`:
const searchPapersVars: SearchPapersVariables = {
  userId: ..., 
  searchTerm: ..., 
};

// Call the `searchPapersRef()` function to get a reference to the query.
const ref = searchPapersRef(searchPapersVars);
// Variables can be defined inline as well.
const ref = searchPapersRef({ userId: ..., searchTerm: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchPapersRef(dataConnect, searchPapersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.papers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.papers);
});
```

## ListChatSessions
You can execute the `ListChatSessions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listChatSessions(vars: ListChatSessionsVariables): QueryPromise<ListChatSessionsData, ListChatSessionsVariables>;

interface ListChatSessionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListChatSessionsVariables): QueryRef<ListChatSessionsData, ListChatSessionsVariables>;
}
export const listChatSessionsRef: ListChatSessionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listChatSessions(dc: DataConnect, vars: ListChatSessionsVariables): QueryPromise<ListChatSessionsData, ListChatSessionsVariables>;

interface ListChatSessionsRef {
  ...
  (dc: DataConnect, vars: ListChatSessionsVariables): QueryRef<ListChatSessionsData, ListChatSessionsVariables>;
}
export const listChatSessionsRef: ListChatSessionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listChatSessionsRef:
```typescript
const name = listChatSessionsRef.operationName;
console.log(name);
```

### Variables
The `ListChatSessions` query requires an argument of type `ListChatSessionsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListChatSessionsVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `ListChatSessions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListChatSessionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListChatSessions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listChatSessions, ListChatSessionsVariables } from '@dataconnect/generated';

// The `ListChatSessions` query requires an argument of type `ListChatSessionsVariables`:
const listChatSessionsVars: ListChatSessionsVariables = {
  userId: ..., 
};

// Call the `listChatSessions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listChatSessions(listChatSessionsVars);
// Variables can be defined inline as well.
const { data } = await listChatSessions({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listChatSessions(dataConnect, listChatSessionsVars);

console.log(data.chatSessions);

// Or, you can use the `Promise` API.
listChatSessions(listChatSessionsVars).then((response) => {
  const data = response.data;
  console.log(data.chatSessions);
});
```

### Using `ListChatSessions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listChatSessionsRef, ListChatSessionsVariables } from '@dataconnect/generated';

// The `ListChatSessions` query requires an argument of type `ListChatSessionsVariables`:
const listChatSessionsVars: ListChatSessionsVariables = {
  userId: ..., 
};

// Call the `listChatSessionsRef()` function to get a reference to the query.
const ref = listChatSessionsRef(listChatSessionsVars);
// Variables can be defined inline as well.
const ref = listChatSessionsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listChatSessionsRef(dataConnect, listChatSessionsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chatSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chatSessions);
});
```

## GetChatSession
You can execute the `GetChatSession` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getChatSession(vars: GetChatSessionVariables): QueryPromise<GetChatSessionData, GetChatSessionVariables>;

interface GetChatSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChatSessionVariables): QueryRef<GetChatSessionData, GetChatSessionVariables>;
}
export const getChatSessionRef: GetChatSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getChatSession(dc: DataConnect, vars: GetChatSessionVariables): QueryPromise<GetChatSessionData, GetChatSessionVariables>;

interface GetChatSessionRef {
  ...
  (dc: DataConnect, vars: GetChatSessionVariables): QueryRef<GetChatSessionData, GetChatSessionVariables>;
}
export const getChatSessionRef: GetChatSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getChatSessionRef:
```typescript
const name = getChatSessionRef.operationName;
console.log(name);
```

### Variables
The `GetChatSession` query requires an argument of type `GetChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetChatSessionVariables {
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `GetChatSession` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetChatSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getChatSession, GetChatSessionVariables } from '@dataconnect/generated';

// The `GetChatSession` query requires an argument of type `GetChatSessionVariables`:
const getChatSessionVars: GetChatSessionVariables = {
  sessionId: ..., 
};

// Call the `getChatSession()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getChatSession(getChatSessionVars);
// Variables can be defined inline as well.
const { data } = await getChatSession({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getChatSession(dataConnect, getChatSessionVars);

console.log(data.chatSession);

// Or, you can use the `Promise` API.
getChatSession(getChatSessionVars).then((response) => {
  const data = response.data;
  console.log(data.chatSession);
});
```

### Using `GetChatSession`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getChatSessionRef, GetChatSessionVariables } from '@dataconnect/generated';

// The `GetChatSession` query requires an argument of type `GetChatSessionVariables`:
const getChatSessionVars: GetChatSessionVariables = {
  sessionId: ..., 
};

// Call the `getChatSessionRef()` function to get a reference to the query.
const ref = getChatSessionRef(getChatSessionVars);
// Variables can be defined inline as well.
const ref = getChatSessionRef({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getChatSessionRef(dataConnect, getChatSessionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chatSession);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chatSession);
});
```

## GetChatsForSession
You can execute the `GetChatsForSession` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getChatsForSession(vars: GetChatsForSessionVariables): QueryPromise<GetChatsForSessionData, GetChatsForSessionVariables>;

interface GetChatsForSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChatsForSessionVariables): QueryRef<GetChatsForSessionData, GetChatsForSessionVariables>;
}
export const getChatsForSessionRef: GetChatsForSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getChatsForSession(dc: DataConnect, vars: GetChatsForSessionVariables): QueryPromise<GetChatsForSessionData, GetChatsForSessionVariables>;

interface GetChatsForSessionRef {
  ...
  (dc: DataConnect, vars: GetChatsForSessionVariables): QueryRef<GetChatsForSessionData, GetChatsForSessionVariables>;
}
export const getChatsForSessionRef: GetChatsForSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getChatsForSessionRef:
```typescript
const name = getChatsForSessionRef.operationName;
console.log(name);
```

### Variables
The `GetChatsForSession` query requires an argument of type `GetChatsForSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetChatsForSessionVariables {
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `GetChatsForSession` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetChatsForSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetChatsForSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getChatsForSession, GetChatsForSessionVariables } from '@dataconnect/generated';

// The `GetChatsForSession` query requires an argument of type `GetChatsForSessionVariables`:
const getChatsForSessionVars: GetChatsForSessionVariables = {
  sessionId: ..., 
};

// Call the `getChatsForSession()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getChatsForSession(getChatsForSessionVars);
// Variables can be defined inline as well.
const { data } = await getChatsForSession({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getChatsForSession(dataConnect, getChatsForSessionVars);

console.log(data.chats);

// Or, you can use the `Promise` API.
getChatsForSession(getChatsForSessionVars).then((response) => {
  const data = response.data;
  console.log(data.chats);
});
```

### Using `GetChatsForSession`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getChatsForSessionRef, GetChatsForSessionVariables } from '@dataconnect/generated';

// The `GetChatsForSession` query requires an argument of type `GetChatsForSessionVariables`:
const getChatsForSessionVars: GetChatsForSessionVariables = {
  sessionId: ..., 
};

// Call the `getChatsForSessionRef()` function to get a reference to the query.
const ref = getChatsForSessionRef(getChatsForSessionVars);
// Variables can be defined inline as well.
const ref = getChatsForSessionRef({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getChatsForSessionRef(dataConnect, getChatsForSessionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chats);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chats);
});
```

## GetChatPapersForChat
You can execute the `GetChatPapersForChat` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getChatPapersForChat(vars: GetChatPapersForChatVariables): QueryPromise<GetChatPapersForChatData, GetChatPapersForChatVariables>;

interface GetChatPapersForChatRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChatPapersForChatVariables): QueryRef<GetChatPapersForChatData, GetChatPapersForChatVariables>;
}
export const getChatPapersForChatRef: GetChatPapersForChatRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getChatPapersForChat(dc: DataConnect, vars: GetChatPapersForChatVariables): QueryPromise<GetChatPapersForChatData, GetChatPapersForChatVariables>;

interface GetChatPapersForChatRef {
  ...
  (dc: DataConnect, vars: GetChatPapersForChatVariables): QueryRef<GetChatPapersForChatData, GetChatPapersForChatVariables>;
}
export const getChatPapersForChatRef: GetChatPapersForChatRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getChatPapersForChatRef:
```typescript
const name = getChatPapersForChatRef.operationName;
console.log(name);
```

### Variables
The `GetChatPapersForChat` query requires an argument of type `GetChatPapersForChatVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetChatPapersForChatVariables {
  chatId: UUIDString;
}
```
### Return Type
Recall that executing the `GetChatPapersForChat` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetChatPapersForChatData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetChatPapersForChat`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getChatPapersForChat, GetChatPapersForChatVariables } from '@dataconnect/generated';

// The `GetChatPapersForChat` query requires an argument of type `GetChatPapersForChatVariables`:
const getChatPapersForChatVars: GetChatPapersForChatVariables = {
  chatId: ..., 
};

// Call the `getChatPapersForChat()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getChatPapersForChat(getChatPapersForChatVars);
// Variables can be defined inline as well.
const { data } = await getChatPapersForChat({ chatId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getChatPapersForChat(dataConnect, getChatPapersForChatVars);

console.log(data.chatPapers);

// Or, you can use the `Promise` API.
getChatPapersForChat(getChatPapersForChatVars).then((response) => {
  const data = response.data;
  console.log(data.chatPapers);
});
```

### Using `GetChatPapersForChat`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getChatPapersForChatRef, GetChatPapersForChatVariables } from '@dataconnect/generated';

// The `GetChatPapersForChat` query requires an argument of type `GetChatPapersForChatVariables`:
const getChatPapersForChatVars: GetChatPapersForChatVariables = {
  chatId: ..., 
};

// Call the `getChatPapersForChatRef()` function to get a reference to the query.
const ref = getChatPapersForChatRef(getChatPapersForChatVars);
// Variables can be defined inline as well.
const ref = getChatPapersForChatRef({ chatId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getChatPapersForChatRef(dataConnect, getChatPapersForChatVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chatPapers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chatPapers);
});
```

## GetCodeLinksForPaper
You can execute the `GetCodeLinksForPaper` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCodeLinksForPaper(vars: GetCodeLinksForPaperVariables): QueryPromise<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;

interface GetCodeLinksForPaperRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCodeLinksForPaperVariables): QueryRef<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
}
export const getCodeLinksForPaperRef: GetCodeLinksForPaperRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCodeLinksForPaper(dc: DataConnect, vars: GetCodeLinksForPaperVariables): QueryPromise<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;

interface GetCodeLinksForPaperRef {
  ...
  (dc: DataConnect, vars: GetCodeLinksForPaperVariables): QueryRef<GetCodeLinksForPaperData, GetCodeLinksForPaperVariables>;
}
export const getCodeLinksForPaperRef: GetCodeLinksForPaperRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCodeLinksForPaperRef:
```typescript
const name = getCodeLinksForPaperRef.operationName;
console.log(name);
```

### Variables
The `GetCodeLinksForPaper` query requires an argument of type `GetCodeLinksForPaperVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCodeLinksForPaperVariables {
  paperId: UUIDString;
}
```
### Return Type
Recall that executing the `GetCodeLinksForPaper` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCodeLinksForPaperData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetCodeLinksForPaper`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCodeLinksForPaper, GetCodeLinksForPaperVariables } from '@dataconnect/generated';

// The `GetCodeLinksForPaper` query requires an argument of type `GetCodeLinksForPaperVariables`:
const getCodeLinksForPaperVars: GetCodeLinksForPaperVariables = {
  paperId: ..., 
};

// Call the `getCodeLinksForPaper()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCodeLinksForPaper(getCodeLinksForPaperVars);
// Variables can be defined inline as well.
const { data } = await getCodeLinksForPaper({ paperId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCodeLinksForPaper(dataConnect, getCodeLinksForPaperVars);

console.log(data.codeLinks);

// Or, you can use the `Promise` API.
getCodeLinksForPaper(getCodeLinksForPaperVars).then((response) => {
  const data = response.data;
  console.log(data.codeLinks);
});
```

### Using `GetCodeLinksForPaper`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCodeLinksForPaperRef, GetCodeLinksForPaperVariables } from '@dataconnect/generated';

// The `GetCodeLinksForPaper` query requires an argument of type `GetCodeLinksForPaperVariables`:
const getCodeLinksForPaperVars: GetCodeLinksForPaperVariables = {
  paperId: ..., 
};

// Call the `getCodeLinksForPaperRef()` function to get a reference to the query.
const ref = getCodeLinksForPaperRef(getCodeLinksForPaperVars);
// Variables can be defined inline as well.
const ref = getCodeLinksForPaperRef({ paperId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCodeLinksForPaperRef(dataConnect, getCodeLinksForPaperVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.codeLinks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.codeLinks);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  email: string;
  name: string;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  email: ..., 
  name: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ email: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  email: ..., 
  name: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ email: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## AddPaper
You can execute the `AddPaper` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addPaper(vars: AddPaperVariables): MutationPromise<AddPaperData, AddPaperVariables>;

interface AddPaperRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddPaperVariables): MutationRef<AddPaperData, AddPaperVariables>;
}
export const addPaperRef: AddPaperRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addPaper(dc: DataConnect, vars: AddPaperVariables): MutationPromise<AddPaperData, AddPaperVariables>;

interface AddPaperRef {
  ...
  (dc: DataConnect, vars: AddPaperVariables): MutationRef<AddPaperData, AddPaperVariables>;
}
export const addPaperRef: AddPaperRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addPaperRef:
```typescript
const name = addPaperRef.operationName;
console.log(name);
```

### Variables
The `AddPaper` mutation requires an argument of type `AddPaperVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `AddPaper` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddPaperData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddPaperData {
  paper_insert: Paper_Key;
}
```
### Using `AddPaper`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addPaper, AddPaperVariables } from '@dataconnect/generated';

// The `AddPaper` mutation requires an argument of type `AddPaperVariables`:
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

// Call the `addPaper()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addPaper(addPaperVars);
// Variables can be defined inline as well.
const { data } = await addPaper({ userId: ..., title: ..., authors: ..., year: ..., paperType: ..., abstract: ..., arxivId: ..., pdfUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addPaper(dataConnect, addPaperVars);

console.log(data.paper_insert);

// Or, you can use the `Promise` API.
addPaper(addPaperVars).then((response) => {
  const data = response.data;
  console.log(data.paper_insert);
});
```

### Using `AddPaper`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addPaperRef, AddPaperVariables } from '@dataconnect/generated';

// The `AddPaper` mutation requires an argument of type `AddPaperVariables`:
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

// Call the `addPaperRef()` function to get a reference to the mutation.
const ref = addPaperRef(addPaperVars);
// Variables can be defined inline as well.
const ref = addPaperRef({ userId: ..., title: ..., authors: ..., year: ..., paperType: ..., abstract: ..., arxivId: ..., pdfUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addPaperRef(dataConnect, addPaperVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paper_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paper_insert);
});
```

## UpdatePaperIngestionStatus
You can execute the `UpdatePaperIngestionStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePaperIngestionStatus(vars: UpdatePaperIngestionStatusVariables): MutationPromise<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;

interface UpdatePaperIngestionStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePaperIngestionStatusVariables): MutationRef<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
}
export const updatePaperIngestionStatusRef: UpdatePaperIngestionStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePaperIngestionStatus(dc: DataConnect, vars: UpdatePaperIngestionStatusVariables): MutationPromise<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;

interface UpdatePaperIngestionStatusRef {
  ...
  (dc: DataConnect, vars: UpdatePaperIngestionStatusVariables): MutationRef<UpdatePaperIngestionStatusData, UpdatePaperIngestionStatusVariables>;
}
export const updatePaperIngestionStatusRef: UpdatePaperIngestionStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePaperIngestionStatusRef:
```typescript
const name = updatePaperIngestionStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdatePaperIngestionStatus` mutation requires an argument of type `UpdatePaperIngestionStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePaperIngestionStatusVariables {
  paperId: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdatePaperIngestionStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePaperIngestionStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePaperIngestionStatusData {
  paper_update?: Paper_Key | null;
}
```
### Using `UpdatePaperIngestionStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePaperIngestionStatus, UpdatePaperIngestionStatusVariables } from '@dataconnect/generated';

// The `UpdatePaperIngestionStatus` mutation requires an argument of type `UpdatePaperIngestionStatusVariables`:
const updatePaperIngestionStatusVars: UpdatePaperIngestionStatusVariables = {
  paperId: ..., 
  status: ..., 
};

// Call the `updatePaperIngestionStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePaperIngestionStatus(updatePaperIngestionStatusVars);
// Variables can be defined inline as well.
const { data } = await updatePaperIngestionStatus({ paperId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePaperIngestionStatus(dataConnect, updatePaperIngestionStatusVars);

console.log(data.paper_update);

// Or, you can use the `Promise` API.
updatePaperIngestionStatus(updatePaperIngestionStatusVars).then((response) => {
  const data = response.data;
  console.log(data.paper_update);
});
```

### Using `UpdatePaperIngestionStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePaperIngestionStatusRef, UpdatePaperIngestionStatusVariables } from '@dataconnect/generated';

// The `UpdatePaperIngestionStatus` mutation requires an argument of type `UpdatePaperIngestionStatusVariables`:
const updatePaperIngestionStatusVars: UpdatePaperIngestionStatusVariables = {
  paperId: ..., 
  status: ..., 
};

// Call the `updatePaperIngestionStatusRef()` function to get a reference to the mutation.
const ref = updatePaperIngestionStatusRef(updatePaperIngestionStatusVars);
// Variables can be defined inline as well.
const ref = updatePaperIngestionStatusRef({ paperId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePaperIngestionStatusRef(dataConnect, updatePaperIngestionStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paper_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paper_update);
});
```

## DeletePaper
You can execute the `DeletePaper` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deletePaper(vars: DeletePaperVariables): MutationPromise<DeletePaperData, DeletePaperVariables>;

interface DeletePaperRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePaperVariables): MutationRef<DeletePaperData, DeletePaperVariables>;
}
export const deletePaperRef: DeletePaperRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deletePaper(dc: DataConnect, vars: DeletePaperVariables): MutationPromise<DeletePaperData, DeletePaperVariables>;

interface DeletePaperRef {
  ...
  (dc: DataConnect, vars: DeletePaperVariables): MutationRef<DeletePaperData, DeletePaperVariables>;
}
export const deletePaperRef: DeletePaperRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deletePaperRef:
```typescript
const name = deletePaperRef.operationName;
console.log(name);
```

### Variables
The `DeletePaper` mutation requires an argument of type `DeletePaperVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeletePaperVariables {
  paperId: UUIDString;
}
```
### Return Type
Recall that executing the `DeletePaper` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeletePaperData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeletePaperData {
  paper_delete?: Paper_Key | null;
}
```
### Using `DeletePaper`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deletePaper, DeletePaperVariables } from '@dataconnect/generated';

// The `DeletePaper` mutation requires an argument of type `DeletePaperVariables`:
const deletePaperVars: DeletePaperVariables = {
  paperId: ..., 
};

// Call the `deletePaper()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deletePaper(deletePaperVars);
// Variables can be defined inline as well.
const { data } = await deletePaper({ paperId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deletePaper(dataConnect, deletePaperVars);

console.log(data.paper_delete);

// Or, you can use the `Promise` API.
deletePaper(deletePaperVars).then((response) => {
  const data = response.data;
  console.log(data.paper_delete);
});
```

### Using `DeletePaper`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deletePaperRef, DeletePaperVariables } from '@dataconnect/generated';

// The `DeletePaper` mutation requires an argument of type `DeletePaperVariables`:
const deletePaperVars: DeletePaperVariables = {
  paperId: ..., 
};

// Call the `deletePaperRef()` function to get a reference to the mutation.
const ref = deletePaperRef(deletePaperVars);
// Variables can be defined inline as well.
const ref = deletePaperRef({ paperId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deletePaperRef(dataConnect, deletePaperVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paper_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paper_delete);
});
```

## TogglePaperFavorite
You can execute the `TogglePaperFavorite` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
togglePaperFavorite(vars: TogglePaperFavoriteVariables): MutationPromise<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;

interface TogglePaperFavoriteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TogglePaperFavoriteVariables): MutationRef<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
}
export const togglePaperFavoriteRef: TogglePaperFavoriteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
togglePaperFavorite(dc: DataConnect, vars: TogglePaperFavoriteVariables): MutationPromise<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;

interface TogglePaperFavoriteRef {
  ...
  (dc: DataConnect, vars: TogglePaperFavoriteVariables): MutationRef<TogglePaperFavoriteData, TogglePaperFavoriteVariables>;
}
export const togglePaperFavoriteRef: TogglePaperFavoriteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the togglePaperFavoriteRef:
```typescript
const name = togglePaperFavoriteRef.operationName;
console.log(name);
```

### Variables
The `TogglePaperFavorite` mutation requires an argument of type `TogglePaperFavoriteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TogglePaperFavoriteVariables {
  paperId: UUIDString;
  isFavorite: boolean;
}
```
### Return Type
Recall that executing the `TogglePaperFavorite` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TogglePaperFavoriteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface TogglePaperFavoriteData {
  paper_update?: Paper_Key | null;
}
```
### Using `TogglePaperFavorite`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, togglePaperFavorite, TogglePaperFavoriteVariables } from '@dataconnect/generated';

// The `TogglePaperFavorite` mutation requires an argument of type `TogglePaperFavoriteVariables`:
const togglePaperFavoriteVars: TogglePaperFavoriteVariables = {
  paperId: ..., 
  isFavorite: ..., 
};

// Call the `togglePaperFavorite()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await togglePaperFavorite(togglePaperFavoriteVars);
// Variables can be defined inline as well.
const { data } = await togglePaperFavorite({ paperId: ..., isFavorite: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await togglePaperFavorite(dataConnect, togglePaperFavoriteVars);

console.log(data.paper_update);

// Or, you can use the `Promise` API.
togglePaperFavorite(togglePaperFavoriteVars).then((response) => {
  const data = response.data;
  console.log(data.paper_update);
});
```

### Using `TogglePaperFavorite`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, togglePaperFavoriteRef, TogglePaperFavoriteVariables } from '@dataconnect/generated';

// The `TogglePaperFavorite` mutation requires an argument of type `TogglePaperFavoriteVariables`:
const togglePaperFavoriteVars: TogglePaperFavoriteVariables = {
  paperId: ..., 
  isFavorite: ..., 
};

// Call the `togglePaperFavoriteRef()` function to get a reference to the mutation.
const ref = togglePaperFavoriteRef(togglePaperFavoriteVars);
// Variables can be defined inline as well.
const ref = togglePaperFavoriteRef({ paperId: ..., isFavorite: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = togglePaperFavoriteRef(dataConnect, togglePaperFavoriteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paper_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paper_update);
});
```

## CreateChatSession
You can execute the `CreateChatSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createChatSession(vars: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;

interface CreateChatSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
}
export const createChatSessionRef: CreateChatSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createChatSession(dc: DataConnect, vars: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;

interface CreateChatSessionRef {
  ...
  (dc: DataConnect, vars: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
}
export const createChatSessionRef: CreateChatSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createChatSessionRef:
```typescript
const name = createChatSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateChatSession` mutation requires an argument of type `CreateChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateChatSessionVariables {
  userId: UUIDString;
  title: string;
}
```
### Return Type
Recall that executing the `CreateChatSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateChatSessionData {
  chatSession_insert: ChatSession_Key;
}
```
### Using `CreateChatSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createChatSession, CreateChatSessionVariables } from '@dataconnect/generated';

// The `CreateChatSession` mutation requires an argument of type `CreateChatSessionVariables`:
const createChatSessionVars: CreateChatSessionVariables = {
  userId: ..., 
  title: ..., 
};

// Call the `createChatSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createChatSession(createChatSessionVars);
// Variables can be defined inline as well.
const { data } = await createChatSession({ userId: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createChatSession(dataConnect, createChatSessionVars);

console.log(data.chatSession_insert);

// Or, you can use the `Promise` API.
createChatSession(createChatSessionVars).then((response) => {
  const data = response.data;
  console.log(data.chatSession_insert);
});
```

### Using `CreateChatSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createChatSessionRef, CreateChatSessionVariables } from '@dataconnect/generated';

// The `CreateChatSession` mutation requires an argument of type `CreateChatSessionVariables`:
const createChatSessionVars: CreateChatSessionVariables = {
  userId: ..., 
  title: ..., 
};

// Call the `createChatSessionRef()` function to get a reference to the mutation.
const ref = createChatSessionRef(createChatSessionVars);
// Variables can be defined inline as well.
const ref = createChatSessionRef({ userId: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createChatSessionRef(dataConnect, createChatSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chatSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chatSession_insert);
});
```

## UpdateChatSession
You can execute the `UpdateChatSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateChatSession(vars: UpdateChatSessionVariables): MutationPromise<UpdateChatSessionData, UpdateChatSessionVariables>;

interface UpdateChatSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateChatSessionVariables): MutationRef<UpdateChatSessionData, UpdateChatSessionVariables>;
}
export const updateChatSessionRef: UpdateChatSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateChatSession(dc: DataConnect, vars: UpdateChatSessionVariables): MutationPromise<UpdateChatSessionData, UpdateChatSessionVariables>;

interface UpdateChatSessionRef {
  ...
  (dc: DataConnect, vars: UpdateChatSessionVariables): MutationRef<UpdateChatSessionData, UpdateChatSessionVariables>;
}
export const updateChatSessionRef: UpdateChatSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateChatSessionRef:
```typescript
const name = updateChatSessionRef.operationName;
console.log(name);
```

### Variables
The `UpdateChatSession` mutation requires an argument of type `UpdateChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateChatSessionVariables {
  sessionId: UUIDString;
  title: string;
}
```
### Return Type
Recall that executing the `UpdateChatSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateChatSessionData {
  chatSession_update?: ChatSession_Key | null;
}
```
### Using `UpdateChatSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateChatSession, UpdateChatSessionVariables } from '@dataconnect/generated';

// The `UpdateChatSession` mutation requires an argument of type `UpdateChatSessionVariables`:
const updateChatSessionVars: UpdateChatSessionVariables = {
  sessionId: ..., 
  title: ..., 
};

// Call the `updateChatSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateChatSession(updateChatSessionVars);
// Variables can be defined inline as well.
const { data } = await updateChatSession({ sessionId: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateChatSession(dataConnect, updateChatSessionVars);

console.log(data.chatSession_update);

// Or, you can use the `Promise` API.
updateChatSession(updateChatSessionVars).then((response) => {
  const data = response.data;
  console.log(data.chatSession_update);
});
```

### Using `UpdateChatSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateChatSessionRef, UpdateChatSessionVariables } from '@dataconnect/generated';

// The `UpdateChatSession` mutation requires an argument of type `UpdateChatSessionVariables`:
const updateChatSessionVars: UpdateChatSessionVariables = {
  sessionId: ..., 
  title: ..., 
};

// Call the `updateChatSessionRef()` function to get a reference to the mutation.
const ref = updateChatSessionRef(updateChatSessionVars);
// Variables can be defined inline as well.
const ref = updateChatSessionRef({ sessionId: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateChatSessionRef(dataConnect, updateChatSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chatSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chatSession_update);
});
```

## DeleteChatSession
You can execute the `DeleteChatSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteChatSession(vars: DeleteChatSessionVariables): MutationPromise<DeleteChatSessionData, DeleteChatSessionVariables>;

interface DeleteChatSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteChatSessionVariables): MutationRef<DeleteChatSessionData, DeleteChatSessionVariables>;
}
export const deleteChatSessionRef: DeleteChatSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteChatSession(dc: DataConnect, vars: DeleteChatSessionVariables): MutationPromise<DeleteChatSessionData, DeleteChatSessionVariables>;

interface DeleteChatSessionRef {
  ...
  (dc: DataConnect, vars: DeleteChatSessionVariables): MutationRef<DeleteChatSessionData, DeleteChatSessionVariables>;
}
export const deleteChatSessionRef: DeleteChatSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteChatSessionRef:
```typescript
const name = deleteChatSessionRef.operationName;
console.log(name);
```

### Variables
The `DeleteChatSession` mutation requires an argument of type `DeleteChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteChatSessionVariables {
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteChatSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteChatSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteChatSessionData {
  chatSession_delete?: ChatSession_Key | null;
}
```
### Using `DeleteChatSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteChatSession, DeleteChatSessionVariables } from '@dataconnect/generated';

// The `DeleteChatSession` mutation requires an argument of type `DeleteChatSessionVariables`:
const deleteChatSessionVars: DeleteChatSessionVariables = {
  sessionId: ..., 
};

// Call the `deleteChatSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteChatSession(deleteChatSessionVars);
// Variables can be defined inline as well.
const { data } = await deleteChatSession({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteChatSession(dataConnect, deleteChatSessionVars);

console.log(data.chatSession_delete);

// Or, you can use the `Promise` API.
deleteChatSession(deleteChatSessionVars).then((response) => {
  const data = response.data;
  console.log(data.chatSession_delete);
});
```

### Using `DeleteChatSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteChatSessionRef, DeleteChatSessionVariables } from '@dataconnect/generated';

// The `DeleteChatSession` mutation requires an argument of type `DeleteChatSessionVariables`:
const deleteChatSessionVars: DeleteChatSessionVariables = {
  sessionId: ..., 
};

// Call the `deleteChatSessionRef()` function to get a reference to the mutation.
const ref = deleteChatSessionRef(deleteChatSessionVars);
// Variables can be defined inline as well.
const ref = deleteChatSessionRef({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteChatSessionRef(dataConnect, deleteChatSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chatSession_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chatSession_delete);
});
```

## AddChat
You can execute the `AddChat` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addChat(vars: AddChatVariables): MutationPromise<AddChatData, AddChatVariables>;

interface AddChatRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddChatVariables): MutationRef<AddChatData, AddChatVariables>;
}
export const addChatRef: AddChatRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addChat(dc: DataConnect, vars: AddChatVariables): MutationPromise<AddChatData, AddChatVariables>;

interface AddChatRef {
  ...
  (dc: DataConnect, vars: AddChatVariables): MutationRef<AddChatData, AddChatVariables>;
}
export const addChatRef: AddChatRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addChatRef:
```typescript
const name = addChatRef.operationName;
console.log(name);
```

### Variables
The `AddChat` mutation requires an argument of type `AddChatVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddChatVariables {
  sessionId: UUIDString;
  content: string;
  response?: string | null;
  paperIds?: UUIDString[] | null;
}
```
### Return Type
Recall that executing the `AddChat` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddChatData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddChatData {
  chat_insert: Chat_Key;
}
```
### Using `AddChat`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addChat, AddChatVariables } from '@dataconnect/generated';

// The `AddChat` mutation requires an argument of type `AddChatVariables`:
const addChatVars: AddChatVariables = {
  sessionId: ..., 
  content: ..., 
  response: ..., // optional
  paperIds: ..., // optional
};

// Call the `addChat()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addChat(addChatVars);
// Variables can be defined inline as well.
const { data } = await addChat({ sessionId: ..., content: ..., response: ..., paperIds: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addChat(dataConnect, addChatVars);

console.log(data.chat_insert);

// Or, you can use the `Promise` API.
addChat(addChatVars).then((response) => {
  const data = response.data;
  console.log(data.chat_insert);
});
```

### Using `AddChat`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addChatRef, AddChatVariables } from '@dataconnect/generated';

// The `AddChat` mutation requires an argument of type `AddChatVariables`:
const addChatVars: AddChatVariables = {
  sessionId: ..., 
  content: ..., 
  response: ..., // optional
  paperIds: ..., // optional
};

// Call the `addChatRef()` function to get a reference to the mutation.
const ref = addChatRef(addChatVars);
// Variables can be defined inline as well.
const ref = addChatRef({ sessionId: ..., content: ..., response: ..., paperIds: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addChatRef(dataConnect, addChatVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chat_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chat_insert);
});
```

## LinkPaperToChat
You can execute the `LinkPaperToChat` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
linkPaperToChat(vars: LinkPaperToChatVariables): MutationPromise<LinkPaperToChatData, LinkPaperToChatVariables>;

interface LinkPaperToChatRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkPaperToChatVariables): MutationRef<LinkPaperToChatData, LinkPaperToChatVariables>;
}
export const linkPaperToChatRef: LinkPaperToChatRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
linkPaperToChat(dc: DataConnect, vars: LinkPaperToChatVariables): MutationPromise<LinkPaperToChatData, LinkPaperToChatVariables>;

interface LinkPaperToChatRef {
  ...
  (dc: DataConnect, vars: LinkPaperToChatVariables): MutationRef<LinkPaperToChatData, LinkPaperToChatVariables>;
}
export const linkPaperToChatRef: LinkPaperToChatRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the linkPaperToChatRef:
```typescript
const name = linkPaperToChatRef.operationName;
console.log(name);
```

### Variables
The `LinkPaperToChat` mutation requires an argument of type `LinkPaperToChatVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface LinkPaperToChatVariables {
  chatId: UUIDString;
  paperId: UUIDString;
}
```
### Return Type
Recall that executing the `LinkPaperToChat` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LinkPaperToChatData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface LinkPaperToChatData {
  chatPaper_insert: ChatPaper_Key;
}
```
### Using `LinkPaperToChat`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, linkPaperToChat, LinkPaperToChatVariables } from '@dataconnect/generated';

// The `LinkPaperToChat` mutation requires an argument of type `LinkPaperToChatVariables`:
const linkPaperToChatVars: LinkPaperToChatVariables = {
  chatId: ..., 
  paperId: ..., 
};

// Call the `linkPaperToChat()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await linkPaperToChat(linkPaperToChatVars);
// Variables can be defined inline as well.
const { data } = await linkPaperToChat({ chatId: ..., paperId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await linkPaperToChat(dataConnect, linkPaperToChatVars);

console.log(data.chatPaper_insert);

// Or, you can use the `Promise` API.
linkPaperToChat(linkPaperToChatVars).then((response) => {
  const data = response.data;
  console.log(data.chatPaper_insert);
});
```

### Using `LinkPaperToChat`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, linkPaperToChatRef, LinkPaperToChatVariables } from '@dataconnect/generated';

// The `LinkPaperToChat` mutation requires an argument of type `LinkPaperToChatVariables`:
const linkPaperToChatVars: LinkPaperToChatVariables = {
  chatId: ..., 
  paperId: ..., 
};

// Call the `linkPaperToChatRef()` function to get a reference to the mutation.
const ref = linkPaperToChatRef(linkPaperToChatVars);
// Variables can be defined inline as well.
const ref = linkPaperToChatRef({ chatId: ..., paperId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = linkPaperToChatRef(dataConnect, linkPaperToChatVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chatPaper_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chatPaper_insert);
});
```

## AddCodeLink
You can execute the `AddCodeLink` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addCodeLink(vars: AddCodeLinkVariables): MutationPromise<AddCodeLinkData, AddCodeLinkVariables>;

interface AddCodeLinkRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCodeLinkVariables): MutationRef<AddCodeLinkData, AddCodeLinkVariables>;
}
export const addCodeLinkRef: AddCodeLinkRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addCodeLink(dc: DataConnect, vars: AddCodeLinkVariables): MutationPromise<AddCodeLinkData, AddCodeLinkVariables>;

interface AddCodeLinkRef {
  ...
  (dc: DataConnect, vars: AddCodeLinkVariables): MutationRef<AddCodeLinkData, AddCodeLinkVariables>;
}
export const addCodeLinkRef: AddCodeLinkRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addCodeLinkRef:
```typescript
const name = addCodeLinkRef.operationName;
console.log(name);
```

### Variables
The `AddCodeLink` mutation requires an argument of type `AddCodeLinkVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddCodeLinkVariables {
  paperId: UUIDString;
  url: string;
  repositoryName?: string | null;
}
```
### Return Type
Recall that executing the `AddCodeLink` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddCodeLinkData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddCodeLinkData {
  codeLink_insert: CodeLink_Key;
}
```
### Using `AddCodeLink`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addCodeLink, AddCodeLinkVariables } from '@dataconnect/generated';

// The `AddCodeLink` mutation requires an argument of type `AddCodeLinkVariables`:
const addCodeLinkVars: AddCodeLinkVariables = {
  paperId: ..., 
  url: ..., 
  repositoryName: ..., // optional
};

// Call the `addCodeLink()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addCodeLink(addCodeLinkVars);
// Variables can be defined inline as well.
const { data } = await addCodeLink({ paperId: ..., url: ..., repositoryName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addCodeLink(dataConnect, addCodeLinkVars);

console.log(data.codeLink_insert);

// Or, you can use the `Promise` API.
addCodeLink(addCodeLinkVars).then((response) => {
  const data = response.data;
  console.log(data.codeLink_insert);
});
```

### Using `AddCodeLink`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addCodeLinkRef, AddCodeLinkVariables } from '@dataconnect/generated';

// The `AddCodeLink` mutation requires an argument of type `AddCodeLinkVariables`:
const addCodeLinkVars: AddCodeLinkVariables = {
  paperId: ..., 
  url: ..., 
  repositoryName: ..., // optional
};

// Call the `addCodeLinkRef()` function to get a reference to the mutation.
const ref = addCodeLinkRef(addCodeLinkVars);
// Variables can be defined inline as well.
const ref = addCodeLinkRef({ paperId: ..., url: ..., repositoryName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addCodeLinkRef(dataConnect, addCodeLinkVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.codeLink_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.codeLink_insert);
});
```

## DeleteCodeLink
You can execute the `DeleteCodeLink` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteCodeLink(vars: DeleteCodeLinkVariables): MutationPromise<DeleteCodeLinkData, DeleteCodeLinkVariables>;

interface DeleteCodeLinkRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCodeLinkVariables): MutationRef<DeleteCodeLinkData, DeleteCodeLinkVariables>;
}
export const deleteCodeLinkRef: DeleteCodeLinkRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCodeLink(dc: DataConnect, vars: DeleteCodeLinkVariables): MutationPromise<DeleteCodeLinkData, DeleteCodeLinkVariables>;

interface DeleteCodeLinkRef {
  ...
  (dc: DataConnect, vars: DeleteCodeLinkVariables): MutationRef<DeleteCodeLinkData, DeleteCodeLinkVariables>;
}
export const deleteCodeLinkRef: DeleteCodeLinkRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCodeLinkRef:
```typescript
const name = deleteCodeLinkRef.operationName;
console.log(name);
```

### Variables
The `DeleteCodeLink` mutation requires an argument of type `DeleteCodeLinkVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCodeLinkVariables {
  linkId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteCodeLink` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCodeLinkData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCodeLinkData {
  codeLink_delete?: CodeLink_Key | null;
}
```
### Using `DeleteCodeLink`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCodeLink, DeleteCodeLinkVariables } from '@dataconnect/generated';

// The `DeleteCodeLink` mutation requires an argument of type `DeleteCodeLinkVariables`:
const deleteCodeLinkVars: DeleteCodeLinkVariables = {
  linkId: ..., 
};

// Call the `deleteCodeLink()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCodeLink(deleteCodeLinkVars);
// Variables can be defined inline as well.
const { data } = await deleteCodeLink({ linkId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCodeLink(dataConnect, deleteCodeLinkVars);

console.log(data.codeLink_delete);

// Or, you can use the `Promise` API.
deleteCodeLink(deleteCodeLinkVars).then((response) => {
  const data = response.data;
  console.log(data.codeLink_delete);
});
```

### Using `DeleteCodeLink`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCodeLinkRef, DeleteCodeLinkVariables } from '@dataconnect/generated';

// The `DeleteCodeLink` mutation requires an argument of type `DeleteCodeLinkVariables`:
const deleteCodeLinkVars: DeleteCodeLinkVariables = {
  linkId: ..., 
};

// Call the `deleteCodeLinkRef()` function to get a reference to the mutation.
const ref = deleteCodeLinkRef(deleteCodeLinkVars);
// Variables can be defined inline as well.
const ref = deleteCodeLinkRef({ linkId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCodeLinkRef(dataConnect, deleteCodeLinkVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.codeLink_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.codeLink_delete);
});
```

