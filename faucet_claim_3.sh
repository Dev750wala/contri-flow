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
  -b 'cb_dm=7a41022f-9736-44e8-a03c-f38ff9f364cf; coinbase_device_id=deca3e2b-9af6-4616-bc5a-3f9561fb943f; advertising_sharing_allowed={%22value%22:true}; cm_default_preferences={%22region%22:%22DEFAULT%22%2C%22consent%22:[%22necessary%22%2C%22performance%22%2C%22functional%22%2C%22targeting%22]}; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYyOTg2NTcsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiY2EyNTg5Zjg0YTVmYzFhMmEwOGNiMjQ2Nzg4MTJiZWYiLCJleHAiOjE3NTg4OTA2NTcsImlhdCI6MTc1NjI5ODY1N30.; _cfuvid=ZkYbNiII_K_l4BgNzvzq1bM8cQIrrHqVQIcC2dxhlqM-1757102210180-0.0.1.1-604800000; __cf_bm=_cQYOYwa_GtyIh8ZDeS1UCPCrR1y2.Q8O9LdM2eFiAk-1757136290-1.0.1.1-uT252I70Gw4RXXbwyR23OTkaykf.EfR2wvh83bxFqdmVIEV0zTLgTXMd8QFVfXOfKicUNDmvfuXFZuClodp2172I.4.qHCf3uhSu0WWERqw; unified-oauth-state-cookie=RSLPFLJCB3A22IS5XTKM6DIL4QDOLFDZBOHLMV4POHXW76FHLL7A====; _iidt=owF+cnI8gp6w/7QgDQVse42AeWcGe6G3sirRv0ebkeHO8vdK+tlFuO2+e7p01rWxMi0ZxyYUpeaFe9uagQvnacUvNPhwx518qIRjVJE=; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; unified-session-manager-cookie=MTc1NzEzNjMxNHwyUnNJWnJ4M1FOMDVLOW1BWG5FR0p3VUNQWGd4b3RDYktCcVZ1dk5vZ0d6Yk5kOW1RSS1jWTNSdHhhUXdnZnAzQTFkbm4yR1dzUlpwWGlDMG0xOURGUXdFWW9BSXhlUGt3Zmx4aGwxV1V5WmIzS009fL1A9ayJIanfRPDNJs97E6BtKvCgn8pNM2_WMZmA2Kmb' \
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
  --data-raw '{"network":"base-sepolia","address":"0x994248373CCD2baC2242b8c42BCee9B28d619bC2","token":"eth"}'

  sleep 0.5
done
