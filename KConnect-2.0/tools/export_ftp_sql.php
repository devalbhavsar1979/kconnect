<?php
/** Local-only export from the actual Laravel migration, tested on MariaDB.
 * No remote connection, existing database reset, or user secrets are used.
 */
declare(strict_types=1);
require __DIR__.'/../backend/vendor/autoload.php';
$out=dirname(__DIR__).'/artifacts/ftp-phase2-20261019-001';
if (file_exists($out.'/sql/01_schema.sql')) { throw new RuntimeException('Export already exists; preserve its credentials and SQL'); }
$server=new PDO('mysql:host=127.0.0.1;port=33079;charset=utf8mb4','root','synthetic-local-only',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
// Fixed isolated database names; never drop or reset any existing database.
$suffix=bin2hex(random_bytes(4));
$exportName='kconnect_ftp_export_'.$suffix; $verifyName='kconnect_ftp_verify_'.$suffix;
$server->exec('CREATE DATABASE '.$exportName.' CHARACTER SET utf8mb4 COLLATE utf8mb4_bin');
$server->exec('CREATE DATABASE '.$verifyName.' CHARACTER SET utf8mb4 COLLATE utf8mb4_bin');
putenv('DB_CONNECTION=mysql'); putenv('DB_HOST=127.0.0.1'); putenv('DB_PORT=33079');
putenv('DB_DATABASE='.$exportName); putenv('DB_USERNAME=root'); putenv('DB_PASSWORD=synthetic-local-only');
putenv('APP_ENV=testing');
$app=require __DIR__.'/../backend/bootstrap/app.php';
$kernel=$app->make(Illuminate\Contracts\Console\Kernel::class);
if ($kernel->call('migrate',['--force'=>true])!==0) { throw new RuntimeException('Migration failed'); }
$db=new PDO('mysql:host=127.0.0.1;port=33079;dbname='.$exportName.';charset=utf8mb4','root','synthetic-local-only',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$verify=new PDO('mysql:host=127.0.0.1;port=33079;dbname='.$verifyName.';charset=utf8mb4','root','synthetic-local-only',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$tables=['migrations','categories','users','academic_details','achievements','experience_entries','organizations','refresh_tokens','user_expertise','user_preferences','user_service_delivery','opportunities','applications','opportunity_attachments'];
$schema=["SET NAMES utf8mb4", "SET time_zone = '+00:00'", "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'"];
foreach ($tables as $table) { $schema[]=$db->query('SHOW CREATE TABLE `'.$table.'`')->fetch(PDO::FETCH_NUM)[1]; }
$schema[]="INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1, '2026_10_19_000001_create_domain_schema', 1)";
foreach ($schema as $statement) { $verify->exec($statement); }
if (!is_dir($out.'/sql')) { mkdir($out.'/sql',0750,true); }
file_put_contents($out.'/sql/01_schema.sql',"-- Phase 2 schema. Select a NEW EMPTY cPanel database in phpMyAdmin, then import.\n-- Generated from the actual Laravel migration on MariaDB, including migration history.\n-- No CREATE DATABASE, USE, DROP, or FOREIGN_KEY_CHECKS bypass. Do not repeat this file on existing tables.\n\n".implode(";\n\n",$schema).";\n");
$password=bin2hex(random_bytes(16));
$hash=password_hash($password,PASSWORD_BCRYPT,['cost'=>12]);
$rows=[]; $accounts=[];
foreach (['SME','PROFESSIONAL_SERVICE_PROVIDER','ADMIN','SUPER_ADMIN','FREELANCER'] as $i=>$role) {
    $id=sprintf('20000000-0000-4000-8000-%012d',$i+1);
    $email=strtolower($role).'@example.test'; $accounts[]=$email;
    $values=[$id,'Synthetic',$role,$email,$hash,$role,'INCOMPLETE'];
    $rows[]='('.implode(',',array_map($db->quote(...),$values)).",1,0,0,'2026-01-01 00:00:00','2026-01-01 00:00:00')";
}
$seed=["SET NAMES utf8mb4", "SET time_zone = '+00:00'",'START TRANSACTION',
    "INSERT INTO users (id,first_name,last_name,email,password_hash,user_type,profile_status,is_active,is_verified,consent,created_at,updated_at) VALUES\n".implode(",\n",$rows).' ON DUPLICATE KEY UPDATE id=users.id',
    "INSERT INTO categories (id,name,description,is_active,created_at,updated_at) VALUES ('30000000-0000-4000-8000-000000000001','Synthetic training','Staging fixture',1,'2026-01-01 00:00:00','2026-01-01 00:00:00') ON DUPLICATE KEY UPDATE id=categories.id",
    "INSERT INTO organizations (id,organization_name,created_by,created_at,updated_at) VALUES ('40000000-0000-4000-8000-000000000001','Synthetic organization','20000000-0000-4000-8000-000000000004','2026-01-01 00:00:00','2026-01-01 00:00:00') ON DUPLICATE KEY UPDATE id=organizations.id", 'COMMIT'];
file_put_contents($out.'/sql/02_synthetic_data.sql',"-- Optional synthetic staging fixtures. Import AFTER 01_schema.sql.\n-- Reruns preserve existing rows and passwords; these are not production accounts.\n-- Password is in LOCAL_TEST_LOGINS.txt; keep it on your computer only.\n\n".implode(";\n\n",$seed).";\n");
for ($run=0;$run<2;$run++) { foreach ($seed as $statement) { $verify->exec($statement); } }
if ((int)$verify->query('SELECT COUNT(*) FROM users')->fetchColumn()!==5 || !password_verify($password,$verify->query('SELECT password_hash FROM users LIMIT 1')->fetchColumn())) { throw new RuntimeException('Seed verification failed'); }
foreach ($tables as $table) {
    if ($db->query('SHOW CREATE TABLE `'.$table.'`')->fetch(PDO::FETCH_NUM)[1]!==$verify->query('SHOW CREATE TABLE `'.$table.'`')->fetch(PDO::FETCH_NUM)[1]) { throw new RuntimeException('Schema comparison failed: '.$table); }
}
file_put_contents($out.'/LOCAL_TEST_LOGINS.txt',"KEEP THIS FILE LOCAL. Do not upload to the website or commit to Git.\nSynthetic staging accounts only; same randomly generated password for these accounts:\n".implode("\n",$accounts)."\n\nPassword: ".$password."\n\nUse a fresh database for these credentials. Reimporting SQL preserves existing passwords.\n");
file_put_contents($out.'/sql/03_verify_import.sql',"-- Run in phpMyAdmin SQL tab after both imports. No passwords/hashes are displayed.\nSELECT VERSION() AS server_version;\nSELECT COUNT(*) AS expected_14_tables FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE';\nSELECT migration,batch FROM migrations;\nSELECT email,user_type,is_active FROM users ORDER BY email;\nSELECT COUNT(*) AS expected_1_category FROM categories;\nSELECT COUNT(*) AS expected_1_organization FROM organizations;\nSELECT table_name,table_collation FROM information_schema.tables WHERE table_schema=DATABASE() ORDER BY table_name;\n");
file_put_contents($out.'/sql/validation.json',json_encode(['database_version'=>$verify->query('SELECT VERSION()')->fetchColumn(),'tables'=>count($tables),'schema_matches_laravel'=>true,'seed_runs'=>2,'users'=>5,'password_verified'=>true,'local_validation_database'=>$verifyName],JSON_PRETTY_PRINT)."\n");
echo "Exported SQL; verified 14 tables match Laravel and two seed imports preserve five users. Password stored locally, not printed.\n";
