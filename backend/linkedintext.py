import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
import webbrowser
from urllib.parse import parse_qs, urlparse, quote

CLIENT_ID = "78yotg9ha95ugw"  # From your screenshot
CLIENT_SECRET = "WPL_AP1.4LWNnfQZQk7jQvf8./VmsKQ=="
REDIRECT_URI = "http://localhost:8000/callback"

# Define all the scopes we need, properly formatted
SCOPES = [
    "rw_ads",
    "r_basicprofile",
    "w_organization_social",
    "w_member_social",
    "rw_organization_admin",
]

# Join scopes with commas and URL encode them
ENCODED_SCOPES = quote(",".join(SCOPES))


class AuthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if "/callback" in self.path:
            query_components = parse_qs(urlparse(self.path).query)
            auth_code = query_components["code"][0]

            # Exchange auth code for access token with scopes
            token_url = "https://www.linkedin.com/oauth/v2/accessToken"
            data = {
                "grant_type": "authorization_code",
                "code": auth_code,
                "redirect_uri": REDIRECT_URI,
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            }

            response = requests.post(token_url, data=data)

            if response.status_code == 200:
                access_token = response.json()["access_token"]
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.wfile.write(f"Access Token: {access_token}".encode())
                print(f"\nYour access token is: {access_token}")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)


# Generate the authorization URL with scopes
auth_url = (
    f"https://www.linkedin.com/oauth/v2/authorization?"
    f"response_type=code&"
    f"client_id={CLIENT_ID}&"
    f"redirect_uri={REDIRECT_URI}&"
    f"scope={ENCODED_SCOPES}"
)

print("Opening browser for LinkedIn authentication...")
print(f"\nAuthorization URL: {auth_url}\n")
webbrowser.open(auth_url)

server = HTTPServer(("localhost", 8000), AuthHandler)
print("Waiting for callback...")
server.handle_request()
