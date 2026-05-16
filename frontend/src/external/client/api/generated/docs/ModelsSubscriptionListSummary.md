
# ModelsSubscriptionListSummary

サブスクリプション一覧レスポンスのサマリー

## Properties

Name | Type
------------ | -------------
`monthlyTotal` | number
`yearlyTotal` | number
`count` | number

## Example

```typescript
import type { ModelsSubscriptionListSummary } from ''

// TODO: Update the object below with actual values
const example = {
  "monthlyTotal": null,
  "yearlyTotal": null,
  "count": null,
} satisfies ModelsSubscriptionListSummary

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelsSubscriptionListSummary
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


