# PaymentMethodsApi

All URIs are relative to *https://api.subsq-app.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**paymentMethodsCreatePaymentMethod**](PaymentMethodsApi.md#paymentmethodscreatepaymentmethod) | **POST** /api/v1/payment-methods | Create payment method |
| [**paymentMethodsDeletePaymentMethod**](PaymentMethodsApi.md#paymentmethodsdeletepaymentmethod) | **DELETE** /api/v1/payment-methods/{id} | Delete payment method |
| [**paymentMethodsDeletePaymentMethods**](PaymentMethodsApi.md#paymentmethodsdeletepaymentmethods) | **DELETE** /api/v1/payment-methods | Delete multiple payment methods |
| [**paymentMethodsGetPaymentMethod**](PaymentMethodsApi.md#paymentmethodsgetpaymentmethod) | **GET** /api/v1/payment-methods/{id} | Get payment method by ID |
| [**paymentMethodsListPaymentMethods**](PaymentMethodsApi.md#paymentmethodslistpaymentmethods) | **GET** /api/v1/payment-methods | List payment methods |
| [**paymentMethodsUpdatePaymentMethod**](PaymentMethodsApi.md#paymentmethodsupdatepaymentmethod) | **PATCH** /api/v1/payment-methods/{id} | Update payment method |



## paymentMethodsCreatePaymentMethod

> ModelsPaymentMethodResponse paymentMethodsCreatePaymentMethod(modelsCreatePaymentMethodRequest)

Create payment method

支払い方法を作成

### Example

```ts
import {
  Configuration,
  PaymentMethodsApi,
} from '';
import type { PaymentMethodsCreatePaymentMethodRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PaymentMethodsApi(config);

  const body = {
    // ModelsCreatePaymentMethodRequest
    modelsCreatePaymentMethodRequest: ...,
  } satisfies PaymentMethodsCreatePaymentMethodRequest;

  try {
    const data = await api.paymentMethodsCreatePaymentMethod(body);
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
| **modelsCreatePaymentMethodRequest** | [ModelsCreatePaymentMethodRequest](ModelsCreatePaymentMethodRequest.md) |  | |

### Return type

[**ModelsPaymentMethodResponse**](ModelsPaymentMethodResponse.md)

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


## paymentMethodsDeletePaymentMethod

> paymentMethodsDeletePaymentMethod(id)

Delete payment method

支払い方法を削除

### Example

```ts
import {
  Configuration,
  PaymentMethodsApi,
} from '';
import type { PaymentMethodsDeletePaymentMethodRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PaymentMethodsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies PaymentMethodsDeletePaymentMethodRequest;

  try {
    const data = await api.paymentMethodsDeletePaymentMethod(body);
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


## paymentMethodsDeletePaymentMethods

> paymentMethodsDeletePaymentMethods(routesDeletePaymentMethodsRequest)

Delete multiple payment methods

複数の支払い方法を削除

### Example

```ts
import {
  Configuration,
  PaymentMethodsApi,
} from '';
import type { PaymentMethodsDeletePaymentMethodsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PaymentMethodsApi(config);

  const body = {
    // RoutesDeletePaymentMethodsRequest
    routesDeletePaymentMethodsRequest: ...,
  } satisfies PaymentMethodsDeletePaymentMethodsRequest;

  try {
    const data = await api.paymentMethodsDeletePaymentMethods(body);
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
| **routesDeletePaymentMethodsRequest** | [RoutesDeletePaymentMethodsRequest](RoutesDeletePaymentMethodsRequest.md) |  | |

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


## paymentMethodsGetPaymentMethod

> ModelsPaymentMethodResponse paymentMethodsGetPaymentMethod(id)

Get payment method by ID

支払い方法詳細を取得

### Example

```ts
import {
  Configuration,
  PaymentMethodsApi,
} from '';
import type { PaymentMethodsGetPaymentMethodRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PaymentMethodsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies PaymentMethodsGetPaymentMethodRequest;

  try {
    const data = await api.paymentMethodsGetPaymentMethod(body);
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

[**ModelsPaymentMethodResponse**](ModelsPaymentMethodResponse.md)

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


## paymentMethodsListPaymentMethods

> Array&lt;ModelsPaymentMethodResponse&gt; paymentMethodsListPaymentMethods()

List payment methods

支払い方法一覧を取得

### Example

```ts
import {
  Configuration,
  PaymentMethodsApi,
} from '';
import type { PaymentMethodsListPaymentMethodsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PaymentMethodsApi(config);

  try {
    const data = await api.paymentMethodsListPaymentMethods();
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

[**Array&lt;ModelsPaymentMethodResponse&gt;**](ModelsPaymentMethodResponse.md)

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


## paymentMethodsUpdatePaymentMethod

> ModelsPaymentMethodResponse paymentMethodsUpdatePaymentMethod(id, modelsUpdatePaymentMethodRequest)

Update payment method

支払い方法を更新

### Example

```ts
import {
  Configuration,
  PaymentMethodsApi,
} from '';
import type { PaymentMethodsUpdatePaymentMethodRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new PaymentMethodsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // ModelsUpdatePaymentMethodRequest
    modelsUpdatePaymentMethodRequest: ...,
  } satisfies PaymentMethodsUpdatePaymentMethodRequest;

  try {
    const data = await api.paymentMethodsUpdatePaymentMethod(body);
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
| **modelsUpdatePaymentMethodRequest** | [ModelsUpdatePaymentMethodRequest](ModelsUpdatePaymentMethodRequest.md) |  | |

### Return type

[**ModelsPaymentMethodResponse**](ModelsPaymentMethodResponse.md)

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

