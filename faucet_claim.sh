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


#!/bin/bash

# for i in {1..1000}
# do
#   echo "Request #$i"
# curl 'https://cloud-api.coinbase.com/platform/projects/3f291a53-9ca1-45e7-a7e7-4ecb4b6a71ae/v2/evm/faucet' \
#   -H 'accept: application/json' \
#   -H 'accept-language: en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7,gu;q=0.6,hi;q=0.5' \
#   -H 'content-type: application/json' \
#   -b 'coinbase_device_id=5502f0f0-bde1-48c9-a863-003132535d0d; cb_dm=27dd40b7-049d-45ef-a93d-6a830adc3715; advertising_sharing_allowed={%22value%22:true}; __cf_bm=LcVAJcnpLUb09P8kNUVJZAQ4UA3CxHqEYRmxTY2ZD5g-1756395049-1.0.1.1-iYykGJc.6v_SH_GAICvLe216mR4V9JDDNxbNP82YAZDPx5t3_qXMPKHwD4QoE0k8j6K8HpNBYUZfMoTFbBX4LAXcV94cy7faXjmmlNyHq6w; _cfuvid=2FtfuSFGLC2z.bOzo3enIcCPeCoSOUPlSl6XjpTVi6o-1756395049131-0.0.1.1-604800000; unified-oauth-state-cookie=VCLIFSR66AMVQZ53BZ2DU4GVKF4L5REIOCQ2HPE6MMZQHMEQLZMA====; _iidt=TjnkjRmYpfsPTvCZvuepFR+7bJh89jflu4lM/cUg571tk7qUf3Agt770KSb87TQqButfxH6d8o3t/Q==; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYzOTUwODIsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiOTRkMzU1NTAwZDIzMTgyY2M5Yzg2MDEyN2I3NTA3MTciLCJleHAiOjE3NTg5ODcwODIsImlhdCI6MTc1NjM5NTA4Mn0.; unified-session-manager-cookie=MTc1NjM5NTA4MnxCa2trSXpYTTRmTFVsS0JnUHlBd3RrRFpBUzc1NkFyeEJZNElLSndhcnlkVEZTZC1QWF85OEpyaGszNlFBVXNCbHI1XzVlc2ZfZVBEeUpNZ1NFNzliNEpSbTAteWJGalpWYU9QQ0RpQ1A5MGlhYVE9fKXTEef4rJNSBdYFv2sUEQ4xIFTCu_6cOHs7hM9TVsat' \
#   -H 'origin: https://portal.cdp.coinbase.com' \
#   -H 'priority: u=1, i' \
#   -H 'referer: https://portal.cdp.coinbase.com/' \
#   -H 'sec-ch-ua: "Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"' \
#   -H 'sec-ch-ua-mobile: ?0' \
#   -H 'sec-ch-ua-platform: "Windows"' \
#   -H 'sec-fetch-dest: empty' \
#   -H 'sec-fetch-mode: cors' \
#   -H 'sec-fetch-site: same-site' \
#   -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36' \
#   --data-raw '{"network":"base-sepolia","address":"0x81f99A1397B8f60Aa2B75753ad2BF39F298b8b87","token":"eth"}'

#   sleep 0.5
# done
