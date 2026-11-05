import os, urllib.request, json, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')

path = os.path.expanduser('~/.git-credentials')
token = None
with open(path) as f:
    for line in f:
        if 'GlobalTeamPartners' in line:
            token = line.strip().split('://')[1].split('@')[0].split(':')[1]
            break

if not token:
    print('Error: Token for GlobalTeamPartners not found')
    exit(1)

repo_name = 'indigo-hub'
org_or_user = 'GlobalTeamPartners'

# 1. Create repo if not exists
create_payload = json.dumps({
    'name': repo_name,
    'description': 'Международная Академия МЕТОФИЗИКИ ИНДИГО | Штаб Экспансии & Хаб Продаж',
    'private': False,
    'auto_init': False
}).encode('utf-8')

req = urllib.request.Request('https://api.github.com/user/repos', data=create_payload, headers={
    'Authorization': f'token {token}',
    'User-Agent': 'Python',
    'Content-Type': 'application/json'
})

try:
    with urllib.request.urlopen(req) as resp:
        print(f'Created repo {repo_name} successfully!')
except urllib.error.HTTPError as e:
    if e.code == 422:
        print(f'Repo {repo_name} already exists or was created.')
    else:
        print(f'HTTP Error creating repo: {e.code} {e.read().decode("utf-8", "ignore")}')

# 2. Setup local git
cmds = [
    'git init',
    'git config user.name "Global Team Partners"',
    'git config user.email "bot@unityspirit.com"',
    'git add .',
    'git commit -m "Launch International Indigo Metaphysics Hub, Landing, Deck, Mini App & AI Avatar Studio"',
    'git branch -M main',
    'git remote remove origin',
    f'git remote add origin https://{token}@github.com/{org_or_user}/{repo_name}.git',
    'git push -u origin main --force'
]

for cmd in cmds:
    res = subprocess.run(cmd, shell=True, capture_output=True, encoding='utf-8', errors='ignore')
    if 'remote remove' in cmd and res.returncode != 0:
        continue
    if res.returncode != 0:
        print(f'Command info: {cmd[:30]} -> returncode {res.returncode}')
        if res.stderr:
            print(f'Err: {res.stderr[:200]}')
    else:
        print(f'OK: {cmd[:35]}...')

# 3. Enable GitHub Pages
pages_payload = json.dumps({
    'source': {
        'branch': 'main',
        'path': '/'
    }
}).encode('utf-8')

req_pages = urllib.request.Request(f'https://api.github.com/repos/{org_or_user}/{repo_name}/pages', data=pages_payload, headers={
    'Authorization': f'token {token}',
    'User-Agent': 'Python',
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
})

try:
    with urllib.request.urlopen(req_pages) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f'GitHub Pages enabled: {data.get("html_url")}')
except urllib.error.HTTPError as e:
    # Query status
    req_check = urllib.request.Request(f'https://api.github.com/repos/{org_or_user}/{repo_name}/pages', headers={
        'Authorization': f'token {token}',
        'User-Agent': 'Python',
        'Accept': 'application/vnd.github+json'
    })
    try:
        with urllib.request.urlopen(req_check) as r2:
            data2 = json.loads(r2.read().decode('utf-8'))
            print('Current Pages URL:', data2.get('html_url'))
    except Exception as ex:
        print('Pages query:', ex)
