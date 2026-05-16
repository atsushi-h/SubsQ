# UsersApi

All URIs are relative to *https://api.subsq-app.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**usersDeleteCurrentUser**](UsersApi.md#usersdeletecurrentuser) | **DELETE** /api/v1/users/me | Delete current user |
| [**usersGetCurrentUser**](UsersApi.md#usersgetcurrentuser) | **GET** /api/v1/users/me | Get current user |
| [**usersUpdateCurrentUser**](UsersApi.md#usersupdatecurrentuser) | **PATCH** /api/v1/users/me | Update current user |



## usersDeleteCurrentUser

> usersDeleteCurrentUser()

Delete current user

現在のユーザーを削除

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '';
import type { UsersDeleteCurrentUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UsersApi(config);

  try {
    const data = await api.usersDeleteCurrentUser();
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


## usersGetCurrentUser

> ModelsUserResponse usersGetCurrentUser()

Get current user

現在のユーザー情報を取得

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '';
import type { UsersGetCurrentUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UsersApi(config);

  try {
    const data = await api.usersGetCurrentUser();
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

[**ModelsUserResponse**](ModelsUserResponse.md)

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


## usersUpdateCurrentUser

> ModelsUserResponse usersUpdateCurrentUser(modelsUpdateUserRequest)

Update current user

現在のユーザープロフィールを更新（認証必須）

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '';
import type { UsersUpdateCurrentUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UsersApi(config);

  const body = {
    // ModelsUpdateUserRequest
    modelsUpdateUserRequest: ...,
  } satisfies UsersUpdateCurrentUserRequest;

  try {
    const data = await api.usersUpdateCurrentUser(body);
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
| **modelsUpdateUserRequest** | [ModelsUpdateUserRequest](ModelsUpdateUserRequest.md) |  | |

### Return type

[**ModelsUserResponse**](ModelsUserResponse.md)

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

