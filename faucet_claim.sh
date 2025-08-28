#!/bin/bash

# curl --request POST \
#      --url https://api.circle.com/v1/faucet/drips \
#      --header 'Accept: application/json' \
#      --header 'Authorization: Bearer TEST_API_KEY:0f632d8805089eb834086af613d23159:682e58f5955bc7ac87dcb78be45867f9' \
#      --header 'Content-Type: application/json' \
#      --data '{
#        "address": "0x81f99A1397B8f60Aa2B75753ad2BF39F298b8b87",
#        "blockchain": "ETH-SEPOLIA",
#        "usdc": true
#      }'


#!/bin/bash

for i in {1..1000}
do
  echo "Request #$i"
curl 'https://cloud-api.coinbase.com/platform/projects/08644bfe-778b-48ad-91f4-62d8bb0251da/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/json' \
  -b 'cb_dm=7a41022f-9736-44e8-a03c-f38ff9f364cf; _cfuvid=D.tErPUFjOSpvZ5J9O.3QMASIUFYlt.dMXJIzBHeTNo-1756298514294-0.0.1.1-604800000; _iidt=XTK2CHpRE7zFNNyKySBYL0bTcVJmCUCWgUyZb9mPe6sKCoKTWkkjxziey4+Zt4oI9wSBm+NoFeTrUUB4tm5ZwR5mb8lR6fySyeeTAQ==; oauth-locker=unified-access-4e612ee85bc53bcfca7c3398a7beaf9676bbde4d6d848135af99d3e90d79c3d7; arkdv=29c0f055b4a643688ad74c39359af68c8367ab26ee2ea4586772849aae78d4de; __cf_bm=PdD14hjlQRxMUqkWe_6c5L8l0qxtPSz4es6BGc2lfQk-1756298587-1.0.1.1-YGW4vwWaDnszNlGx.LRILqbKLg9pOcVc9JvpnflSwOiZ4Nc4aIuSVuaabpP6P0a3AcKH5h8TEeGoq4A4WyUJOtSR0TAaQkVUFKS0xtvRBfJjgeVo948YHlEuMe2bOUO7; coinbase_device_id=deca3e2b-9af6-4616-bc5a-3f9561fb943f; advertising_sharing_allowed={%22value%22:true}; cm_default_preferences={%22region%22:%22DEFAULT%22%2C%22consent%22:[%22necessary%22%2C%22performance%22%2C%22functional%22%2C%22targeting%22]}; unified-oauth-state-cookie=4MV7ILTMHODY5TPCCRRQXJHNHPWOQQ4TMDDRLK3XL7QPR4KHP4QA====; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYyOTg2NTcsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiY2EyNTg5Zjg0YTVmYzFhMmEwOGNiMjQ2Nzg4MTJiZWYiLCJleHAiOjE3NTg4OTA2NTcsImlhdCI6MTc1NjI5ODY1N30.; unified-session-manager-cookie=MTc1NjI5ODY1OHxYajIzTGh0V0NtV0tJVVVQVnR5Yk5tSnRsTV9yRnVNVVdmNEZYQVp5NDBna2FHTG8tR3ZhbXYxQVRaR2Z3Q01NZnVlb3VlUFFEbTNoWG5feE1NcnZqOG1CZmh4dnhYRW8wckxUekd5NHhxM2J5Q1E9fIXMLlzas6Ekc0-57oX9EKrL5fG8XvKxYHNypScTbo32' \
  -H 'origin: https://portal.cdp.coinbase.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://portal.cdp.coinbase.com/' \
  -H 'sec-ch-ua: "Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-site' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36' \
  --data-raw '{"network":"base-sepolia","address":"0x1042B31265643F113C92d6583d1237F453b8844D","token":"eth"}'

  sleep 0.5
done
