/* eslint-disable @typescript-eslint/no-this-alias */
// libs/bau-gtm-tracker/src/lib/bau-gtm-tracker.ts

/**
 * @baudevs/bau-gtm-tracker
 * A robust library to intercept Fetch, XHR, and WebSocket requests,
 * push events to dataLayer for GTM, and allow dynamic endpoint management.
 */

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export interface RequestTrackerOptions {
  endpoints?: Array<string | RegExp>;
  trackWebSocket?: boolean;
}

export interface DataLayerEvent {
  event: 'fetchRequestDetected' | 'fetchRequestFailed' | 'xhrRequestDetected' | 'websocketConnectionDetected';
  requestType: 'Fetch' | 'XHR' | 'WebSocket';
  requestUrl: string;
  requestMethod?: string;
  requestBody?: unknown;
  responseStatus?: number;
  responseData?: unknown;
  error?: string;
  protocols?: string[];
  websocketUrl?: string;
  response?: string;
}

export interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _bauGtmTracker_url?: string;
  _bauGtmTracker_method?: string;
}

export class BauGtmTracker {
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
      console.warn('bau-gtm-tracker is already active.');
      return;
    }

    this.patchFetch();
    this.patchXHR();
    if (this.trackWebSocket) {
      this.patchWebSocket();
    }

    this.isActive = true;
    console.info('>> bau-gtm-tracker ACTIVATED <<');
  }

  /**
   * Deactivates the request interception and restores original methods.
   */
  public deactivate() {
    if (!this.isActive) {
      console.warn('bau-gtm-tracker is not active.');
      return;
    }

    this.unpatchFetch();
    this.unpatchXHR();
    if (this.trackWebSocket) {
      this.unpatchWebSocket();
    }

    this.isActive = false;
    console.info('>> bau-gtm-tracker DEACTIVATED <<');
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
    console.info('>> Endpoint Added:', pattern);
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
      console.info('>> Endpoint Removed:', removed);
    } else {
      console.warn('removeEndpoint: Pattern not found:', pattern);
    }
  }

  /**
   * Lists all currently monitored endpoint patterns.
   */
  public listEndpoints() {
    console.info('>> Current Endpoints:', this.endpoints);
    return [...this.endpoints];
  }

  /**
   * Patches the Fetch API to intercept requests.
   */
  private patchFetch() {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const requestBody = init?.body || null;
      console.log('>> requestUrl', requestUrl);

      let response: Response;
      try {
        response = await this.originalFetch.call(window, input, init);
      } catch (error: unknown) {
        if (this.matchesEndpoint(requestUrl)) {
          this.pushToDataLayer({
            event: 'fetchRequestFailed',
            requestType: 'Fetch',
            requestUrl,
            requestBody,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          console.error('[Fetch Intercept] Request failed:', requestUrl, error);
        }
        throw error;
      }

      try {
        if (this.matchesEndpoint(requestUrl)) {
          console.log("--------------------------------DEBUG START--------------------------------")
          console.log("--------------------------------requestUrl--------------------------------")
          console.log(requestUrl)
          console.log("--------------------------------response--------------------------------")
          console.log(response);
          console.log("--------------------------------response.body--------------------------------")
          console.log(response.body)
          const clonedResponse = response.clone();
          console.log("--------------------------------clonedResponse--------------------------------")
          console.log(clonedResponse.body)
          console.log("--------------------------------dataLayer--------------------------------")
          console.log(window.dataLayer)
          let responseData: unknown;
          const contentType = clonedResponse.headers.get('content-type');

          if (contentType && contentType.includes('application/json')) {
            responseData = await clonedResponse.json();
          } else {
            responseData = await clonedResponse.text();
          }
          console.log("--------------------------------responseData--------------------------------")
          console.log(responseData)
          this.pushToDataLayer({
            event: 'fetchRequestDetected',
            requestType: 'Fetch',
            requestUrl,
            requestBody,
            responseStatus: response.status,
            responseData,
          });
          console.log("--------------------------------dataLayer--------------------------------")
          console.log(window.dataLayer)
          console.log('[Fetch Intercept] Request detected:', requestUrl, requestBody);
          console.log("--------------------------------DEBUG END--------------------------------")
          console.info('[Fetch Intercept] Request detected:', requestUrl);
        }
      } catch (error) {
        console.warn('[Fetch Intercept Processing Error]', error);
      }

      return response;
    };
  }

  /**
   * Restores the original Fetch API.
   */
  private unpatchFetch() {
    window.fetch = this.originalFetch;
  }

  /**
   * Patches the XMLHttpRequest to intercept requests.
   */
  private patchXHR() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const tracker = this;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      this: ExtendedXMLHttpRequest,
      method: string,
      url: string,
      async = true,
      user?: string | null,
      password?: string | null
    ) {
      this._bauGtmTracker_url = url;
      this._bauGtmTracker_method = method;
      return originalOpen.apply(this, [method, url, async as boolean, user, password]);
    };

    XMLHttpRequest.prototype.send = function(this: ExtendedXMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
      this.addEventListener('loadend', () => {
        try {
          if (this._bauGtmTracker_url && tracker.matchesEndpoint(this._bauGtmTracker_url)) {
            tracker.pushToDataLayer({
              event: 'xhrRequestDetected',
              requestType: 'XHR',
              requestUrl: this._bauGtmTracker_url,
              requestMethod: this._bauGtmTracker_method || 'UNKNOWN',
              requestBody: body || '',
              responseStatus: this.status,
              response: this.responseText || '',
            });
            console.info('[XHR Intercept] Request detected:', this._bauGtmTracker_url);
          }
        } catch (error) {
          console.error('[XHR Intercept Error]', error);
        }
      });

      return originalSend.apply(this, [body]);
    };
  }

  /**
   * Restores the original XMLHttpRequest methods.
   */
  private unpatchXHR() {
    XMLHttpRequest.prototype.open = this.originalXHR.open;
    XMLHttpRequest.prototype.send = this.originalXHR.send;
  }

  /**
   * Patches the WebSocket constructor to intercept connections.
   */
  private patchWebSocket() {
    const originalWebSocket = this.originalWebSocket;
    const tracker = this;

    window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
      if (tracker.matchesEndpoint(url.toString())) {
        tracker.pushToDataLayer({
          event: 'websocketConnectionDetected',
          requestType: 'WebSocket',
          requestUrl: url.toString(),
          websocketUrl: url.toString(),
          protocols: Array.isArray(protocols) ? protocols : protocols ? [protocols] : [],
        });
        console.info('[WebSocket Intercept] Connection detected:', url);
      }
      return new originalWebSocket(url, protocols);
    } as unknown as typeof WebSocket;

    window.WebSocket.prototype = originalWebSocket.prototype;
  }

  /**
   * Restores the original WebSocket constructor.
   */
  private unpatchWebSocket() {
    window.WebSocket = this.originalWebSocket;
  }

  /**
   * Checks if the given URL matches any monitored endpoint.
   * @param url - The URL to check.
   * @returns {boolean} - True if matched, else false.
   */
  private matchesEndpoint(url: string): boolean {
    return this.endpoints.some(pattern => {
      if (typeof pattern === 'string') {
        return url.includes(pattern);
      } else if (pattern instanceof RegExp) {
        return pattern.test(url);
      }
      return false;
    });
  }

  /**
   * Pushes an event object to the dataLayer.
   * @param eventObj - The event object to push.
   */
  private pushToDataLayer(eventObj: DataLayerEvent) {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(eventObj);
    } else {
      console.warn('dataLayer is not defined or not an array.');
    }
  }
}

export default BauGtmTracker;
