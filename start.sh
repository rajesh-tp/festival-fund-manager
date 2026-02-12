#!/bin/sh
set -e

# Run database migrations against the persistent volume
npx drizzle-kit migrate

# Start the Next.js standalone server
node server.js
