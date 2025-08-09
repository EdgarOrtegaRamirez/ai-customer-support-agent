import { Container, getContainer } from "@cloudflare/containers";

/**
 * GowaContainer class defines the properties of our container.
 * It extends the base Container class from @cloudflare/containers.
 */
export class GowaContainer extends Container {
  // The port the container application listens on. The go-whatsapp-web-multidevice
  // app listens on port 3000 by default.
  defaultPort = 3000;

  // This setting determines how long a container instance will remain running
  // after the last request has been served. For a stateful application like
  // a WhatsApp client, we want to keep the session alive for a reasonable
  // amount of time to avoid having to re-authenticate frequently. Here, we set
  // it to 60 minutes. After this period of inactivity, the container will be
  // terminated to save resources.
  sleepAfter = "60m";
}

export default {
  /**
   * The fetch handler is the entry point for all requests to the Worker.
   * @param {Request} request - The incoming request.
   * @param {object} env - The environment variables and bindings for the Worker.
   * @returns {Promise<Response>} - The response to be sent back to the client.
   */
  async fetch(request, env) {
    // This implementation uses a session ID to manage multiple container instances.
    // Each session ID corresponds to a unique, isolated container instance, allowing
    // for multiple WhatsApp accounts to be connected simultaneously. The session ID
    // is expected to be passed as a URL query parameter, for example:
    // https://your-worker.your-subdomain.workers.dev?sessionId=my-whatsapp-session
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return new Response(
        "A 'sessionId' query parameter is required to identify the container instance.",
        { status: 400 }
      );
    }

    // `getContainer` retrieves or creates a container instance associated with the
    // given session ID. The first argument, `env.GOWA_CONTAINER`, is the binding
    // to our container configuration in `wrangler.toml`.
    const containerInstance = getContainer(env.GOWA_CONTAINER, sessionId);

    // The `fetch` method on the container instance forwards the incoming request
    // to the application running inside the container on its `defaultPort`.
    // The response from the container application is then returned to the client.
    return containerInstance.fetch(request);
  },
};
