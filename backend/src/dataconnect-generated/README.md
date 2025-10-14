# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPapers*](#listpapers)
  - [*MyPapers*](#mypapers)
  - [*GetPaper*](#getpaper)
- [**Mutations**](#mutations)
  - [*UpsertUser*](#upsertuser)
  - [*CreatePaper*](#createpaper)
  - [*LinkCodebase*](#linkcodebase)
  - [*AddCodeLink*](#addcodelink)
  - [*CreateChatSession*](#createchatsession)
  - [*AddChatMessage*](#addchatmessage)

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

## ListPapers
You can execute the `ListPapers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPapers(vars?: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;

interface ListPapersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
}
export const listPapersRef: ListPapersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPapers(dc: DataConnect, vars?: ListPapersVariables): QueryPromise<ListPapersData, ListPapersVariables>;

interface ListPapersRef {
  ...
  (dc: DataConnect, vars?: ListPapersVariables): QueryRef<ListPapersData, ListPapersVariables>;
}
export const listPapersRef: ListPapersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPapersRef:
```typescript
const name = listPapersRef.operationName;
console.log(name);
```

### Variables
The `ListPapers` query has an optional argument of type `ListPapersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPapersVariables {
  pageSize?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListPapers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPapersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPapersData {
  papers: ({
    id: UUIDString;
    title: string;
    year?: number | null;
    citationCount?: number | null;
    ingestionStatus?: string | null;
  } & Paper_Key)[];
}
```
### Using `ListPapers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPapers, ListPapersVariables } from '@dataconnect/generated';

// The `ListPapers` query has an optional argument of type `ListPapersVariables`:
const listPapersVars: ListPapersVariables = {
  pageSize: ..., // optional
  offset: ..., // optional
};

// Call the `listPapers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPapers(listPapersVars);
// Variables can be defined inline as well.
const { data } = await listPapers({ pageSize: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListPapersVariables` argument.
const { data } = await listPapers();

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

// The `ListPapers` query has an optional argument of type `ListPapersVariables`:
const listPapersVars: ListPapersVariables = {
  pageSize: ..., // optional
  offset: ..., // optional
};

// Call the `listPapersRef()` function to get a reference to the query.
const ref = listPapersRef(listPapersVars);
// Variables can be defined inline as well.
const ref = listPapersRef({ pageSize: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListPapersVariables` argument.
const ref = listPapersRef();

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

## MyPapers
You can execute the `MyPapers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myPapers(): QueryPromise<MyPapersData, undefined>;

interface MyPapersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyPapersData, undefined>;
}
export const myPapersRef: MyPapersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myPapers(dc: DataConnect): QueryPromise<MyPapersData, undefined>;

interface MyPapersRef {
  ...
  (dc: DataConnect): QueryRef<MyPapersData, undefined>;
}
export const myPapersRef: MyPapersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myPapersRef:
```typescript
const name = myPapersRef.operationName;
console.log(name);
```

### Variables
The `MyPapers` query has no variables.
### Return Type
Recall that executing the `MyPapers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyPapersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `MyPapers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myPapers } from '@dataconnect/generated';


// Call the `myPapers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myPapers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myPapers(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
myPapers().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `MyPapers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myPapersRef } from '@dataconnect/generated';


// Call the `myPapersRef()` function to get a reference to the query.
const ref = myPapersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myPapersRef(dataConnect);

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
  id: UUIDString;
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
```
### Using `GetPaper`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPaper, GetPaperVariables } from '@dataconnect/generated';

// The `GetPaper` query requires an argument of type `GetPaperVariables`:
const getPaperVars: GetPaperVariables = {
  id: ..., 
};

// Call the `getPaper()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPaper(getPaperVars);
// Variables can be defined inline as well.
const { data } = await getPaper({ id: ..., });

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
  id: ..., 
};

// Call the `getPaperRef()` function to get a reference to the query.
const ref = getPaperRef(getPaperVars);
// Variables can be defined inline as well.
const ref = getPaperRef({ id: ..., });

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

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserRef:
```typescript
const name = upsertUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserVariables {
  name?: string | null;
  email: string;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@dataconnect/generated';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  name: ..., // optional
  email: ..., 
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ name: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@dataconnect/generated';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  name: ..., // optional
  email: ..., 
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ name: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## CreatePaper
You can execute the `CreatePaper` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPaper(vars: CreatePaperVariables): MutationPromise<CreatePaperData, CreatePaperVariables>;

interface CreatePaperRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePaperVariables): MutationRef<CreatePaperData, CreatePaperVariables>;
}
export const createPaperRef: CreatePaperRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPaper(dc: DataConnect, vars: CreatePaperVariables): MutationPromise<CreatePaperData, CreatePaperVariables>;

interface CreatePaperRef {
  ...
  (dc: DataConnect, vars: CreatePaperVariables): MutationRef<CreatePaperData, CreatePaperVariables>;
}
export const createPaperRef: CreatePaperRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPaperRef:
```typescript
const name = createPaperRef.operationName;
console.log(name);
```

### Variables
The `CreatePaper` mutation requires an argument of type `CreatePaperVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePaperVariables {
  title: string;
  authors?: string[] | null;
  year?: number | null;
  abstract?: string | null;
}
```
### Return Type
Recall that executing the `CreatePaper` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePaperData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePaperData {
  paper_insert: Paper_Key;
}
```
### Using `CreatePaper`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPaper, CreatePaperVariables } from '@dataconnect/generated';

// The `CreatePaper` mutation requires an argument of type `CreatePaperVariables`:
const createPaperVars: CreatePaperVariables = {
  title: ..., 
  authors: ..., // optional
  year: ..., // optional
  abstract: ..., // optional
};

// Call the `createPaper()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPaper(createPaperVars);
// Variables can be defined inline as well.
const { data } = await createPaper({ title: ..., authors: ..., year: ..., abstract: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPaper(dataConnect, createPaperVars);

console.log(data.paper_insert);

// Or, you can use the `Promise` API.
createPaper(createPaperVars).then((response) => {
  const data = response.data;
  console.log(data.paper_insert);
});
```

### Using `CreatePaper`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPaperRef, CreatePaperVariables } from '@dataconnect/generated';

// The `CreatePaper` mutation requires an argument of type `CreatePaperVariables`:
const createPaperVars: CreatePaperVariables = {
  title: ..., 
  authors: ..., // optional
  year: ..., // optional
  abstract: ..., // optional
};

// Call the `createPaperRef()` function to get a reference to the mutation.
const ref = createPaperRef(createPaperVars);
// Variables can be defined inline as well.
const ref = createPaperRef({ title: ..., authors: ..., year: ..., abstract: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPaperRef(dataConnect, createPaperVars);

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

## LinkCodebase
You can execute the `LinkCodebase` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
linkCodebase(vars: LinkCodebaseVariables): MutationPromise<LinkCodebaseData, LinkCodebaseVariables>;

interface LinkCodebaseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkCodebaseVariables): MutationRef<LinkCodebaseData, LinkCodebaseVariables>;
}
export const linkCodebaseRef: LinkCodebaseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
linkCodebase(dc: DataConnect, vars: LinkCodebaseVariables): MutationPromise<LinkCodebaseData, LinkCodebaseVariables>;

interface LinkCodebaseRef {
  ...
  (dc: DataConnect, vars: LinkCodebaseVariables): MutationRef<LinkCodebaseData, LinkCodebaseVariables>;
}
export const linkCodebaseRef: LinkCodebaseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the linkCodebaseRef:
```typescript
const name = linkCodebaseRef.operationName;
console.log(name);
```

### Variables
The `LinkCodebase` mutation requires an argument of type `LinkCodebaseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface LinkCodebaseVariables {
  paperId: UUIDString;
  repositoryUrl: string;
}
```
### Return Type
Recall that executing the `LinkCodebase` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LinkCodebaseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface LinkCodebaseData {
  codebase_upsert: Codebase_Key;
}
```
### Using `LinkCodebase`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, linkCodebase, LinkCodebaseVariables } from '@dataconnect/generated';

// The `LinkCodebase` mutation requires an argument of type `LinkCodebaseVariables`:
const linkCodebaseVars: LinkCodebaseVariables = {
  paperId: ..., 
  repositoryUrl: ..., 
};

// Call the `linkCodebase()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await linkCodebase(linkCodebaseVars);
// Variables can be defined inline as well.
const { data } = await linkCodebase({ paperId: ..., repositoryUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await linkCodebase(dataConnect, linkCodebaseVars);

console.log(data.codebase_upsert);

// Or, you can use the `Promise` API.
linkCodebase(linkCodebaseVars).then((response) => {
  const data = response.data;
  console.log(data.codebase_upsert);
});
```

### Using `LinkCodebase`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, linkCodebaseRef, LinkCodebaseVariables } from '@dataconnect/generated';

// The `LinkCodebase` mutation requires an argument of type `LinkCodebaseVariables`:
const linkCodebaseVars: LinkCodebaseVariables = {
  paperId: ..., 
  repositoryUrl: ..., 
};

// Call the `linkCodebaseRef()` function to get a reference to the mutation.
const ref = linkCodebaseRef(linkCodebaseVars);
// Variables can be defined inline as well.
const ref = linkCodebaseRef({ paperId: ..., repositoryUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = linkCodebaseRef(dataConnect, linkCodebaseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.codebase_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.codebase_upsert);
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
}
```
### Return Type
Recall that executing the `AddCodeLink` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddCodeLinkData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddCodeLinkData {
  codeLink_upsert: CodeLink_Key;
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
};

// Call the `addCodeLink()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addCodeLink(addCodeLinkVars);
// Variables can be defined inline as well.
const { data } = await addCodeLink({ paperId: ..., url: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addCodeLink(dataConnect, addCodeLinkVars);

console.log(data.codeLink_upsert);

// Or, you can use the `Promise` API.
addCodeLink(addCodeLinkVars).then((response) => {
  const data = response.data;
  console.log(data.codeLink_upsert);
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
};

// Call the `addCodeLinkRef()` function to get a reference to the mutation.
const ref = addCodeLinkRef(addCodeLinkVars);
// Variables can be defined inline as well.
const ref = addCodeLinkRef({ paperId: ..., url: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addCodeLinkRef(dataConnect, addCodeLinkVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.codeLink_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.codeLink_upsert);
});
```

## CreateChatSession
You can execute the `CreateChatSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createChatSession(vars?: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;

interface CreateChatSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
}
export const createChatSessionRef: CreateChatSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createChatSession(dc: DataConnect, vars?: CreateChatSessionVariables): MutationPromise<CreateChatSessionData, CreateChatSessionVariables>;

interface CreateChatSessionRef {
  ...
  (dc: DataConnect, vars?: CreateChatSessionVariables): MutationRef<CreateChatSessionData, CreateChatSessionVariables>;
}
export const createChatSessionRef: CreateChatSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createChatSessionRef:
```typescript
const name = createChatSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateChatSession` mutation has an optional argument of type `CreateChatSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateChatSessionVariables {
  title?: string | null;
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

// The `CreateChatSession` mutation has an optional argument of type `CreateChatSessionVariables`:
const createChatSessionVars: CreateChatSessionVariables = {
  title: ..., // optional
};

// Call the `createChatSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createChatSession(createChatSessionVars);
// Variables can be defined inline as well.
const { data } = await createChatSession({ title: ..., });
// Since all variables are optional for this mutation, you can omit the `CreateChatSessionVariables` argument.
const { data } = await createChatSession();

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

// The `CreateChatSession` mutation has an optional argument of type `CreateChatSessionVariables`:
const createChatSessionVars: CreateChatSessionVariables = {
  title: ..., // optional
};

// Call the `createChatSessionRef()` function to get a reference to the mutation.
const ref = createChatSessionRef(createChatSessionVars);
// Variables can be defined inline as well.
const ref = createChatSessionRef({ title: ..., });
// Since all variables are optional for this mutation, you can omit the `CreateChatSessionVariables` argument.
const ref = createChatSessionRef();

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

## AddChatMessage
You can execute the `AddChatMessage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addChatMessage(vars: AddChatMessageVariables): MutationPromise<AddChatMessageData, AddChatMessageVariables>;

interface AddChatMessageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddChatMessageVariables): MutationRef<AddChatMessageData, AddChatMessageVariables>;
}
export const addChatMessageRef: AddChatMessageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addChatMessage(dc: DataConnect, vars: AddChatMessageVariables): MutationPromise<AddChatMessageData, AddChatMessageVariables>;

interface AddChatMessageRef {
  ...
  (dc: DataConnect, vars: AddChatMessageVariables): MutationRef<AddChatMessageData, AddChatMessageVariables>;
}
export const addChatMessageRef: AddChatMessageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addChatMessageRef:
```typescript
const name = addChatMessageRef.operationName;
console.log(name);
```

### Variables
The `AddChatMessage` mutation requires an argument of type `AddChatMessageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddChatMessageVariables {
  sessionId: UUIDString;
  role: string;
  content: string;
}
```
### Return Type
Recall that executing the `AddChatMessage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddChatMessageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddChatMessageData {
  chatMessage_insert: ChatMessage_Key;
}
```
### Using `AddChatMessage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addChatMessage, AddChatMessageVariables } from '@dataconnect/generated';

// The `AddChatMessage` mutation requires an argument of type `AddChatMessageVariables`:
const addChatMessageVars: AddChatMessageVariables = {
  sessionId: ..., 
  role: ..., 
  content: ..., 
};

// Call the `addChatMessage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addChatMessage(addChatMessageVars);
// Variables can be defined inline as well.
const { data } = await addChatMessage({ sessionId: ..., role: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addChatMessage(dataConnect, addChatMessageVars);

console.log(data.chatMessage_insert);

// Or, you can use the `Promise` API.
addChatMessage(addChatMessageVars).then((response) => {
  const data = response.data;
  console.log(data.chatMessage_insert);
});
```

### Using `AddChatMessage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addChatMessageRef, AddChatMessageVariables } from '@dataconnect/generated';

// The `AddChatMessage` mutation requires an argument of type `AddChatMessageVariables`:
const addChatMessageVars: AddChatMessageVariables = {
  sessionId: ..., 
  role: ..., 
  content: ..., 
};

// Call the `addChatMessageRef()` function to get a reference to the mutation.
const ref = addChatMessageRef(addChatMessageVars);
// Variables can be defined inline as well.
const ref = addChatMessageRef({ sessionId: ..., role: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addChatMessageRef(dataConnect, addChatMessageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chatMessage_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chatMessage_insert);
});
```

