/**
 * SillyTavern HTTP Client
 * Manages the connection to the SillyTavern API and provides a structured interface.
 */

class SillyTavernClient {
    /**
     * @param {string} baseUrl - e.g. "http://127.0.0.1:8123"
     */
    constructor(baseUrl = 'http://127.0.0.1:8123') {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    /**
     * Internal request method
     */
    async _request(method, endpoint, payload = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (payload) {
            options.body = JSON.stringify(payload);
        }

        try {
            const response = await fetch(url, options);
            
            // Wait, for 204 No Content, body is empty
            if (response.status === 204) {
                return { success: true, status: response.status, data: null };
            }

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                return {
                    success: false,
                    status: response.status,
                    error: data || response.statusText
                };
            }

            return { success: true, status: response.status, data };
        } catch (error) {
            return {
                success: false,
                status: 0,
                error: error.message
            };
        }
    }

    /**
     * Performs a standard POST request (most ST endpoints use POST)
     */
    async post(endpoint, payload = {}) {
        return this._request('POST', endpoint, payload);
    }

    /**
     * Performs a standard GET request
     */
    async get(endpoint) {
        return this._request('GET', endpoint);
    }
}

module.exports = { SillyTavernClient };
