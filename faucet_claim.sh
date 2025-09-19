#!/bin/bash

for i in {1..999}
do
  echo "Request #$i"
curl 'https://cloud-api.coinbase.com/platform/projects/d2725108-271b-4ff3-b002-de4fd8bd37cd/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/json' \
  -b 'cb_dm=1321281c-5912-40a8-8681-21ffc7f73de3; coinbase_device_id=cc1b6fee-7b6d-4c1f-a643-157e1a802826; advertising_sharing_allowed={%22value%22:true}; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYzOTU1NTYsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiMjI5OGEyMmU2Y2EwN2RkYjljMDFmMTJjOGE3MDhhNDciLCJleHAiOjE3NTg5ODc1NTYsImlhdCI6MTc1NjM5NTU1Nn0.; cm_default_preferences={%22region%22:%22DEFAULT%22%2C%22consent%22:[%22necessary%22%2C%22performance%22%2C%22functional%22%2C%22targeting%22]}; __cf_bm=j9zceMpljBt6DxVbn4k0Y.ONwBHEBz6.euOZ3Jvnu5M-1758233126-1.0.1.1-h1PQrMHnW8GBLoEC_JEvmOS6z58WrHQAoAg2httGapyUKIPGCHBqxb2k9uFnjU2oFxypODhqfidvNs16GmphsyhbemDk01.P2hkO44WpwbY; _cfuvid=dVCG1kt0_kVdfss3knxKVKghJrZS_WUK0TzVt4gn9kU-1758233126819-0.0.1.1-604800000; unified-oauth-state-cookie=WDENNPEOPAV7WZ4VPZYRJOXXDT6M3TBLKE3LXFETCTGIBN7G5NBQ====; _iidt=UXNxMPk0Xd03oXsmZev2PZo23K+ZtrUAumC+zkKLYClx1L0Rzog5rMi4QuZKjHivrpzS47ksbAdzs/ewWP8YBkouHsr9juf4tsCjjQs=; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; unified-session-manager-cookie=MTc1ODIzMzE3NnxVSkFWTnpwdVdRamhCb1RMUUk4LXRoSHlxTmJlbVZpRVdBcGFsMUdIUnRVUGViUkJ5WjNtaUJOdTc2czA5RUkyZzN6a2xZbXNZcllJWHNhWXBVVFdBcXpWU180TmE5cVRmbW1JOWo4dmRhQi1zMnM9fHNRKGkHzJSyfsGNTKCbyJ3uyM2ypS3dXUR8E-Odu9kG' \
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
  --data-raw '{"network":"base-sepolia","address":"0x0046872823D3f2793a33Ca59979d590F688f224C","token":"eth"}'

  sleep 0.5
done
