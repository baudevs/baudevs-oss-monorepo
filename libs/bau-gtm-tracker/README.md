# @baudevs/bau-gtm-tracker

A robust library to intercept Fetch, XHR, and WebSocket requests, push events to `dataLayer` for Google Tag Manager (GTM), and allow dynamic endpoint management.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Getting Started](#getting-started)
    - [Basic Usage](#basic-usage)
    - [Advanced Configuration](#advanced-configuration)
5. [API Reference](#api-reference)
    - [Class: `BauGtmTracker`](#class-baugtmtracker)
        - [Constructor](#constructor)
        - [Methods](#methods)
6. [Event Structure](#event-structure)
7. [Integration with Google Tag Manager](#integration-with-google-tag-manager)
    - [Installing the GTM Script to Capture Fetch Calls](#installing-the-gtm-script-to-capture-fetch-calls)
    - [Injecting the Library via GTM (No Code Changes)](#injecting-the-library-via-gtm-no-code-changes)
    - [Potential Drawbacks of Injecting with GTM](#potential-drawbacks-of-injecting-with-gtm)
8. [Examples](#examples)
    - [Intercepting Fetch Requests](#intercepting-fetch-requests)
    - [Handling XHR Requests](#handling-xhr-requests)
    - [Tracking WebSocket Connections](#tracking-websocket-connections)
    - [Dynamic Endpoint Management](#dynamic-endpoint-management)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)
11. [License](#license)
12. [Changelog](#changelog)
13. [Contact](#contact)
14. [Quick Start Example](#quick-start-example)

---

## Introduction

`@baudevs/bau-gtm-tracker` is a lightweight and efficient JavaScript library designed to monitor and intercept network requests within your web applications. By capturing Fetch, XMLHttpRequest (XHR), and WebSocket interactions, it seamlessly integrates with Google Tag Manager (GTM) to push relevant events to the `dataLayer`. This facilitates advanced analytics, user behavior tracking, and dynamic endpoint management without altering existing request logic.

---

## Features

- **Intercept Network Requests**: Monitor and intercept Fetch, XHR, and WebSocket requests.
- **Seamless GTM Integration**: Pushes structured events to GTM's `dataLayer` for enhanced analytics.
- **Dynamic Endpoint Management**: Add or remove endpoints dynamically based on runtime conditions.
- **Minimal Overhead**: Designed to be lightweight to ensure optimal performance.
- **Flexible Configuration**: Customize tracking behavior to suit diverse application needs.
- **TypeScript Support**: Provides type definitions for seamless integration in TypeScript projects.

---

## Installation

You can install `@baudevs/bau-gtm-tracker` using [pnpm](https://pnpm.io/), [npm](https://www.npmjs.com/), or [yarn](https://yarnpkg.com/).

### Using pnpm

```bash
pnpm add @baudevs/bau-gtm-tracker
```

### Using npm

```bash
npm install @baudevs/bau-gtm-tracker
```

### Using yarn

```bash
yarn add @baudevs/bau-gtm-tracker
```

### Using jsDelivr CDN

You can also include the library directly in your HTML using jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@baudevs/bau-gtm-tracker/dist/bau-gtm-tracker.umd.min.js"></script>
```

---

## Getting Started

### Basic Usage

1. **Import the Library**

   Import the `BauGtmTracker` class into your project.

   ```javascript
   import { BauGtmTracker } from '@baudevs/bau-gtm-tracker';
   ```

2. **Instantiate and Configure**

   Create an instance of `BauGtmTracker` with desired configuration options.

   ```javascript
   const tracker = new BauGtmTracker({
     endpoints: ['/api/products', '/api/cart'], // Endpoints to monitor
     trackWebSocket: true, // Enable WebSocket tracking
   });
   ```

3. **Activate Tracking**

   Start intercepting network requests.

   ```javascript
   tracker.activate();
   ```

4. **Push Events to GTM's dataLayer**

   Ensure that GTM is properly set up on your website to receive events from `dataLayer`.

### Advanced Configuration

Customize the tracker to suit your application's needs by providing additional options.

```javascript
const tracker = new BauGtmTracker({
  endpoints: ['/api/products', '/api/cart', /^\/api\/users\/\d+$/],
  trackWebSocket: true,
  onRequestDetected: (event) => {
    // Custom handling of detected requests
    console.log('Custom Handler:', event);
  },
  onRequestFailed: (event) => {
    // Custom handling of failed requests
    console.error('Custom Error Handler:', event);
  },
});
```

---

## API Reference

### Class: `BauGtmTracker`

A class responsible for intercepting network requests and pushing relevant events to GTM's `dataLayer`.

#### Constructor

```typescript
constructor(options?: RequestTrackerOptions)
```

##### Parameters

- `options` (optional): An object of type `RequestTrackerOptions` to configure the tracker.

##### `RequestTrackerOptions`

| Property          | Type                       | Default | Description                                                        |
| ----------------- | -------------------------- | ------- | ------------------------------------------------------------------ |
| `endpoints`       | `Array<string \| RegExp>`  | `[]`    | Array of endpoint patterns to monitor. Can be strings or regular expressions. |
| `trackWebSocket`  | `boolean`                  | `false` | Whether to track WebSocket connections.                           |
| `onRequestDetected` | `(event: DataLayerEvent) => void` | `null` | Callback invoked when a request is detected.                      |
| `onRequestFailed` | `(event: DataLayerEvent) => void` | `null` | Callback invoked when a request fails.                           |

#### Methods

##### `activate()`

Activates the request interception.

```typescript
public activate(): void
```

- **Description**: Overrides the native `fetch`, `XMLHttpRequest`, and optionally `WebSocket` methods to start intercepting network requests.
- **Usage**:

  ```javascript
  tracker.activate();
  ```

##### `deactivate()`

Deactivates the request interception and restores original methods.

```typescript
public deactivate(): void
```

- **Description**: Restores the original `fetch`, `XMLHttpRequest`, and `WebSocket` methods, stopping the interception of network requests.
- **Usage**:

  ```javascript
  tracker.deactivate();
  ```

##### `addEndpoint(pattern: string \| RegExp)`

Adds a new endpoint pattern to monitor.

```typescript
public addEndpoint(pattern: string \| RegExp): void
```

- **Parameters**:
  - `pattern`: A string or regular expression representing the endpoint to monitor.

- **Description**: Dynamically adds a new endpoint pattern to the tracker's monitoring list.

- **Usage**:

  ```javascript
  tracker.addEndpoint('/api/orders');
  // Or using a regular expression
  tracker.addEndpoint(/^\/api\/users\/\d+$/);
  ```

##### `removeEndpoint(pattern: string \| RegExp)`

Removes an existing endpoint pattern from monitoring.

```typescript
public removeEndpoint(pattern: string \| RegExp): void
```

- **Parameters**:
  - `pattern`: The string or regular expression pattern to remove.

- **Description**: Dynamically removes an endpoint pattern from the tracker's monitoring list.

- **Usage**:

  ```javascript
  tracker.removeEndpoint('/api/orders');
  // Or using a regular expression
  tracker.removeEndpoint(/^\/api\/users\/\d+$/);
  ```

##### `listEndpoints(): Array<string \| RegExp>`

Lists all currently monitored endpoint patterns.

```typescript
public listEndpoints(): Array<string \| RegExp>
```

- **Description**: Retrieves the current list of endpoint patterns being monitored by the tracker.

- **Returns**: An array of strings and/or regular expressions representing the monitored endpoints.

- **Usage**:

  ```javascript
  const endpoints = tracker.listEndpoints();
  console.log(endpoints);
  ```

---

## Event Structure

When a network request is intercepted, the tracker pushes structured events to GTM's `dataLayer`. Below is the structure of these events.

### `DataLayerEvent`

| Property          | Type                              | Description                                        |
| ----------------- | --------------------------------- | -------------------------------------------------- |
| `event`           | `'fetchRequestDetected' \| 'fetchRequestFailed' \| 'xhrRequestDetected' \| 'websocketConnectionDetected'` | The type of event being pushed.                    |
| `requestType`     | `'Fetch' \| 'XHR' \| 'WebSocket'` | The type of network request intercepted.           |
| `requestUrl`      | `string`                          | The URL of the network request.                    |
| `requestMethod`   | `string` (optional)               | The HTTP method used for the request (e.g., GET, POST). |
| `requestBody`     | `unknown` (optional)              | The body of the network request, if applicable.    |
| `responseStatus`  | `number` (optional)               | The HTTP status code of the response.              |
| `responseData`    | `unknown` (optional)              | The data returned in the response.                 |
| `error`           | `string` (optional)                | The error message, if the request failed.          |
| `protocols`       | `string[]` (optional)              | The protocols used in the WebSocket connection.    |
| `websocketUrl`    | `string` (optional)                | The URL of the WebSocket connection.               |
| `response`        | `string` (optional)                | The raw response text, if applicable.              |

---

## Integration with Google Tag Manager

To utilize the events pushed by `@baudevs/bau-gtm-tracker` in GTM, ensure that GTM is properly configured to listen to the `dataLayer` events.

### Step-by-Step Integration

1. **Include GTM in Your Website**

   Ensure that the GTM container snippet is included in your website's HTML, typically in the `<head>` section.

   ```html
   <!-- Google Tag Manager -->
   <script>
     (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
     new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
     j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
     'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
     })(window,document,'script','dataLayer','GTM-XXXXXX');
   </script>
   <!-- End Google Tag Manager -->
   ```

2. **Initialize `BauGtmTracker`**

   As outlined in the [Getting Started](#getting-started) section, instantiate and activate the tracker.

3. **Create GTM Triggers and Tags**

   In the GTM dashboard:

   - **Create Triggers**: Define triggers based on the custom events pushed to the `dataLayer` (e.g., `fetchRequestDetected`).

   - **Create Tags**: Associate tags with these triggers to send data to analytics platforms or perform other actions.

   **Example: Tracking Fetch Requests**

   - **Trigger Setup**:
     - **Trigger Type**: Custom Event
     - **Event Name**: `fetchRequestDetected`

   - **Tag Setup**:
     - **Tag Type**: Google Analytics: Universal Analytics (or GA4)
     - **Track Type**: Event
     - **Category**: `Fetch Request`
     - **Action**: `{{event.requestType}}`
     - **Label**: `{{event.requestUrl}}`

4. **Publish GTM Container**

   After setting up triggers and tags, publish the GTM container to make the changes live.

### Installing the GTM Script to Capture Fetch Calls

If you haven't already installed the GTM container script, follow these steps to ensure you capture all fetch calls detected by `@baudevs/bau-gtm-tracker`:

1. In GTM, locate your Container ID (e.g., GTM-XXXXXX).
2. Insert the GTM snippet in the <head> of every page in your application.
   - In a Next.js project, you can add this snippet in a custom _document.js (Next.js 13 or older) or use app/layout.js (Next.js 15+).
   - This ensures GTM loads on every page, so any event pushed to the dataLayer is captured globally.

3. Optionally, create a Custom Variable in GTM to capture the fetch URL or method:
   - Go to GTM → Variables → New → Data Layer Variable.
   - Set the variable name to, for example, "dlv.requestUrl" (with data layer variable name = "requestUrl") to capture the URL extracted by the tracker's events.
   - Repeat for "requestMethod" or any other property you need.

4. Create (or update) a Tag in GTM that fires on the custom events from the tracker (e.g., "fetchRequestDetected"). In the Tag configuration, you can reference the data layer variables you just created to include the URL, HTTP method, etc.

5. If you'd like this tag to fire on all pages, add the trigger to your new Tag or use a custom event trigger that is set to "All Custom Events" and filter by event name. For example:
   - Trigger Type: "Custom Event"
   - Event Name: "fetchRequestDetected"
   - Fire on: All Custom Events or "fetchRequestDetected" specifically

6. Once done, publish your changes in GTM. The script now captures all desired fetch URL calls, and the `@baudevs/bau-gtm-tracker` events will feed into your GTM setup.

### Injecting the Library via GTM (No Code Changes)

If you do not have direct access to the website's code or cannot install the library directly, you can still inject it through GTM:

1. Go to your GTM account and create a new Tag.
2. Choose "Custom HTML" as the Tag Type.
3. In the HTML field, insert the script tag for the UMD build of the tracker. For example:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/@baudevs/bau-gtm-tracker/dist/bau-gtm-tracker.umd.min.js"></script>
   <script>
     // (Optional) Immediately activate the tracker if needed.
     // Make sure dataLayer is defined.
     window.dataLayer = window.dataLayer || [];

     // Since we're in a GTM custom HTML context, we can define a global function to launch the tracker
     // or add a small snippet here. For instance:
     (function() {
       // If the UMD build defines a global "BauGtmTracker", you can create a new instance here:
       var tracker = new BauGtmTracker({
         endpoints: ['/api/products', '/api/cart'],
         trackWebSocket: true,
       });
       tracker.activate();
     })();
   </script>
   ```

4. Set a Trigger for this Tag (e.g., "All Pages") so that the library is injected on every page.
5. Save and publish your GTM container. Once published, the script will load on each page without requiring code-level access.

This approach allows non-developers (e.g., marketing or analytics teams) to deploy the tracker code on a website purely through GTM, bypassing the need for direct integration in the site's source code.

---

### Potential Drawbacks of Injecting with GTM

While injecting the `@baudevs/bau-gtm-tracker` library via GTM can be convenient (especially if you lack direct access to the site code), consider the following potential drawbacks and issues:

1. **Timing of Script Execution**

   - GTM scripts may load after the page or other scripts have started running. This can cause the library to miss early network requests that happen before GTM injection completes.
   - If users leave the page or navigate away quickly, some events may not get intercepted or pushed to the dataLayer.

2. **Reliance on a Third-Party Loader**

   - If GTM fails to load (ad blockers, network issues, etc.), the library won't be injected at all, leading to no tracking or event data collection.

3. **Missing or Partial Data for Rapid Navigations**

   - When users close the window or navigate away immediately after initiating a network request, there might not be enough time for the tracker to process and push relevant events to the `dataLayer`.
   - This can become more frequent if the GTM container or the library loads late in the page lifecycle.

4. **Potential for Conflicting Scripts**

   - In rare cases, other scripts injected through GTM might interfere with the patching of fetch, XHR, or WebSocket. This can cause unexpected behavior in your analytics.

5. **Fallback Behavior and Error Handling**

   - The library aims to fall back gracefully when errors occur during interception. For example, if a fetch request fails, it re-throws the original error, ensuring that your application handles it properly.
   - Similarly, if the library fails to push an event to the `dataLayer`, a warning is logged, and the original request is not affected.
   - By default, the library also ensures that if patching cannot occur (e.g., the script didn't load in time), the original fetch/XHR/WebSocket methods remain untouched.

These considerations don't necessarily prevent you from injecting via GTM, but keep them in mind if you require more robust data collection or guaranteed tracking for all page visits. If precise tracking of all requests is critical, installing and initializing `@baudevs/bau-gtm-tracker` directly in the site code is often more reliable.

---

## Examples

### Intercepting Fetch Requests

```javascript
import { BauGtmTracker } from '@baudevs/bau-gtm-tracker';

const tracker = new BauGtmTracker({
  endpoints: ['/api/products', '/api/cart'],
  trackWebSocket: false,
});

tracker.activate();

// Example Fetch Request
fetch('/api/products', {
  method: 'GET',
})
  .then(response => response.json())
  .then(data => console.log('Products:', data))
  .catch(error => console.error('Fetch Error:', error));
```

**Expected Behavior**:

- When the fetch request to `/api/products` is made, the tracker intercepts it.
- An event with `event: 'fetchRequestDetected'` is pushed to `dataLayer`.
- If the fetch fails, an event with `event: 'fetchRequestFailed'` is pushed.
- The library re-throws the original error so that your application's normal error handling can continue.

### Handling XHR Requests

```javascript
import { BauGtmTracker } from '@baudevs/bau-gtm-tracker';

const tracker = new BauGtmTracker({
  endpoints: ['/api/orders'],
  trackWebSocket: false,
});

tracker.activate();

// Example XHR Request
const xhr = new XMLHttpRequest();
xhr.open('POST', '/api/orders');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
  if (xhr.status === 200) {
    console.log('Order Placed:', xhr.responseText);
  } else {
    console.error('Order Error:', xhr.statusText);
  }
};
xhr.send(JSON.stringify({ productId: 123, quantity: 2 }));
```

**Expected Behavior**:

- The XHR request to `/api/orders` is intercepted.
- An event with `event: 'xhrRequestDetected'` is pushed to `dataLayer`.
- If the request fails, an event with `event: 'xhrRequestFailed'` could be pushed (if the error is caught in the patch), and the normal XHR behavior is preserved.

### Tracking WebSocket Connections

```javascript
import { BauGtmTracker } from '@baudevs/bau-gtm-tracker';

const tracker = new BauGtmTracker({
  endpoints: ['wss://socket.example.com'],
  trackWebSocket: true,
});

tracker.activate();

// Example WebSocket Connection
const socket = new WebSocket('wss://socket.example.com');

socket.onopen = () => {
  console.log('WebSocket Connection Established');
};

socket.onmessage = (event) => {
  console.log('WebSocket Message:', event.data);
};

socket.onerror = (error) => {
  console.error('WebSocket Error:', error);
};
```

**Expected Behavior**:

- The WebSocket connection to `wss://socket.example.com` is intercepted.
- An event with `event: 'websocketConnectionDetected'` is pushed to `dataLayer`.
- Any errors during the WebSocket connection trigger standard WebSocket error events, and the library does not block or alter these errors.

### Dynamic Endpoint Management

```javascript
import { BauGtmTracker } from '@baudevs/bau-gtm-tracker';

const tracker = new BauGtmTracker({
  endpoints: ['/api/products'],
  trackWebSocket: false,
});

tracker.activate();

// Dynamically Add an Endpoint
tracker.addEndpoint('/api/orders');

// Dynamically Remove an Endpoint
tracker.removeEndpoint('/api/products');

// List Current Endpoints
const currentEndpoints = tracker.listEndpoints();
console.log('Monitored Endpoints:', currentEndpoints);
```

**Expected Behavior**:

- The tracker initially monitors `/api/products`.
- After adding, it also monitors `/api/orders`.
- After removal, only `/api/orders` is monitored.
- The `listEndpoints` method returns the current list of monitored endpoints.

---

## Troubleshooting

### 1. **`TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation`**

**Cause**: Overriding the native `fetch` method with an arrow function disrupts the expected `this` context.

**Solution**:

- Replace arrow functions with function expressions.
- Ensure proper binding of `this` in overridden methods.

**Example Fix**:

```typescript
private patchFetch() {
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // ... interception logic ...
    return response;
  }.bind(this);
}
```

### 2. **Empty or Minimal Bundle Files**

**Cause**: Incorrect Rollup configuration leading to missing `input` property or improper module exports.

**Solution**:

- Ensure that the Rollup configuration includes the `input` property pointing to the correct entry file.
- Use named exports instead of default exports for compatibility with `export *`.

**Example Rollup Config Snippet**:

```javascript
module.exports = withNx({
  input: 'libs/bau-gtm-tracker/src/index.ts',
  // ... rest of the config ...
});
```

### 3. **Library Not Exposed Globally in Browser**

**Cause**: Incorrect UMD build configuration or missing global variable assignment.

**Solution**:

- Ensure that the UMD build has a `name` property defined.
- Expose the library correctly in the UMD build.

**Example Rollup UMD Output Configuration**:

```javascript
{
  file: 'dist/libs/@baudevs/bau-gtm-tracker/bau-gtm-tracker.umd.min.js',
  format: 'umd',
  name: 'BauGtmTracker',
  sourcemap: true,
  plugins: [terser()],
}
```

### 4. **Endpoints Not Being Monitored**

**Cause**: Endpoint patterns do not match the actual request URLs or endpoints are not correctly added.

**Solution**:

- Verify that the endpoint patterns provided match the request URLs.
- Use exact strings or properly formatted regular expressions.

**Example Endpoint Patterns**:

```javascript
endpoints: ['/api/products', /^\/api\/users\/\d+$/],
```

### 5. **`dataLayer` Not Receiving Events**

**Cause**: GTM is not properly set up or `dataLayer` is not defined before the tracker pushes events.

**Solution**:

- Ensure GTM container is correctly included in your website.
- Initialize `dataLayer` before activating the tracker.

**Example Initialization**:

```html
<script>
  window.dataLayer = window.dataLayer || [];
</script>
```

---

## Contributing

Contributions are welcome! To contribute to `@baudevs/bau-gtm-tracker`, please follow these steps:

1. **Fork the Repository**

   Click the "Fork" button at the top-right corner of the repository page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/bau-gtm-tracker.git
   cd bau-gtm-tracker
   ```

3. **Install Dependencies**

   ```bash
   pnpm install
   ```

4. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

5. **Make Your Changes**

   Implement your feature or fix bugs.

6. **Commit Your Changes**

   ```bash
   git commit -m "feat: add GTM injection pros/cons and fallback info to README"
   ```

7. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

8. **Open a Pull Request**

   Navigate to the original repository and open a pull request from your fork.

**Guidelines**:

- **Code Quality**: Ensure your code adheres to the project's coding standards and passes all tests.
- **Documentation**: Update or add documentation for any new features or changes.
- **Testing**: Include unit and integration tests for your changes.

---

## License

`@baudevs/bau-gtm-tracker` is released under the [MIT License](https://opensource.org/licenses/MIT).

---

## Changelog

All notable changes to this project will be documented in this file.

### [Unreleased]

### [1.0.0] - 2025-01-03

- Initial release.
- Intercept Fetch, XHR, and WebSocket requests.
- Push events to GTM's `dataLayer`.
- Dynamic endpoint management.
- TypeScript support with type definitions.

---

## Contact

For any questions, issues, or feature requests, please open an issue on the [GitHub repository](https://github.com/your-username/bau-gtm-tracker) or contact the maintainer at [your-email@example.com](mailto:your-email@example.com).

---

## Quick Start Example

Here's a quick example to get you started with `@baudevs/bau-gtm-tracker`.

### 1. Include the Library

Ensure you've installed the library via npm, pnpm, or yarn.

### 2. Initialize and Activate

```javascript
import { BauGtmTracker } from '@baudevs/bau-gtm-tracker';

// Initialize the tracker with desired configurations
const tracker = new BauGtmTracker({
  endpoints: ['/api/products', '/api/cart'],
  trackWebSocket: true,
});

// Activate the tracker to start intercepting requests
tracker.activate();
```

### 3. View Events in GTM

Configure GTM to listen for events pushed to `dataLayer` and set up corresponding tags and triggers to handle them.

---

## Production Behavior

When running in a production environment (CI/GitHub Actions), the library automatically optimizes console output:

- `console.log` and `console.debug` calls are removed for optimal performance
- Important tracking information via `console.info` is preserved
- Error and warning messages (`console.error`, `console.warn`) are maintained for debugging
- All console output is preserved in development environments

This ensures that your production builds are clean while maintaining necessary logging for tracking and debugging purposes.

---
