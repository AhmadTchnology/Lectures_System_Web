# LMS Chat Backend Server

A simple Node.js/Express proxy server that handles communication between the LMS frontend and the n8n AI workflow.

## Setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your actual n8n webhook URL
   ```

3. Start the server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

## Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Proxy chat messages to n8n

## Deployment

This server should be deployed on the same server as your n8n instance to avoid CORS issues and minimize latency.

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t lms-chat-server .
   ```

2. Run the container:
   ```bash
   docker run -d \
     --name lms-chat-server \
     -p 3000:3000 \
     -e PORT=3000 \
     -e N8N_WEBHOOK_URL=https://your-n8n-server/webhook/lms-chat-model \
     -e ALLOWED_ORIGINS=https://your-frontend-domain.com \
     lms-chat-server
   ```

### Docker Compose (Optional)

Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  lms-chat-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - N8N_WEBHOOK_URL=https://your-n8n-server/webhook/lms-chat-model
      - ALLOWED_ORIGINS=https://your-frontend-domain.com
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```
