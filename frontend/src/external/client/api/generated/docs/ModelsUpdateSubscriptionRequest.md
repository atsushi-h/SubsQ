
# ModelsUpdateSubscriptionRequest

サブスクリプション更新リクエスト

## Properties

Name | Type
------------ | -------------
`serviceName` | string
`amount` | number
`billingCycle` | [ModelsBillingCycle](ModelsBillingCycle.md)
`baseDate` | Date
`paymentMethodId` | string
`memo` | string

## Example

```typescript
import type { ModelsUpdateSubscriptionRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "serviceName": null,
  "amount": null,
  "billingCycle": null,
  "baseDate": null,
  "paymentMethodId": null,
  "memo": null,
} satisfies ModelsUpdateSubscriptionRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelsUpdateSubscriptionRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


