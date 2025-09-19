#!/bin/bash

for i in {1..999}
do
  echo "Request #$i"
curl 'https://cloud-api.coinbase.com/platform/projects/3f291a53-9ca1-45e7-a7e7-4ecb4b6a71ae/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7,gu;q=0.6,hi;q=0.5' \
  -H 'content-type: application/json' \
  -b 'coinbase_device_id=5502f0f0-bde1-48c9-a863-003132535d0d; cb_dm=27dd40b7-049d-45ef-a93d-6a830adc3715; advertising_sharing_allowed={%22value%22:true}; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYzOTUwODIsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiOTRkMzU1NTAwZDIzMTgyY2M5Yzg2MDEyN2I3NTA3MTciLCJleHAiOjE3NTg5ODcwODIsImlhdCI6MTc1NjM5NTA4Mn0.; __cf_bm=a.eIGb4wbil_X45h9NHzy0VQ7dVdorLau1AdWnluY9w-1758233117-1.0.1.1-v1SDuimniuZ.fPFSX9epj.fd67zZf3qail5u_Y5F0ykTwvwA30w3lg9f0tvLXf03HgBnS14PJohgKuX8iJF_KKnSo9qoKR_79eFP42rLSuU; _cfuvid=aFcWk9OZDCcgiiNyzWOwSM6Q_Wvlf_o7L5tIHgyQn2w-1758233117682-0.0.1.1-604800000; unified-oauth-state-cookie=NYVPBP5IGZAWI5YEWKOXEDFD64PDEF2DOUWN25W5VYEKHOSLGACA====; _iidt=LQQ1KDJyq5NW+/vxD/VnCnNZQ3WD+uZ7nIa/r2umMi6ZcOlDE489yc3kOztQutlu1CJ2oMpX33Hyl9pNpPuNwjdssFwYzOnM8I+h0Os=; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; unified-session-manager-cookie=MTc1ODIzMzEzOHw1cklGQnlZYk04akdaeDZXWER6NEJrVXZlS3JVQjNQOUdDVDJ2d2VWWUdjbEczQzBxbG1kdWFQRWFMdl81TEM4UEVibEN0RF9ib1VjN3YtdlItbjdzNjRHMERuMWtoSDdVUDJfZ0hEdTdtc0RNVnM9fKr0UVuMUBx4SMHu_Nq9jZ9Ybl2FYHeHdEM_KMVKUr18' \
  -H 'origin: https://portal.cdp.coinbase.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://portal.cdp.coinbase.com/' \
  -H 'sec-ch-ua: "Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-site' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \
  --data-raw '{"network":"base-sepolia","address":"0x81f99A1397B8f60Aa2B75753ad2BF39F298b8b87","token":"eth"}'

  sleep 0.5
done
