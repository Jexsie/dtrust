# Dtrust API Documentation

Complete API reference for the Dtrust asset verification platform.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require API key authentication. Include your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response (200 OK):**

```json
{
  "status": "ok",
  "message": "Dtrust API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Anchor a Document

Anchors a document to the Hedera Consensus Service (HCS).

**Endpoint:** `POST /api/v1/anchor`

**Authentication:** Required (API Key)

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description            |
| --------- | ---- | -------- | ---------------------- |
| document  | File | Yes      | The document to anchor |

**Request Example (cURL):**

```bash
curl -X POST http://localhost:3000/api/v1/anchor \
  -H "Authorization: Bearer your_api_key_here" \
  -F "document=@/path/to/document.pdf"
```

**Success Response (201 Created):**

```json
{
  "message": "Document anchored successfully.",
  "proof": {
    "documentHash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    "hederaTransactionId": "0.0.12345@1665891234.567891234",
    "consensusTimestamp": "1665891234.567891234"
  }
}
```

**Error Response (409 Conflict - Document Already Anchored):**

```json
{
  "error": "Conflict",
  "message": "This document has already been anchored.",
  "proof": {
    "documentHash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    "hederaTransactionId": "0.0.12345@1665891234.567891234",
    "consensusTimestamp": "1665891234.567891234",
    "anchoredAt": "2024-01-01T00:00:00.000Z",
    "anchoredByOrganizationId": "clxxx123456789"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

**Error Response (400 Bad Request - No File):**

```json
{
  "error": "Bad Request",
  "message": "No document file provided. Please upload a file using the \"document\" field."
}
```

**Error Response (503 Service Unavailable - Hedera Error):**

```json
{
  "error": "Service Unavailable",
  "message": "Failed to anchor document to Hedera network. Please try again later.",
  "details": "Error message details"
}
```

**Error Response (413 Payload Too Large):**

```json
{
  "error": "Payload Too Large",
  "message": "File size exceeds the maximum limit of 50MB"
}
```

---

### 3. Verify a Document

Verifies if a document has been anchored to the Hedera network.

**Endpoint:** `POST /api/v1/verify`

**Authentication:** Not required (public endpoint)

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description            |
| --------- | ---- | -------- | ---------------------- |
| document  | File | Yes      | The document to verify |

**Request Example (cURL):**

```bash
curl -X POST http://localhost:3000/api/v1/verify \
  -F "document=@/path/to/document.pdf"
```

**Success Response - Verified (200 OK):**

```json
{
  "status": "VERIFIED",
  "message": "This document is authentic and was anchored on the Hedera network.",
  "proof": {
    "documentHash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    "hederaTransactionId": "0.0.12345@1665891234.567891234",
    "consensusTimestamp": "1665891234.567891234",
    "anchoredByOrganizationId": "clxxx123456789",
    "anchoredAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Success Response - Not Verified (200 OK):**

> **Note:** Returns 200 OK (not 404) as per specification.

```json
{
  "status": "NOT_VERIFIED",
  "message": "This document has not been anchored and cannot be verified.",
  "proof": null
}
```

**Error Response (400 Bad Request - No File):**

```json
{
  "error": "Bad Request",
  "message": "No document file provided. Please upload a file using the \"document\" field."
}
```

**Error Response (413 Payload Too Large):**

```json
{
  "error": "Payload Too Large",
  "message": "File size exceeds the maximum limit of 50MB"
}
```

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": "Additional details (optional, in development mode)"
}
```

### Common HTTP Status Codes

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| 200         | Success                                      |
| 201         | Created (resource successfully created)      |
| 400         | Bad Request (invalid input)                  |
| 401         | Unauthorized (invalid or missing API key)    |
| 404         | Not Found (endpoint not found)               |
| 409         | Conflict (resource already exists)           |
| 413         | Payload Too Large (file too large)           |
| 500         | Internal Server Error                        |
| 503         | Service Unavailable (external service error) |

---

## Rate Limiting

Currently, there are no rate limits implemented. This may change in future versions.

---

## Best Practices

### 1. API Key Security

- Never commit API keys to version control
- Store API keys securely (e.g., in environment variables)
- Rotate API keys regularly
- Use HTTPS in production

### 2. File Uploads

- Maximum file size: 50MB
- All file types are supported
- Files are hashed (SHA-256) but not stored permanently

### 3. Error Handling

Always check the HTTP status code and parse the error response for details:

```javascript
try {
  const response = await fetch("http://localhost:3000/api/v1/anchor", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Error:", data.message);
    return;
  }

  console.log("Success:", data);
} catch (error) {
  console.error("Network error:", error);
}
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

async function anchorDocument(filePath, apiKey) {
  const formData = new FormData();
  formData.append("document", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/anchor",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log("Document anchored:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
}

async function verifyDocument(filePath) {
  const formData = new FormData();
  formData.append("document", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/verify",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    console.log("Verification result:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
}
```

### Python

```python
import requests

def anchor_document(file_path, api_key):
    url = 'http://localhost:3000/api/v1/anchor'
    headers = {'Authorization': f'Bearer {api_key}'}

    with open(file_path, 'rb') as file:
        files = {'document': file}
        response = requests.post(url, headers=headers, files=files)

    if response.status_code == 201:
        print('Document anchored:', response.json())
        return response.json()
    else:
        print('Error:', response.json())
        raise Exception(response.json()['message'])

def verify_document(file_path):
    url = 'http://localhost:3000/api/v1/verify'

    with open(file_path, 'rb') as file:
        files = {'document': file}
        response = requests.post(url, files=files)

    result = response.json()
    print(f"Status: {result['status']}")
    return result
```

---

## Webhook Support

Webhook support is not currently implemented but may be added in future versions to notify organizations when their anchored documents are verified by third parties.

---

## Changelog

### Version 1.0.0 (Current)

- Initial release
- Document anchoring to Hedera HCS
- Public document verification
- API key authentication
- Support for all file types (up to 50MB)

---

## Support

For issues, questions, or feature requests, please contact the development team or open an issue in the project repository.
