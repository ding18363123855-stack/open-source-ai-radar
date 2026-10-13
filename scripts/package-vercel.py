"""Package tracked upstream source plus deployment edits for a small Vercel upload.

Git archive preserves paths that differ only by case on Windows. Runtime files,
credentials and local databases are excluded by using an explicit edit list.
"""
from pathlib import Path
import gzip
import shutil
import subprocess
import tarfile
import json

root = Path(__file__).resolve().parents[1]
stage = root / '.local' / 'vercel-upload'
stage.mkdir(parents=True, exist_ok=True)
archive = stage / 'source.tar'
subprocess.run(['git', 'archive', '--format=tar', f'--output={archive}', 'HEAD'], cwd=root, check=True)
edits = [
    'web/astro.config.mjs', 'web/package.json', 'web/package-lock.json',
    'web/src/layouts/Layout.astro', 'web/src/pages/index.astro',
    'web/src/pages/api-docs.astro', 'scripts/copy-api.mjs',
]
with tarfile.open(archive, 'a') as package:
    for relative in edits:
        package.add(root / relative, arcname=relative)
with archive.open('rb') as source, gzip.open(stage / 'source.tar.gz', 'wb') as output:
    shutil.copyfileobj(source, output)
archive.unlink()
(stage / 'vercel.json').write_text(json.dumps({
    '$schema': 'https://openapi.vercel.sh/vercel.json',
    'framework': None,
    'installCommand': 'mkdir -p app && tar -xzf source.tar.gz -C app && npm ci --prefix app/web',
    'buildCommand': 'npm run build --prefix app/web && node app/scripts/copy-api.mjs',
    'outputDirectory': 'app/dist',
    'trailingSlash': True,
}), encoding='utf-8')
(stage / '.vercelignore').write_text('app\n', encoding='utf-8')
print(f'Prepared {stage}: {(stage / "source.tar.gz").stat().st_size / 1024**2:.1f} MiB')
