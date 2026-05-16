
# ModelsUserResponse

ユーザー情報レスポンス

## Properties

Name | Type
------------ | -------------
`id` | string
`email` | string
`name` | string
`provider` | string
`providerAccountId` | string
`thumbnail` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { ModelsUserResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "email": null,
  "name": null,
  "provider": null,
  "providerAccountId": null,
  "thumbnail": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies ModelsUserResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelsUserResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


