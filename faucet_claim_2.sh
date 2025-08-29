#!/bin/bash

for i in {1..1000}
do
  echo "Request #$i"
    curl 'https://cloud-api.coinbase.com/platform/projects/08644bfe-778b-48ad-91f4-62d8bb0251da/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/json' \
  -b 'cb_dm=7a41022f-9736-44e8-a03c-f38ff9f364cf; coinbase_device_id=deca3e2b-9af6-4616-bc5a-3f9561fb943f; advertising_sharing_allowed={%22value%22:true}; cm_default_preferences={%22region%22:%22DEFAULT%22%2C%22consent%22:[%22necessary%22%2C%22performance%22%2C%22functional%22%2C%22targeting%22]}; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYyOTg2NTcsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiY2EyNTg5Zjg0YTVmYzFhMmEwOGNiMjQ2Nzg4MTJiZWYiLCJleHAiOjE3NTg4OTA2NTcsImlhdCI6MTc1NjI5ODY1N30.; __cf_bm=_r2qsPLZ1SJcMeQPpNgP.WcGZH2BqcYMiezOSyQ2zQg-1756395228-1.0.1.1-ppk7LFIlmFciiBAmpP.YmAIGGD4pFi3CDHFfqanrF6WFCNp7dLtNZDeBjDfgeyGEApWwcFiuSGCtzqldry3sESzT9ijx60JWdIzPcM9yJpQ; _cfuvid=RoMbajSPldMIffZtQSKPz0Zj4bVlmWFYUF0l0QjXdKw-1756395228875-0.0.1.1-604800000; unified-oauth-state-cookie=HGB7NOGAQ22BW3J7WVNFEDUM2SNC3HT2ZMQYOWN2W3VLXSAC2S3A====; _iidt=Cjk0GBpMHfwXTW4mgIxNLCQbLa/qE3BbE3tkPD97fKiEE/m9ovYheW1XFTrZ4vTZGvFG1j2BE+DzqkaxQsSPSt6rjiyuuS4N1BvMlI4=; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; unified-session-manager-cookie=MTc1NjM5NTIzOHwyNFBwMS1tWlRDRXdnMU91RDlNaGFjdzAzOUNZQ2xzT1p0VXpnbXNockE4bXNueTUtazdOT2c1TVN1RWpyWkY3bUh1LVJETFNpTFhrVmlxdEZOQkFRQWlVdkptMDg1Zks2dThwMEZIUXAtVV9rUHM9fBRCpLUgQ769uL35oyhXyvIw9ZhqvDKnj9fjbd8pHZB_' \
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
