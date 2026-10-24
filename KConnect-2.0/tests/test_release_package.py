import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch
import tempfile
import tarfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('package_release', ROOT / 'tools/package_release.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PackageTest(unittest.TestCase):
    def test_production_only_package_and_immutable_identity(self):
        # Temp files stay inside the migration workspace.
        (ROOT / 'artifacts').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=ROOT / 'artifacts') as temporary:
            root = Path(temporary)
            files = {'backend/vendor/composer/installed.json': '{"dev": false}',
                     'backend/artisan': '<?php', 'backend/composer.json': '{}', 'backend/composer.lock': '{}',
                     'backend/.env': 'DO_NOT_PACKAGE', 'backend/storage/logs/laravel.log': 'DO_NOT_PACKAGE',
                     'backend/bootstrap/cache/config.php': 'DO_NOT_PACKAGE', 'frontend/dist/index.html': '<html/>',
                     'backend/database/migrations/2026_10_19_000001_create_domain_schema.php': '<?php // fixture',
                     'deployment/public.htaccess': 'rules', 'deployment/public-bootstrap.php.template': '<?php'}
            for name, value in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(value)
            with patch.object(module, 'ROOT', root):
                module.package('test1', 'fixture', root / 'out')
                with tarfile.open(root / 'out/test1.tar.gz') as archive:
                    names = archive.getnames()
                    self.assertIn('backend/resources/spa/index.html', names)
                    self.assertNotIn('backend/.env', names)
                    self.assertNotIn('backend/storage/logs/laravel.log', names)
                    self.assertNotIn('backend/bootstrap/cache/config.php', names)
                    self.assertIn('backend/database/migrations/2026_10_19_000001_create_domain_schema.php', names)
                    manifest=json.load(archive.extractfile('manifest.json'))
                    self.assertEqual('phase2-baseline', manifest['schema_epoch'])
                with self.assertRaisesRegex(ValueError, 'already exists'):
                    module.package('test1', 'fixture', root / 'out')
                (root / 'backend/vendor/composer/installed.json').write_text('{"dev": true}')
                with self.assertRaisesRegex(ValueError, '--no-dev'):
                    module.package('test2', 'fixture', root / 'out')


if __name__ == '__main__':
    unittest.main()
