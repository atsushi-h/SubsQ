# AdminNotificationsApi

All URIs are relative to *https://api.subsq-app.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**adminNotificationsBroadcast**](AdminNotificationsApi.md#adminnotificationsbroadcast) | **POST** /api/v1/admin/notifications/broadcast | Broadcast push notification to all users |



## adminNotificationsBroadcast

> adminNotificationsBroadcast(modelsBroadcastRequest)

Broadcast push notification to all users

全ユーザーにPush通知を一斉配信する

### Example

```ts
import {
  Configuration,
  AdminNotificationsApi,
} from '';
import type { AdminNotificationsBroadcastRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth_
    apiKey: "YOUR API KEY",
  });
  const api = new AdminNotificationsApi(config);

  const body = {
    // ModelsBroadcastRequest
    modelsBroadcastRequest: ...,
  } satisfies AdminNotificationsBroadcastRequest;

  try {
    const data = await api.adminNotificationsBroadcast(body);
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
| **modelsBroadcastRequest** | [ModelsBroadcastRequest](ModelsBroadcastRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[ApiKeyAuth_](../README.md#ApiKeyAuth_)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | There is no content to send for this request, but the headers may be useful.  |  -  |
| **0** | An unexpected error response. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

