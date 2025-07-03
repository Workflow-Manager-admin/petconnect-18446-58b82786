import requests
import os

# Utility to verify if pet image URLs as constructed from API_BASE_URL + photo path are directly accessible.
API_BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or \
    "https://vscode-internal-2193-beta.beta01.cloud.kavia.ai:3001"

def main():
    print("Fetching pets from API to check photo accessibility...")
    r = requests.get(f"{API_BASE_URL}/pets/", timeout=12)
    r.raise_for_status()
    pets = r.json()
    has_photos = [p for p in pets if isinstance(p.get("photos"), list) and len(p.get("photos")) > 0]
    if not has_photos:
        print("No pets with photos found in API response. Exiting.")
        return
    # Use the first pet with a photo
    pet = has_photos[0]
    photo_path = pet["photos"][0]
    # Allow for leading slash or not
    if not photo_path.startswith("/"):
        photo_path = "/" + photo_path
    image_url = API_BASE_URL.rstrip("/") + photo_path
    print(f"Testing image URL: {image_url}")

    resp = requests.get(image_url, timeout=10)
    print(f"Status code: {resp.status_code}")
    content_type = resp.headers.get("content-type")
    print(f"Content-Type: {content_type}")
    if resp.status_code == 200 and content_type and content_type.startswith("image/"):
        print("✅ SUCCESS: Image is directly accessible via HTTP.")
    else:
        print("❌ ERROR: Unable to fetch image. Status or content-type unexpected.")
        print("Response preview:", resp.text[:200])

if __name__ == "__main__":
    main()
