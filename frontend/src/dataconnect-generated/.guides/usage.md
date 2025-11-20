# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useGetUserByEmail, useGetUser, useListPapers, useGetPaper, useSearchPapers, useListChatSessions, useGetChatSession, useGetChatsForSession, useGetChatPapersForChat, useGetCodeLinksForPaper } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useGetUserByEmail(getUserByEmailVars);

const { data, isPending, isSuccess, isError, error } = useGetUser(getUserVars);

const { data, isPending, isSuccess, isError, error } = useListPapers(listPapersVars);

const { data, isPending, isSuccess, isError, error } = useGetPaper(getPaperVars);

const { data, isPending, isSuccess, isError, error } = useSearchPapers(searchPapersVars);

const { data, isPending, isSuccess, isError, error } = useListChatSessions(listChatSessionsVars);

const { data, isPending, isSuccess, isError, error } = useGetChatSession(getChatSessionVars);

const { data, isPending, isSuccess, isError, error } = useGetChatsForSession(getChatsForSessionVars);

const { data, isPending, isSuccess, isError, error } = useGetChatPapersForChat(getChatPapersForChatVars);

const { data, isPending, isSuccess, isError, error } = useGetCodeLinksForPaper(getCodeLinksForPaperVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { getUserByEmail, getUser, listPapers, getPaper, searchPapers, listChatSessions, getChatSession, getChatsForSession, getChatPapersForChat, getCodeLinksForPaper } from '@dataconnect/generated';


// Operation GetUserByEmail:  For variables, look at type GetUserByEmailVars in ../index.d.ts
const { data } = await GetUserByEmail(dataConnect, getUserByEmailVars);

// Operation GetUser:  For variables, look at type GetUserVars in ../index.d.ts
const { data } = await GetUser(dataConnect, getUserVars);

// Operation ListPapers:  For variables, look at type ListPapersVars in ../index.d.ts
const { data } = await ListPapers(dataConnect, listPapersVars);

// Operation GetPaper:  For variables, look at type GetPaperVars in ../index.d.ts
const { data } = await GetPaper(dataConnect, getPaperVars);

// Operation SearchPapers:  For variables, look at type SearchPapersVars in ../index.d.ts
const { data } = await SearchPapers(dataConnect, searchPapersVars);

// Operation ListChatSessions:  For variables, look at type ListChatSessionsVars in ../index.d.ts
const { data } = await ListChatSessions(dataConnect, listChatSessionsVars);

// Operation GetChatSession:  For variables, look at type GetChatSessionVars in ../index.d.ts
const { data } = await GetChatSession(dataConnect, getChatSessionVars);

// Operation GetChatsForSession:  For variables, look at type GetChatsForSessionVars in ../index.d.ts
const { data } = await GetChatsForSession(dataConnect, getChatsForSessionVars);

// Operation GetChatPapersForChat:  For variables, look at type GetChatPapersForChatVars in ../index.d.ts
const { data } = await GetChatPapersForChat(dataConnect, getChatPapersForChatVars);

// Operation GetCodeLinksForPaper:  For variables, look at type GetCodeLinksForPaperVars in ../index.d.ts
const { data } = await GetCodeLinksForPaper(dataConnect, getCodeLinksForPaperVars);


```