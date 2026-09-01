# Card Validation API Service

A lightweight, robust, and production-ready HTTP API endpoint for validating payment card numbers built with **Node.js**, **Express.js**, and **TypeScript** (configured with `"strict": true`).

---

## Table of Contents
- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [API Contract](#api-contract)
- [Validation Algorithm Details](#validation-algorithm-details)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Live Review Walkthrough Guide](#live-review-walkthrough-guide)

---

## Overview

This microservice exposes a single HTTP `POST` endpoint that accepts a credit/debit card number as input, sanitizes formatting artifacts (such as spaces or hyphens), validates string criteria, and applies the industry-standard **Luhn Algorithm (Modulus 10)** to verify mathematical card validity.

### Key Features
- **Strict TypeScript Compliance**: Compiles cleanly under TypeScript `"strict": true` mode.
- **Clean Architecture**: Decoupled design separating routing, controllers, request validation middleware, domain validation service, and error handling.
- **Graceful Error Handling**: Rejects missing fields, empty strings, invalid data types, and non-numeric characters with appropriate `400 Bad Request` status codes.
- **High Test Coverage**: Unit test suite for validation logic and HTTP integration test suite with `Supertest`.

---

## Architecture & Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (`"strict": true`)
- **Framework**: Express.js
- **Testing**: Jest + Supertest + `ts-jest`
- **Development Tooling**: `ts-node-dev` for live reloading

```
Client / HTTP Request
        │
        ▼
[ Global Error Handler & Body Parser ]
        │
        ▼
[ Validate Request Middleware ] ──(Invalid Payload)──> 400 Bad Request
        │
        ▼
[ Card Controller ]
        │
        ▼
[ Card Validator Service ] ──(Luhn Algorithm & Length Check)
        │
        ▼
[ HTTP 200 Response: { isValid: boolean } ]
```

---

## Project Structure

```
.
├── src/
│   ├── services/
│   │   └── card-validator.service.ts     # Core Luhn algorithm & length validation
│   ├── controllers/
│   │   └── card.controller.ts            # Translates HTTP requests to service calls
│   ├── middlewares/
│   │   ├── validate-request.middleware.ts   # Input payload presence & type checks
│   │   └── error-handler.middleware.ts      # Global uncaught exception & JSON syntax handler
│   ├── routes/
│   │   └── card.routes.ts                # Express route declarations
│   ├── app.ts                            # Express app setup (exported for testing)
│   └── server.ts                         # Application entry point (server listener)
├── tests/
│   ├── unit/
│   │   └── card-validator.service.spec.ts   # Unit tests for core algorithm & edge cases
│   └── integration/
│       └── card-validation.api.spec.ts      # End-to-end API HTTP tests using Supertest
├── tsconfig.json                         # TypeScript configuration (strict mode enabled)
├── package.json                          # Project dependencies and script definitions
├── README.md                             # Documentation & assessment guide
└── .gitignore                            # Git exclusion rules
```

---

## API Contract

### Endpoint: Validate Card Number
- **Method**: `POST`
- **Path**: `/api/v1/cards/validate`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "cardNumber": "4532-0151-1283-0366"
}
```

#### Responses

##### 1. Success Response (Card Checked) — `HTTP 200 OK`
Returned when the request payload is syntactically valid and the card number evaluation completes.

- **Valid Card Number**:
```json
{
  "isValid": true
}
```

- **Invalid Card Number** (failed Luhn checksum or invalid length):
```json
{
  "isValid": false
}
```

##### 2. Bad Request Response — `HTTP 400 Bad Request`
Returned when the payload is missing `cardNumber`, `cardNumber` is not a string, contains non-digit characters (other than spaces/dashes), or JSON payload is malformed.

```json
{
  "error": "Field 'cardNumber' is required and must be a string of digits."
}
```

---

## Validation Algorithm Details

The card validation pipeline follows four precise steps inside `CardValidatorService`:

1. **Sanitization**: Strips all whitespace (`\s`) and hyphens (`-`).
   - Example: `"4532 - 0151 - 1283 - 0366"` $\rightarrow$ `"4532015112830366"`
2. **Character Format Check**: Ensures the string contains strictly numeric digits (`/^\d+$/`). Any letters or symbols trigger immediate validation failure / bad input response.
3. **Length Check**: Verifies that total digit count is between **13** and **19** digits (matching standard payment card standards under ISO/IEC 7812).
4. **Luhn Algorithm Check (Modulus 10)**:
   - Traverses digits from right to left (starting from payload's final digit).
   - Doubles every second digit.
   - If doubling results in a number $> 9$, subtracts $9$ (e.g. $14 \rightarrow 5$).
   - Sums all modified and unmodified digits.
   - Card is valid if and only if `sum % 10 === 0`.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (installed with Node.js)

### Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd assessment
npm install
```

### Running local server
- **Development Mode** (with auto-reload):
  ```bash
  npm run dev
  ```
  The API will start at `http://localhost:3000`.

- **Production Build & Start**:
  ```bash
  npm run build
  npm start
  ```

---

## Testing

The project includes unit tests for the core validation logic and integration tests for the HTTP API endpoints using **Jest** and **Supertest**.

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run HTTP integration tests only
npm run test:integration

# Generate code coverage report
npm run test:coverage
```

---

## Design Decisions & Trade-offs

1. **Framework Choice (Express.js vs NestJS)**:
   - *Decision*: Express.js was chosen over NestJS.
   - *Rationale*: Express provides a lightweight, explicit, and transparent request-handling flow without reliance on heavy decorators or dynamic framework magic. This makes the code exceptionally easy to inspect, reason about, and explain line-by-line during live code review.

2. **Strict Mode TypeScript**:
   - *Decision*: Set `"strict": true` in `tsconfig.json`.
   - *Rationale*: Ensures full type safety, zero `any` usage, and explicit handling of nullability/undefined states across all parameters.

3. **HTTP Status Code Strategy**:
   - *Decision*: Return `200 OK` with `{ "isValid": boolean }` for evaluated cards; return `400 Bad Request` for malformed requests.
   - *Rationale*: Evaluated card check is a normal business output (not a server exception), so returning `200 OK` for invalid card numbers prevents artificial HTTP 4xx spikes in monitoring tools while keeping client consumption simple.

4. **Input Handling & Tolerance**:
   - *Decision*: Permit space and hyphen delimiters, but reject alphabetic or special characters.
   - *Rationale*: Real users often copy-paste formatted numbers with spaces or dashes. Stripping standard delimiters improves user experience without sacrificing security or precision.

---

## Live Review Walkthrough Guide

When presenting this codebase in a live review session:

1. **`src/services/card-validator.service.ts`**:
   - Walk through `validateCardNumber(rawCardNumber)` step-by-step: sanitization $\rightarrow$ digit check $\rightarrow$ length check $\rightarrow$ `checkLuhn(digits)`.
   - Highlight the loop invariant in `checkLuhn`: iterating backwards (`i = digits.length - 1`), toggling `shouldDouble`, handling numbers $> 9$ by subtracting $9$, and checking `sum % 10 === 0`.
2. **`src/middlewares/validate-request.middleware.ts`**:
   - Show how bad payloads (non-string, missing fields, empty strings) are intercepted before touching controller logic.
3. **`src/app.ts`**:
   - Explain how Express is configured and exported separately from `server.ts` so integration tests (`Supertest`) can execute in-memory without binding real TCP sockets.
