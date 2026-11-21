#!/usr/bin/env bash
echo "Starting CampusFix Platform on http://localhost:3000..."
cd "$(dirname "$0")"
node server/index.js
