#!/bin/sh
set -e

mkdir -p /data/uploads/updates
chown -R nextjs:nodejs /data

# Volume ist root-owned; App und Migrate laufen als nextjs
exec gosu nextjs sh -c 'npx prisma migrate deploy && exec node server.js'
