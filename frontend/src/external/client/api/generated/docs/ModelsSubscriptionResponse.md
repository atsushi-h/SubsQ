
# ModelsSubscriptionResponse

サブスクリプションレスポンス

## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`serviceName` | string
`amount` | number
`billingCycle` | [ModelsBillingCycle](ModelsBillingCycle.md)
`baseDate` | Date
`nextBillingDate` | Date
`paymentMethodId` | string
`paymentMethod` | [ModelsPaymentMethodSummary](ModelsPaymentMethodSummary.md)
`memo` | string
`monthlyAmount` | number
`yearlyAmount` | number
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { ModelsSubscriptionResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userId": null,
  "serviceName": null,
  "amount": null,
  "billingCycle": null,
  "baseDate": null,
  "nextBillingDate": null,
  "paymentMethodId": null,
  "paymentMethod": null,
  "memo": null,
  "monthlyAmount": null,
  "yearlyAmount": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies ModelsSubscriptionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelsSubscriptionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


