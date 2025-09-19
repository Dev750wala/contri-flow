#!/bin/bash

for i in {1..999}
do
  echo "Request #$i"
curl 'https://cloud-api.coinbase.com/platform/projects/08644bfe-778b-48ad-91f4-62d8bb0251da/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/json' \
  -b 'cb_dm=7a41022f-9736-44e8-a03c-f38ff9f364cf; coinbase_device_id=deca3e2b-9af6-4616-bc5a-3f9561fb943f; advertising_sharing_allowed={%22value%22:true}; cm_default_preferences={%22region%22:%22DEFAULT%22%2C%22consent%22:[%22necessary%22%2C%22performance%22%2C%22functional%22%2C%22targeting%22]}; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYyOTg2NTcsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiY2EyNTg5Zjg0YTVmYzFhMmEwOGNiMjQ2Nzg4MTJiZWYiLCJleHAiOjE3NTg4OTA2NTcsImlhdCI6MTc1NjI5ODY1N30.; __cf_bm=uWt_3XE3plwFtoBFvnenTzDLQVcsqzHFdxx9Ha7S1RM-1758233156-1.0.1.1-7PPpIBvoP5XD4KLz6VokZZ0KhDJw4N3mWRFDCwpkYZRtIvmSj1.JzESQ.PEftGhYoYlfys3WjRRUDA7oBG4s1LDEYDJsjbwDBm_eN_tIQ20; _cfuvid=62d6DCll39UKFL.iqGeNJGsk7uciHi2DqW_fh3CgWhU-1758233156903-0.0.1.1-604800000; unified-oauth-state-cookie=WUTI33MESAKNALA5RZQ6ERFC4QVAKMG6OPS6KAWD2DS7LNP3SDMQ====; _iidt=nM8og8aNkcY61SG4EkuMC7mv1FF44ibTsoI7wl2YaPQJDiImyPxTQwTwtf2TWfg7Ppjdhv8eJs8BXyBThyLYFcp2czRd/p/weda6Cl4=; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; unified-session-manager-cookie=MTc1ODIzMzE2OHxpLWQ4dENoUHh4UXJSc1ZHdEdncWpvVFpiZzYxNWhwUkhoYlVSVngtbWptb05EeVo5RFY3aDJPcktNNUlCdlBCYUo0cGROd3RwSHFMM2ZuWXJXa1lUekQ0Y3lmSEZtTHNWZ3lWNXdVX2dzSjJDQ0E9fK9fcPdYTDIGMigMBel7eYx0ruTnNSwuSOj1rbCtxLlm' \
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
  --data-raw '{"network":"base-sepolia","address":"0x994248373CCD2baC2242b8c42BCee9B28d619bC2","token":"eth"}'

  sleep 0.5
done
