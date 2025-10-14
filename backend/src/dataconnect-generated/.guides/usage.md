# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, createPaper, linkCodebase, addCodeLink, createChatSession, addChatMessage, listPapers, myPapers, getPaper } from '@dataconnect/generated';


// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation CreatePaper:  For variables, look at type CreatePaperVars in ../index.d.ts
const { data } = await CreatePaper(dataConnect, createPaperVars);

// Operation LinkCodebase:  For variables, look at type LinkCodebaseVars in ../index.d.ts
const { data } = await LinkCodebase(dataConnect, linkCodebaseVars);

// Operation AddCodeLink:  For variables, look at type AddCodeLinkVars in ../index.d.ts
const { data } = await AddCodeLink(dataConnect, addCodeLinkVars);

// Operation CreateChatSession:  For variables, look at type CreateChatSessionVars in ../index.d.ts
const { data } = await CreateChatSession(dataConnect, createChatSessionVars);

// Operation AddChatMessage:  For variables, look at type AddChatMessageVars in ../index.d.ts
const { data } = await AddChatMessage(dataConnect, addChatMessageVars);

// Operation ListPapers:  For variables, look at type ListPapersVars in ../index.d.ts
const { data } = await ListPapers(dataConnect, listPapersVars);

// Operation MyPapers: 
const { data } = await MyPapers(dataConnect);

// Operation GetPaper:  For variables, look at type GetPaperVars in ../index.d.ts
const { data } = await GetPaper(dataConnect, getPaperVars);


```