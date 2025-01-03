# Example Typescript Class Template

## example path:

`libs/{{library-name}}/src/lib/{{library-name}}.ts`

## example code:

```typescript
/**
 * @baudevs/{{library-name}}
 * {{library-description}}
 */

interface RequestTrackerOptions {
  endpoints?: Array<string | RegExp>;
  trackWebSocket?: boolean;
}

interface DataLayerEvent {
  event: string;
  [key: string]: any;
}

class {{ClassName}} {
  private endpoints: Array<string | RegExp>;
  private trackWebSocket: boolean;
  private isActive: boolean;

  private originalFetch: typeof fetch;
  private originalXHR: {
    open: typeof XMLHttpRequest.prototype.open;
    send: typeof XMLHttpRequest.prototype.send;
  };
  private originalWebSocket: typeof WebSocket;

  constructor(options: RequestTrackerOptions = {}) {
    this.endpoints = options.endpoints || [];
    this.trackWebSocket = options.trackWebSocket || false;
    this.isActive = false;

    // Store original methods
    this.originalFetch = window.fetch;
    this.originalXHR = {
      open: XMLHttpRequest.prototype.open,
      send: XMLHttpRequest.prototype.send,
    };
    this.originalWebSocket = window.WebSocket;

    // Bind methods to preserve 'this' context
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.addEndpoint = this.addEndpoint.bind(this);
    this.removeEndpoint = this.removeEndpoint.bind(this);
    this.listEndpoints = this.listEndpoints.bind(this);
  }

  /**
   * Activates the request interception.
   */
  public activate() {
    if (this.isActive) {
      console.warn('{{library-name}} is already active.');
      return;
    }

    this.patchFetch();
    this.patchXHR();
    if (this.trackWebSocket) {
      this.patchWebSocket();
    }

    this.isActive = true;
    console.log('>> {{library-name}} ACTIVATED <<');
  }

  /**
   * Deactivates the request interception and restores original methods.
   */
  public deactivate() {
    if (!this.isActive) {
      console.warn('{{library-name}} is not active.');
      return;
    }

    this.unpatchFetch();
    this.unpatchXHR();
    if (this.trackWebSocket) {
      this.unpatchWebSocket();
    }

    this.isActive = false;
    console.log('>> {{library-name}} DEACTIVATED <<');
  }

  /**
   * Adds a new endpoint pattern to monitor.
   * @param pattern - The endpoint pattern to add (string or RegExp).
   */
  public addEndpoint(pattern: string | RegExp) {
    if (typeof pattern !== 'string' && !(pattern instanceof RegExp)) {
      console.error('addEndpoint: Pattern must be a string or RegExp.');
      return;
    }
    this.endpoints.push(pattern);
    console.log('>> Endpoint Added:', pattern);
  }

  /**
   * Removes an existing endpoint pattern from monitoring.
   * @param pattern - The endpoint pattern to remove (string or RegExp).
   */
  public removeEndpoint(pattern: string | RegExp) {
    const index = this.endpoints.findIndex(existingPattern => {
      if (typeof pattern === 'string' && typeof existingPattern === 'string') {
        return existingPattern === pattern;
      } else if (pattern instanceof RegExp && existingPattern instanceof RegExp) {
        return existingPattern.toString() === pattern.toString();
      }
      return false;
    });

    if (index !== -1) {
      const removed = this.endpoints.splice(index, 1)[0];
      console.log('>> Endpoint Removed:', removed);
    } else {
      console.warn('removeEndpoint: Pattern not found:', pattern);
    }
  }

  /**
   * Lists all currently monitored endpoint patterns.
   */
  public listEndpoints() {
    console.log('>> Current Endpoints:', this.endpoints);
    return [...this.endpoints];
  }

  // Implement patchFetch, unpatchFetch, patchXHR, unpatchXHR, patchWebSocket, unpatchWebSocket methods here
}

export default {{ClassName}};
```

> ## Note: Replace placeholders like {{library-name}}, {{LibraryName}}, and {{ClassName}} with actual values relevant to your library
