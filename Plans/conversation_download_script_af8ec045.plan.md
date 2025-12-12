---
name: Conversation Download Script
overview: Create a standalone Python script to download Intercom conversations by ID from a text file and save them as a single JSON file, following the existing codebase patterns for authentication, rate limiting, and error handling.
todos: []
---

# Conversation Download Script

## Overview

Create a standalone script that reads conversation IDs from a text file, fetches each conversation from the Intercom API, and saves all conversations to a single JSON file.

## Implementation Details

### File: `conversation_downloader.py`

The script will:

1. **Read conversation IDs** from a text file (one ID per line)
2. **Fetch conversations** using `GET /conversations/{id}` endpoint
3. **Handle rate limiting** using the same patterns as `Bulk_Close_Script.py`
4. **Retry logic** with exponential backoff for failed requests
5. **Save results** to a single JSON file with all conversations in an array
6. **Progress tracking** showing success/failure counts

### Key Features

- Uses environment variables for `INTERCOM_ACCESS_TOKEN` (same as existing scripts)
- Rate limit checking using `X-RateLimit-*` headers
- Retry logic with 429 (rate limit) handling
- Parallel processing option for faster downloads
- Error handling that continues processing even if some conversations fail
- Outputs a single JSON file: `conversations_export_<timestamp>.json`

### API Endpoint

Based on Intercom API documentation, use:

- `GET https://api.intercom.io/conversations/{conversation_id}`
- Headers: `Authorization: Bearer {token}`, `Accept: application/json`

### Usage

```bash
python conversation_downloader.py conversation_ids.txt
```

The script will:

1. Read IDs from `conversation_ids.txt`
2. Fetch each conversation
3. Save to `conversations_export_YYYYMMDD_HHMMSS.json`