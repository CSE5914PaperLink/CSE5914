# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUser, useAddPaper, useUpdatePaperIngestionStatus, useDeletePaper, useTogglePaperFavorite, useCreateChatSession, useUpdateChatSession, useDeleteChatSession, useAddChat, useLinkPaperToChat } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUser(createUserVars);

const { data, isPending, isSuccess, isError, error } = useAddPaper(addPaperVars);

const { data, isPending, isSuccess, isError, error } = useUpdatePaperIngestionStatus(updatePaperIngestionStatusVars);

const { data, isPending, isSuccess, isError, error } = useDeletePaper(deletePaperVars);

const { data, isPending, isSuccess, isError, error } = useTogglePaperFavorite(togglePaperFavoriteVars);

const { data, isPending, isSuccess, isError, error } = useCreateChatSession(createChatSessionVars);

const { data, isPending, isSuccess, isError, error } = useUpdateChatSession(updateChatSessionVars);

const { data, isPending, isSuccess, isError, error } = useDeleteChatSession(deleteChatSessionVars);

const { data, isPending, isSuccess, isError, error } = useAddChat(addChatVars);

const { data, isPending, isSuccess, isError, error } = useLinkPaperToChat(linkPaperToChatVars);

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
import { createUser, addPaper, updatePaperIngestionStatus, deletePaper, togglePaperFavorite, createChatSession, updateChatSession, deleteChatSession, addChat, linkPaperToChat } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation AddPaper:  For variables, look at type AddPaperVars in ../index.d.ts
const { data } = await AddPaper(dataConnect, addPaperVars);

// Operation UpdatePaperIngestionStatus:  For variables, look at type UpdatePaperIngestionStatusVars in ../index.d.ts
const { data } = await UpdatePaperIngestionStatus(dataConnect, updatePaperIngestionStatusVars);

// Operation DeletePaper:  For variables, look at type DeletePaperVars in ../index.d.ts
const { data } = await DeletePaper(dataConnect, deletePaperVars);

// Operation TogglePaperFavorite:  For variables, look at type TogglePaperFavoriteVars in ../index.d.ts
const { data } = await TogglePaperFavorite(dataConnect, togglePaperFavoriteVars);

// Operation CreateChatSession:  For variables, look at type CreateChatSessionVars in ../index.d.ts
const { data } = await CreateChatSession(dataConnect, createChatSessionVars);

// Operation UpdateChatSession:  For variables, look at type UpdateChatSessionVars in ../index.d.ts
const { data } = await UpdateChatSession(dataConnect, updateChatSessionVars);

// Operation DeleteChatSession:  For variables, look at type DeleteChatSessionVars in ../index.d.ts
const { data } = await DeleteChatSession(dataConnect, deleteChatSessionVars);

// Operation AddChat:  For variables, look at type AddChatVars in ../index.d.ts
const { data } = await AddChat(dataConnect, addChatVars);

// Operation LinkPaperToChat:  For variables, look at type LinkPaperToChatVars in ../index.d.ts
const { data } = await LinkPaperToChat(dataConnect, linkPaperToChatVars);


```