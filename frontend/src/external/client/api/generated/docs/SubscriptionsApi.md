# SubscriptionsApi

All URIs are relative to *https://api.subsq-app.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**subscriptionsCreateSubscription**](SubscriptionsApi.md#subscriptionscreatesubscription) | **POST** /api/v1/subscriptions | Create subscription |
| [**subscriptionsDeleteSubscription**](SubscriptionsApi.md#subscriptionsdeletesubscription) | **DELETE** /api/v1/subscriptions/{id} | Delete subscription |
| [**subscriptionsDeleteSubscriptions**](SubscriptionsApi.md#subscriptionsdeletesubscriptions) | **DELETE** /api/v1/subscriptions | Delete multiple subscriptions |
| [**subscriptionsGetSubscription**](SubscriptionsApi.md#subscriptionsgetsubscription) | **GET** /api/v1/subscriptions/{id} | Get subscription by ID |
| [**subscriptionsListSubscriptions**](SubscriptionsApi.md#subscriptionslistsubscriptions) | **GET** /api/v1/subscriptions | List subscriptions |
| [**subscriptionsUpdateSubscription**](SubscriptionsApi.md#subscriptionsupdatesubscription) | **PATCH** /api/v1/subscriptions/{id} | Update subscription |



## subscriptionsCreateSubscription

> ModelsSubscriptionResponse subscriptionsCreateSubscription(modelsCreateSubscriptionRequest)

Create subscription

サブスクリプションを作成

### Example

```ts
import {
  Configuration,
  SubscriptionsApi,
} from '';
import type { SubscriptionsCreateSubscriptionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new SubscriptionsApi(config);

  const body = {
    // ModelsCreateSubscriptionRequest
    modelsCreateSubscriptionRequest: ...,
  } satisfies SubscriptionsCreateSubscriptionRequest;

  try {
    const data = await api.subscriptionsCreateSubscription(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **modelsCreateSubscriptionRequest** | [ModelsCreateSubscriptionRequest](ModelsCreateSubscriptionRequest.md) |  | |

### Return type

[**ModelsSubscriptionResponse**](ModelsSubscriptionResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The request has succeeded and a new resource has been created as a result. |  -  |
| **0** | An unexpected error response. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## subscriptionsDeleteSubscription

> subscriptionsDeleteSubscription(id)

Delete subscription

サブスクリプションを削除

### Example

```ts
import {
  Configuration,
  SubscriptionsApi,
} from '';
import type { SubscriptionsDeleteSubscriptionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new SubscriptionsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SubscriptionsDeleteSubscriptionRequest;

  try {
    const data = await api.subscriptionsDeleteSubscription(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | There is no content to send for this request, but the headers may be useful.  |  -  |
| **0** | An unexpected error response. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## subscriptionsDeleteSubscriptions

> subscriptionsDeleteSubscriptions(routesDeleteSubscriptionsRequest)

Delete multiple subscriptions

複数のサブスクリプションを削除

### Example

```ts
import {
  Configuration,
  SubscriptionsApi,
} from '';
import type { SubscriptionsDeleteSubscriptionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new SubscriptionsApi(config);

  const body = {
    // RoutesDeleteSubscriptionsRequest
    routesDeleteSubscriptionsRequest: ...,
  } satisfies SubscriptionsDeleteSubscriptionsRequest;

  try {
    const data = await api.subscriptionsDeleteSubscriptions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **routesDeleteSubscriptionsRequest** | [RoutesDeleteSubscriptionsRequest](RoutesDeleteSubscriptionsRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | There is no content to send for this request, but the headers may be useful.  |  -  |
| **0** | An unexpected error response. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## subscriptionsGetSubscription

> ModelsSubscriptionResponse subscriptionsGetSubscription(id)

Get subscription by ID

サブスクリプション詳細を取得

### Example

```ts
import {
  Configuration,
  SubscriptionsApi,
} from '';
import type { SubscriptionsGetSubscriptionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new SubscriptionsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SubscriptionsGetSubscriptionRequest;

  try {
    const data = await api.subscriptionsGetSubscription(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**ModelsSubscriptionResponse**](ModelsSubscriptionResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |
| **0** | An unexpected error response. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## subscriptionsListSubscriptions

> ModelsListSubscriptionsResponse subscriptionsListSubscriptions()

List subscriptions

サブスクリプション一覧を取得

### Example

```ts
import {
  Configuration,
  SubscriptionsApi,
} from '';
import type { SubscriptionsListSubscriptionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new SubscriptionsApi(config);

  try {
    const data = await api.subscriptionsListSubscriptions();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ModelsListSubscriptionsResponse**](ModelsListSubscriptionsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |
| **0** | An unexpected error response. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## subscriptionsUpdateSubscription

> ModelsSubscriptionResponse subscriptionsUpdateSubscription(id, modelsUpdateSubscriptionRequest)

Update subscription

サブスクリプションを更新

### Example

```ts
import {
  Configuration,
  SubscriptionsApi,
} from '';
import type { SubscriptionsUpdateSubscriptionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new SubscriptionsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // ModelsUpdateSubscriptionRequest
    modelsUpdateSubscriptionRequest: ...,
  } satisfies SubscriptionsUpdateSubscriptionRequest;

  try {
    const data = await api.subscriptionsUpdateSubscription(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **modelsUpdateSubscriptionRequest** | [ModelsUpdateSubscriptionRequest](ModelsUpdateSubscriptionRequest.md) |  | |

### Return type

[**ModelsSubscriptionResponse**](ModelsSubscriptionResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |
| **0** | An unexpected error response. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

