#!/bin/bash
if [ "$1" == "-h" ]; then
    echo "useage: ./build.sh [test]"
    exit 0
fi
if [ "$1" == "test" ]; then
    echo "Building package (testnet3)..."
    echo "NEXT_PUBLIC_BASE_PATH=/testnet3" > .env.production
    echo "NEXT_PUBLIC_API_URL=https://timelord.bhd.one/testnet3" >> .env.production
    npm run build
    docker build . -t bhdone/timelord-monitor-testnet3 && docker push bhdone/timelord-monitor-testnet3
else
    echo "Building package (mainnet)..."
    echo "NEXT_PUBLIC_BASE_PATH=" > .env.production
    echo "NEXT_PUBLIC_API_URL=https://timelord.bhd.one" >> .env.production
    npm run build
    docker build . -t bhdone/timelord-monitor && docker push bhdone/timelord-monitor
fi
