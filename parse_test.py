import os
import requests

api_key = os.environ["PARSE_API_KEY"]

url = "https://api.parse.bot/scraper/a4ca7541-612e-4b61-a2eb-a018fed901e9/get_cities"

response = requests.get(
    url,
    headers={"X-API-Key": api_key},
    timeout=30
)

print("STATUS:", response.status_code)
print(response.text)
