# pocketbase orm

Note: This is a work in progress, this should not be used until it close to release.

A simplified PocketBase SDK to ease the developer experience.

## features

- Modular API
- Strongly typed schema

## Roadmap/Todo

[] Finish rest of the PocketBase API
[] Add authentication
[] Clean up code significantly

## Usage

This is using the demo on the [pocketbase.io](https://pocketbase.io/demo) site.

```typescript
import { init, collection, list, schema, Type, adminAuthWithPassword } from "pocketbase-orm";

async function main() {
    init("https://pocketbase.io");
    await adminAuthWithPassword("test@example.com", "123456");

    const postSchema = schema({
        title: Type.text({ required: true }),
        description: Type.text(),
        active: Type.bool(),
        options: Type.select(),
        featuredImages: Type.file()
    });

    const postsCol = collection("posts", postSchema);
    const posts = await list(postsCol);
    
    console.log(posts);
}

main();
```
