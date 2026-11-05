import os, urllib.request, json

path = os.path.expanduser('~/.git-credentials')
token = None
with open(path) as f:
    for line in f:
        if 'GlobalTeamPartners' in line:
            token = line.strip().split('://')[1].split('@')[0].split(':')[1]
            break

req = urllib.request.Request('https://api.github.com/user/repos?per_page=30&sort=updated', headers={
    'Authorization': f'token {token}',
    'User-Agent': 'Python'
})
with urllib.request.urlopen(req) as resp:
    repos = json.loads(resp.read())
    for r in repos:
        print(r['name'], '-->', r['html_url'])
