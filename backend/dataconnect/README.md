# Firebase Data Connect setup

This directory defines the Data Connect schema and a sample connector for the Research Paper Analysis platform.

What’s here:
- schema/schema.gql — tables and relations (Users, Papers, Codebases, Files, Commits, Chats, etc.)
- dataconnect.yaml — service and datasource configuration
- example/connector.yaml — generates a JS SDK into `backend/src/dataconnect-generated`
- example/queries.gql — example read operations
- example/mutations.gql — example write operations
- seed_data.gql — seed mutations for local use (emulator)

## Firebase Dependency
``` bash
npm i -g firebase-tools
```
## Firebase login
``` bash
cd backend
firebase login
firebase use praxis-wall-474823-v4
```

# Some work to be done with actaully connecting to firebase in cloud

## Local development (emulator)
1) Start the Data Connect emulator and apply the schema

``` bash 
cd  backend
firebase emulators:start --only dataconnect
# In a second terminal , apply the schema (emulator autodetects):
cd backend
firebase dataconnect:apply
```

2) Generate the client SDK

``` bash 
firebase dataconnect:generate
```
This writes the SDK to `src/dataconnect-generated/` (configured in `example/connector.yaml`).


## Notes
- The `User.id` key is the Firebase Auth UID. Many mutations use `id_expr: "auth.uid"` so users can only act as themselves.
- Reverse relation fields follow the pattern `<childPlural>_on_<parentField>` (e.g., `codeLinks_on_paper`).
- Pagination: use `limit`, `offset`, and `orderBy` on list queries.
- Enums in the OpenAPI are modeled as `String` columns for agility. You can convert to GraphQL enums later if you prefer strictness.
