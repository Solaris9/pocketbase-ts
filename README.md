# pocketbase-ts

Note: This is a work in progress, this should not be used until it close to release.

A simplified PocketBase SDK to ease the developer experience.

## Features

- Modular API
- Strongly typed schemas

## Roadmap/Todo

- [ ] Finish rest of the PocketBase API
- [x] Add authentication
- [x] Clean up code significantly
- [ ] Add realtime records
- [x] Add base schema for Users & Admins
- [ ] Add Settings collection
- [ ] Add Logs collection
- [ ] Add import collection
- [ ] Add good error handling
- [ ] Finish schema validation

## Usage

This is using the demo on the [pocketbase.io](https://pocketbase.io/demo) site.

```typescript
import { init, collection, list, Schema, Type, authPassword, Admins } from "pocketbase-ts";

async function main() {
    init("https://pocketbase.io");
    await authPassword(Admins, "test@example.com", "123456");

    const PostSchema = new Schema({
        title: Type.text({ required: true }),
        description: Type.text(),
        active: Type.bool(),
        options: Type.select(),
        featuredImages: Type.file()
    });

    const Posts = collection("posts", PostSchema);
    const posts = await list(Posts, { filter: "active=true" });

    console.log(posts);
}

main();
```

## Understanding the API

The API is designed like `action (...arguments)`

To get a record by ID you use the `get` function.

```ts
await get(Users, "id of record");
```

To find one record you use the `find` function.

```ts
await find(Users, { filter: "likes>10" });
```

To create a record you use the `create` function.

```ts
await create(Users, { name: "Solaris9" });
```

To list paginated records you use the `list` function.

```ts
await list(Users, { sort: "created" });
```

This is uniform across the rest of the api.

Authenticating is similar using the authentications methods.

```ts
await authPassword(Users, "user@example.com", "123456");
await authPassword(Admins, "test@example.com", "123456");

await requestEmailChange(Admins, "test2@example.com");
await confirmEmailChange(Admins, token, password);
```
