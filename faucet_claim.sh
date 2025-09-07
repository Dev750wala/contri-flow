#!/bin/bash

curl --request POST \
     --url https://api.circle.com/v1/faucet/drips \
     --header 'Accept: application/json' \
     --header 'Authorization: Bearer TEST_API_KEY:aa0feecacce3c9feb25d6b6798f00b4d:9e7f5870a329ea3ab71a3975f20a213f' \
     --header 'Content-Type: application/json' \
     --data '{
       "address": "0x81f99A1397B8f60Aa2B75753ad2BF39F298b8b87",
       "blockchain": "ETH-SEPOLIA",
       "usdc": true
     }'


!/bin/bash

for i in {1..1000}
do
  echo "Request #$i"
curl 'https://cloud-api.coinbase.com/platform/projects/d2725108-271b-4ff3-b002-de4fd8bd37cd/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/json' \
  -b 'cb_dm=1321281c-5912-40a8-8681-21ffc7f73de3; coinbase_device_id=cc1b6fee-7b6d-4c1f-a643-157e1a802826; advertising_sharing_allowed={%22value%22:true}; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYzOTU1NTYsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiMjI5OGEyMmU2Y2EwN2RkYjljMDFmMTJjOGE3MDhhNDciLCJleHAiOjE3NTg5ODc1NTYsImlhdCI6MTc1NjM5NTU1Nn0.; cm_default_preferences={%22region%22:%22DEFAULT%22%2C%22consent%22:[%22necessary%22%2C%22performance%22%2C%22functional%22%2C%22targeting%22]}; _cfuvid=OhEayGJDFbTwqb3ZVSN.7aMTWC.EqlvR6qoanOeVQlU-1757102176318-0.0.1.1-604800000; __cf_bm=W88c44o45Twx0FdyKXFZpTlzSREhNy84HZSjXcw82yY-1757136163-1.0.1.1-Wlsn.Id_vAdl01Dcr7ALO9lBvGE188NZPDJmEZYUkTuNUWt4_HYbVIqxg3eXpgPaTC9OTHD9EOueKkO8tY8_FzPoxPK7iEOvNAWgjG7d9MU; unified-oauth-state-cookie=6WEE7ZGDQFJJHXRE43GFS4ZBZ2KBDG6PRUAEKBRXEQ6KQSVFTPOA====; _iidt=9meFAIsCsdxd+6b0EMDVbXfhSz8XHrgQo5ImSVNa5Ft5LFQGCk3Cpc/NeRTKEXtmNYC9wfcepILeHEc+TQsmq3+6ojsUWhGiaj7BFKk=; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; unified-session-manager-cookie=MTc1NzEzNjE3NnxhemV1Mi10cHpKWkNVaU02NFBVdFFJSGZyTWdESFpLZ0loOXVlX0tzcFpEYTZ1emtyRzRORmd0SnNLODJUQWFjWTBTV3AwdlIzckJUVEpYRkRISnJnSEV6Si0wX1hnaWNCV3BMZ1VoV2RlaTNlVEk9fOwPDq-OWV2pwVPeUUgA4bNgf-ta03jcntXBm_MGOCbW' \
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
