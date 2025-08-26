#!/bin/bash

curl --request POST \
     --url https://api.circle.com/v1/faucet/drips \
     --header 'Accept: application/json' \
     --header 'Authorization: Bearer TEST_API_KEY:0f632d8805089eb834086af613d23159:682e58f5955bc7ac87dcb78be45867f9' \
     --header 'Content-Type: application/json' \
     --data '{
       "address": "0x81f99A1397B8f60Aa2B75753ad2BF39F298b8b87",
       "blockchain": "ETH-SEPOLIA",
       "usdc": true
     }'
