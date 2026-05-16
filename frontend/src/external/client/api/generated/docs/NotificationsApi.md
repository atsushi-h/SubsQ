# NotificationsApi

All URIs are relative to *https://api.subsq-app.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**notificationsListMySubscriptions**](NotificationsApi.md#notificationslistmysubscriptions) | **GET** /api/v1/notifications/subscriptions/me | List my push subscriptions |
| [**notificationsSendTest**](NotificationsApi.md#notificationssendtest) | **POST** /api/v1/notifications/test | Send test notification |
| [**notificationsSubscribe**](NotificationsApi.md#notificationssubscribe) | **POST** /api/v1/notifications/subscriptions | Subscribe to push notifications |
| [**notificationsUnsubscribe**](NotificationsApi.md#notificationsunsubscribe) | **DELETE** /api/v1/notifications/subscriptions | Unsubscribe from push notifications |



## notificationsListMySubscriptions

> ModelsListPushSubscriptionsResponse notificationsListMySubscriptions()

List my push subscriptions

自分のPush購読一覧を取得する

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { NotificationsListMySubscriptionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new NotificationsApi(config);

  try {
    const data = await api.notificationsListMySubscriptions();
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

[**ModelsListPushSubscriptionsResponse**](ModelsListPushSubscriptionsResponse.md)

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


## notificationsSendTest

> notificationsSendTest()

Send test notification

自分宛にテスト通知を送信する

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { NotificationsSendTestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new NotificationsApi(config);

  try {
    const data = await api.notificationsSendTest();
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


## notificationsSubscribe

> ModelsPushSubscriptionResponse notificationsSubscribe(modelsSubscribePushRequest)

Subscribe to push notifications

Push購読を登録する

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { NotificationsSubscribeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new NotificationsApi(config);

  const body = {
    // ModelsSubscribePushRequest
    modelsSubscribePushRequest: ...,
  } satisfies NotificationsSubscribeRequest;

  try {
    const data = await api.notificationsSubscribe(body);
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
| **modelsSubscribePushRequest** | [ModelsSubscribePushRequest](ModelsSubscribePushRequest.md) |  | |

### Return type

[**ModelsPushSubscriptionResponse**](ModelsPushSubscriptionResponse.md)

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


## notificationsUnsubscribe

> notificationsUnsubscribe(modelsUnsubscribePushRequest)

Unsubscribe from push notifications

Push購読を解除する

### Example

```ts
import {
  Configuration,
  NotificationsApi,
} from '';
import type { NotificationsUnsubscribeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new NotificationsApi(config);

  const body = {
    // ModelsUnsubscribePushRequest
    modelsUnsubscribePushRequest: ...,
  } satisfies NotificationsUnsubscribeRequest;

  try {
    const data = await api.notificationsUnsubscribe(body);
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
| **modelsUnsubscribePushRequest** | [ModelsUnsubscribePushRequest](ModelsUnsubscribePushRequest.md) |  | |

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

