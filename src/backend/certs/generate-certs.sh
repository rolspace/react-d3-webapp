#!/bin/bash

# Generate self-signed SSL certificate for local development
# This creates a certificate valid for 365 days

echo "Generating self-signed SSL certificate for localhost..."

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

echo "Certificate generated successfully!"
echo "Files created:"
echo "  - cert.pem (certificate)"
echo "  - key.pem (private key)"
echo ""
echo "For local development, you may need to trust this certificate in your browser/system."
