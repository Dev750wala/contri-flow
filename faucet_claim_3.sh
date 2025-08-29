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
curl 'https://cloud-api.coinbase.com/platform/projects/d2725108-271b-4ff3-b002-de4fd8bd37cd/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/json' \
  -b 'cb_dm=1321281c-5912-40a8-8681-21ffc7f73de3; coinbase_device_id=cc1b6fee-7b6d-4c1f-a643-157e1a802826; advertising_sharing_allowed={%22value%22:true}; __cf_bm=o_11SN9y1mqa2ADcMhgoRp77VeYThezSneKc2Ma4pPM-1756395379-1.0.1.1-2u0B7k7_tq7vLFnY.fcD4_jj2reG9D2jIlASEgau1juQPdX6acH745h2oeIM.wyLkWTBUQI1wvfbQn4hiUOO1OMjyLG7rHGVVfjGMZK7Fu0; _cfuvid=vEvAQq5o7hseX.FgUGzwZx6U1ODrZvmo8osOL3xPwKA-1756395379650-0.0.1.1-604800000; _iidt=x3/Xd+IdI6TOXgf2ZF2Vvfq4tELKLvvWqWfwI99k1fmb0WHXwbbtwerbQx7lqqzPDUNJENxAIU6kDIyo2qa8kXM1UUtrmFWzT6xSdTk=; unified-oauth-state-cookie=C4UBHYLAFKXJJECRJAWNHG77SBJ346HXI5YKMHYIJ7DV3PAEJUNQ====; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYzOTU1NTYsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiMjI5OGEyMmU2Y2EwN2RkYjljMDFmMTJjOGE3MDhhNDciLCJleHAiOjE3NTg5ODc1NTYsImlhdCI6MTc1NjM5NTU1Nn0.; unified-session-manager-cookie=MTc1NjM5NTU1N3xVckJKdU1zWFdaeXBzWHZUSkhBVG5aMGJ3RS1aMk1vVlh4QW9RakFvSVptc1lPYldrejl3RmpobUdFelBwUXBYelBNX3FjSUhnbVA2OFBpV1g3TlBGQWZmQWtPYjNsMkU4MER2endSTS1Wck41Ync9fKtyiWm_Vtfo3-BojxJiGrFwUm6hT3xxFMksg9ikyrKE' \
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
  --data-raw '{"network":"base-sepolia","address":"0x0046872823D3f2793a33Ca59979d590F688f224C","token":"eth"}'

  sleep 0.5
done
