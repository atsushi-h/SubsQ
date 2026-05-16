
# ModelsPaymentMethodResponse

支払い方法レスポンス

## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`name` | string
`usageCount` | number
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { ModelsPaymentMethodResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userId": null,
  "name": null,
  "usageCount": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies ModelsPaymentMethodResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelsPaymentMethodResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


