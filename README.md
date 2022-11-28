# pocketbase orm

Note: This is a work in progress, this should not be used until it close to release.

A simplified PocketBase SDK to ease the developer experience.

## Features

- Modular API
- Strongly typed schema

## Roadmap/Todo

- [ ] Finish rest of the PocketBase API
- [x] Add authentication
- [ ] Clean up code significantly
- [ ] Add realtime records
- [ ] Add base schema for Users & Admins
- [ ] Add Settings collection
- [ ] Add Logs collection
- [ ] Add import collection

## Usage

This is using the demo on the [pocketbase.io](https://pocketbase.io/demo) site.

```typescript
import { init, collection, list, schema, Type, authPassword, Admins } from "pocketbase-orm";

async function main() {
    init("https://pocketbase.io");
    await authPassword(Admins, "test@example.com", "123456");

    const PostSchema = schema({
        title: Type.text({ required: true }),
        description: Type.text(),
        active: Type.bool(),
        options: Type.select(),
        featuredImages: Type.file()
    });

    const Posts = collection("posts", PostSchema);
    const posts = await list(Posts);

    console.log(posts);
}

main();
```

## Understanding the API

The API is designed like `action arguments`

To create data you use the `create` function.

```ts
create(Users, { name: "Solaris9" });
```

To list data you use the `list` function.

```ts
list(Users, { sort: "created" });
```

This is uniform across the rest of the api.
Creating collections is the same as shown below.

Authenticating is similar using the authentications methods.

```ts
await authPassword(Admins, "test@example.com", "123456");
await authPassword(Users, "user@example.com", "123456");
await authPassword(Admins, "test@example.com", "123456");

await requestEmailChange(Admins, "test2@example.com");
await confirmEmailChange(Admins, "test2@example.com");
```

## Examples

### Creating collections

```typescript
import { init, Collections, Admins, schema, Type, collection, create, authPassword } from ".";

async function main() {
    init("https://pocketbase.io");
    await authPassword(Admins, "test@example.com", "123456");

    const ExampleSchema = schema({
        content: Type.text({ required: true }),
        author: Type.text({ required: true }),
    });

    const Example = collection("example", ExampleSchema);
    await create(Collections, Example.definition);
}

main();
```
