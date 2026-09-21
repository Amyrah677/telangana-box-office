import os
import requests

API_KEY = os.environ["PARSE_API_KEY"]

url = "https://api.parse.bot/scraper/a4ca7541-612e-4b61-a2eb-a018fed901e9/get_cities"

response = requests.get(
    url,
    headers={"X-API-Key": API_KEY},
    timeout=30
)

print("Status:", response.status_code)
print(response.text)
