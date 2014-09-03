<?php

return [
  'debug' => true,
  'mode' => 'development',
  'pdo.dsn'=>'mysql:dbname=orm;host=127.0.0.1', 
  'pdo.username'=>'root',
  'pdo.password'=>'root',
  'auth.collectionName'=>'user',
  'auth.usernameField'=>'email',
  'auth.passwordField'=>'password',
  'auth.allowMaster'=>true,
  'auth.masterUsername'=>'master',
  'auth.masterPassword'=>'masterPassword',
];