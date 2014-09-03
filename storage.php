<?php

/**
 *
 */
function storage() {
  static $storage;

  if (! $storage) {
    $root = dirname(__FILE__);
    require_once($root . DIRECTORY_SEPARATOR .'Storage.php');

    $config = (file_exists($root . DIRECTORY_SEPARATOR . 'config.local.php') ? require_once($root . DIRECTORY_SEPARATOR . 'config.local.php'): require_once($root . DIRECTORY_SEPARATOR . 'config.php'));

    $connection = new PDO($config['pdo.dsn'], $config['pdo.username'], $config['pdo.password']);
    $schema = json_decode(file_get_contents($root . DIRECTORY_SEPARATOR . 'data/schema.json'), true);
    $storage = new Storage($connection, $schema);
  }

  return $storage;
}