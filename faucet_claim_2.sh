#!/bin/bash

for i in {1..1000}
do
  echo "Request #$i"
curl 'https://cloud-api.coinbase.com/platform/projects/3f291a53-9ca1-45e7-a7e7-4ecb4b6a71ae/v2/evm/faucet' \
  -H 'accept: application/json' \
  -H 'accept-language: en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7,gu;q=0.6,hi;q=0.5' \
  -H 'content-type: application/json' \
  -b 'coinbase_device_id=5502f0f0-bde1-48c9-a863-003132535d0d; cb_dm=27dd40b7-049d-45ef-a93d-6a830adc3715; advertising_sharing_allowed={%22value%22:true}; cb-gssc=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdXRoX3RpbWUiOjE3NTYzOTUwODIsImlzcyI6Imh0dHBzOi8vbG9naW4uY29pbmJhc2UuY29tIiwic3ViIjoiOTRkMzU1NTAwZDIzMTgyY2M5Yzg2MDEyN2I3NTA3MTciLCJleHAiOjE3NTg5ODcwODIsImlhdCI6MTc1NjM5NTA4Mn0.; _cfuvid=vfzL8a5jHHd3sdMzmW3kwAcpJp9Xa0HUm9TnoE2ZHS0-1757102188766-0.0.1.1-604800000; __cf_bm=4y.fTlOPjXkwwIvFzoB7Lr8aNg_XljEI5Eyo.MZZVTc-1757136260-1.0.1.1-u2lhb0R.NsJrHaRMM9tz3dV8H91T4bMThPabp27cejp6V4bEmn22tN6i07xsLCPnHdYr9B50SLiXfSfedoENtvWIgfc1aSrg_GimMHJUwzg; unified-oauth-state-cookie=RV64Z4VHBE4TH2JSEBJM6Y23O7FVXTJJEYHN5ETXUSTB2NWC3DNQ====; _iidt=m7p3yZaHbZmAXuDuHeFTMeImdQWHMXj+Ej0Vddw9X1irVl6z/4bObERZhbald2dUYEAfxPusSoLSDW2HZLzO3soknNUHonfeMLu3Wrs=; identity_device_id=0377d43e-1217-51c4-aaa1-08ef29f5c815; unified-session-manager-cookie=MTc1NzEzNjI3OXw1T0RKRnRVa09JSV9KaUNqaGFXVDJwODEyZzdSQkxMdm13cWdRZk1KSDFwVWllRkY5UkhNM2pZZ3g1eXpLTy1MM21lSnJDWHZ2UlBwNmZWX2s0clRuQXYybXpmeGZwUmRJenpCN3FzWGJHVlpnTzQ9fBJ-MIrv1s9vIdcw95poGrzwSn1-18RYEdVIXFPCQUSU; ph_phc_TXdpocbGVeZVm5VJmAsHTMrCofBQu3e0kN8HGMNGTVW_posthog=%7B%22distinct_id%22%3A%2201991b87-670f-7076-b5bb-0b1c11a28e03%22%2C%22%24sesid%22%3A%5B1757136313902%2C%2201991d7c-5d47-7697-bdeb-b399e101a74d%22%2C1757136313671%5D%7D' \
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
  --data-raw '{"network":"base-sepolia","address":"0x81f99A1397B8f60Aa2B75753ad2BF39F298b8b87","token":"eth"}'

  sleep 0.5
done
