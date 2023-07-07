import json
import pprint
import sseclient

import requests


def evnet_resp(url, headers):
    # auth = requests.post(url + "/auth/operator", json={
    #     "username": "operator",
    #     "password": "operator1234"
    # })
    return requests.get(url=url + "/event", stream=True, headers=headers)


url = 'http://localhost:8888'
headers = {'Accept': 'text/event-stream'}
response = evnet_resp(url, headers)  # or with_requests(url, headers)
client = sseclient.SSEClient(response)
for event in client.events():
    pprint.pprint(str(event))
