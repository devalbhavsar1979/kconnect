"""CI transport only: pinned SSH host, immutable upload, configured staging root.

Reads secrets from CI environment. Never disables SSH host verification.
Provision private_root/deployer and config/shared env separately before use.
"""
import argparse
import hashlib
import os
import re
import shlex
import subprocess
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('archive', type=Path)
    args = parser.parse_args()
    def setting(name, pattern):
        value = os.environ[name]
        if not re.fullmatch(pattern, value):
            raise ValueError('Invalid setting: ' + name)
        return value
    host = setting('DEPLOY_HOST', r'[A-Za-z0-9.-]+')
    user = setting('DEPLOY_USER', r'[A-Za-z0-9_-]+')
    port = setting('DEPLOY_PORT', r'[0-9]{1,5}')
    root = setting('STAGING_PRIVATE_ROOT', r'/home/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+')
    php = setting('REMOTE_PHP', r'/[A-Za-z0-9_./-]+')
    key, known = os.environ['DEPLOY_KEY_FILE'], os.environ['DEPLOY_KNOWN_HOSTS_FILE']
    filename = args.archive.name
    if not re.fullmatch(r'[A-Za-z0-9_-]+\.tar\.gz', filename):
        raise ValueError('Unsafe archive name')
    checksum = hashlib.sha256(args.archive.read_bytes()).hexdigest()
    if checksum != args.archive.with_suffix(args.archive.suffix + '.sha256').read_text().strip():
        raise ValueError('Local archive checksum mismatch')
    options = ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'IdentitiesOnly=yes', '-o', 'UserKnownHostsFile=' + known, '-i', key]
    target = user + '@' + host
    def remote(command):
        subprocess.run(['ssh', *options, '-p', port, target, shlex.join(command)], check=True)
    remote(['test', '-f', root + '/staging.json'])
    remote(['mkdir', '-p', root + '/incoming'])
    remote_file = root + '/incoming/' + filename
    # Interrupted transfer never touches current.json or a live release.
    subprocess.run(['scp', *options, '-P', port, str(args.archive), target + ':' + remote_file + '.partial'], check=True)
    remote(['mv', remote_file + '.partial', remote_file])
    remote([php, root + '/deployer/deploy.php', 'deploy', root + '/staging.json', remote_file, checksum])


if __name__ == '__main__':
    main()
