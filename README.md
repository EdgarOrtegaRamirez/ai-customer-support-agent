# Go-WhatsApp on Cloudflare Containers

This project sets up a Cloudflare Worker to deploy the `aldinokemal2104/go-whatsapp-web-multidevice` Docker image to Cloudflare's serverless container platform. This allows you to run a WhatsApp REST API client on Cloudflare's global network.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **Node.js and npm**: You can download them from [nodejs.org](https://nodejs.org/).
2.  **Cloudflare Account**: You will need a Cloudflare account with the Workers Paid plan to use Containers.
3.  **Wrangler CLI**: This is the command-line tool for managing Cloudflare Workers. You can install it by running `npm install -g wrangler`. After installation, you need to configure it with your Cloudflare account by running `wrangler login`.

## Installation

1.  Clone this repository to your local machine.
2.  Install the project dependencies by running the following command in the project's root directory:
    ```bash
    npm install
    ```

## Deployment

To deploy the worker to your Cloudflare account, run the following command:

```bash
wrangler deploy
```

This command will package and deploy your worker and the container configuration to Cloudflare. After a successful deployment, wrangler will output the URL of your worker.

## Usage

The deployed worker uses a `sessionId` to manage different WhatsApp sessions. Each `sessionId` corresponds to a unique container instance, allowing you to run multiple WhatsApp clients simultaneously.

You must provide a `sessionId` as a query parameter in every request to the worker.

The URL for your worker will look like this:
`https://gowa-cloudflare-worker.<your-subdomain>.workers.dev`

To interact with the WhatsApp API, you append the API path to the URL, for example:

`https://gowa-cloudflare-worker.<your-subdomain>.workers.dev/send/message?sessionId=my-personal-account`

### Logging In

To log in to a new WhatsApp session, you need to scan a QR code.

1.  Construct the login URL by appending `/app/login` to your worker's URL and adding a `sessionId`:
    ```
    https://gowa-cloudflare-worker.<your-subdomain>.workers.dev/app/login?sessionId=my-new-session
    ```

2.  Open this URL in your web browser. You should see a QR code.

3.  Scan the QR code with your WhatsApp mobile app (in `Settings > Linked Devices > Link a Device`).

Once you have successfully scanned the QR code, your WhatsApp session will be active in the container. The session will persist for 60 minutes of inactivity, after which the container will be shut down to save resources. If the container is shut down, you will need to log in again.

### Sending a Message

To send a message, you make a `POST` request to the `/send/message` endpoint. For example, using `curl`:

```bash
curl -X POST \
  'https://gowa-cloudflare-worker.<your-subdomain>.workers.dev/send/message?sessionId=my-new-session' \
  -H 'Content-Type: application/json' \
  -d '{
    "jid": "6281234567890@s.whatsapp.net",
    "message": { "conversation": "Hello from Cloudflare!" }
  }'
```

For more information on the available API endpoints, please refer to the [go-whatsapp-web-multidevice documentation](https://github.com/aldinokemal/go-whatsapp-web-multidevice?tab=readme-ov-file#http-rest-api).
