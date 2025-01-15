#!/bin/bash

# Set the URL of the health endpoint
URL="http://localhost:8080/actuator/health"

# Perform the health check and capture the response status code
response=$(curl -s -o /dev/null -w "%{http_code}" $URL)

# Log the response code (could be useful for debugging)
echo "Health check response: $response"

# You can output a custom Prometheus-style metric (for example):
if [ "$response" -eq 200 ]; then
  echo "health_status{status=\"UP\"} 1"
else
  echo "health_status{status=\"DOWN\"} 0"
fi
