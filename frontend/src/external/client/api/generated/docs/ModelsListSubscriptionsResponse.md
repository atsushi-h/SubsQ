
# ModelsListSubscriptionsResponse

サブスクリプション一覧レスポンス

## Properties

Name | Type
------------ | -------------
`subscriptions` | [Array&lt;ModelsSubscriptionResponse&gt;](ModelsSubscriptionResponse.md)
`summary` | [ModelsSubscriptionListSummary](ModelsSubscriptionListSummary.md)

## Example

```typescript
import type { ModelsListSubscriptionsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "subscriptions": null,
  "summary": null,
} satisfies ModelsListSubscriptionsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelsListSubscriptionsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


