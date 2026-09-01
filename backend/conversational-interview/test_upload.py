import requests

# Test the upload resume endpoint
url = "http://localhost:8000/api/upload-resume"
files = {'file': ('dummy.txt', 'Alex Mercer\nBackend Engineer at Acme Corp from 2020-2023. I built APIs in Python.\nBefore that, I was an Intern at Stark Industries.')}
response = requests.post(url, files=files)
print(response.status_code)
print(response.json())
