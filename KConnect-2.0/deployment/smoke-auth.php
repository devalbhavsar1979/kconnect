<?php
// Runs against the staging URL; creates synthetic accounts, never prints tokens.
if (PHP_SAPI!=='cli') { http_response_code(404); exit; }
$base=rtrim($argv[1]??'https://app.kconnect.in','/');
if ($base!=='https://app.kconnect.in' && !preg_match('~^http://127\.0\.0\.1:\d+$~',$base)) { throw new RuntimeException('Only approved staging/loopback targets are accepted'); }
function requestApi(string $method,string $path,?array $data=null,?string $token=null,bool $form=false): array {
    global $base;
    $curl=curl_init($base.$path);
    $headers=['Accept: application/json','Cache-Control: no-store'];
    if ($token) { $headers[]='Authorization: Bearer '.$token; }
    if ($data!==null && !$form) { $headers[]='Content-Type: application/json'; }
    curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>$headers,CURLOPT_TIMEOUT=>30,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2]);
    if ($data!==null) { curl_setopt($curl,CURLOPT_POSTFIELDS,$form?$data:json_encode($data)); }
    $body=curl_exec($curl); $status=curl_getinfo($curl,CURLINFO_RESPONSE_CODE); curl_close($curl);
    return [$status,json_decode($body?:'',true)];
}
function expectStatus(array $result,int $expected,string $step): array {
    if ($result[0]!==$expected) { throw new RuntimeException($step.': expected '.$expected.', received '.$result[0].'. Inspect private server logs; credentials are not printed.'); }
    echo 'PASS '.$step.PHP_EOL; return $result[1]??[];
}
try {
    expectStatus(requestApi('GET','/health'),200,'health');
    $email='phase2-'.bin2hex(random_bytes(6)).'@example.test';
    $password=bin2hex(random_bytes(16));
    $data=['first_name'=>'Synthetic','last_name'=>'Smoke','email'=>$email,'password'=>$password,'confirm_password'=>$password,'user_type'=>'SME'];
    $tokens=expectStatus(requestApi('POST','/api/v1/auth/register',$data,null,true),201,'registration');
    if (!isset($tokens['access_token'],$tokens['refresh_token']) || $tokens['token_type']!=='bearer') { throw new RuntimeException('Token contract mismatch'); }
    expectStatus(requestApi('POST','/api/v1/auth/register',$data,null,true),409,'duplicate email');
    $data['email']='admin-'.$email; $data['user_type']='SUPER_ADMIN';
    expectStatus(requestApi('POST','/api/v1/auth/register',$data,null,true),403,'privileged registration denied');
    foreach (['auth/me','users/me','users/me/profile'] as $route) {
        $me=expectStatus(requestApi('GET','/api/v1/'.$route,null,$tokens['access_token']),200,$route);
        if (($me['email']??null)!==$email || isset($me['password_hash'])) { throw new RuntimeException('Current-user contract mismatch'); }
    }
    expectStatus(requestApi('GET','/api/v1/auth/me'),403,'unauthenticated denied');
    expectStatus(requestApi('POST','/api/v1/auth/login',['email'=>$email,'password'=>'wrong']),401,'wrong password');
    $login=expectStatus(requestApi('POST','/api/v1/auth/login',['email'=>$email,'password'=>$password]),200,'login');
    expectStatus(requestApi('POST','/api/v1/auth/refresh',['refresh_token'=>$tokens['refresh_token']]),200,'refresh');
    expectStatus(requestApi('POST','/api/v1/auth/logout',['refresh_token'=>$tokens['refresh_token']]),204,'logout');
    expectStatus(requestApi('POST','/api/v1/auth/refresh',['refresh_token'=>$tokens['refresh_token']]),401,'revoked refresh denied');
    expectStatus(requestApi('POST','/api/v1/auth/logout',['refresh_token'=>$login['refresh_token']]),204,'second session logout');
    echo 'Authentication smoke passed. One synthetic account retained: '.$email.PHP_EOL;
} catch (Throwable $e) { fwrite(STDERR,$e->getMessage().PHP_EOL); exit(1); }
