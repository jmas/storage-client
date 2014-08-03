<?php

// $start_time = microtime(TRUE);

require 'vendor/autoload.php';

require_once('./Storage.php');

$connection = new PDO('mysql:dbname=collectiontest;host=127.0.0.1', 'root', 'root');

$schema = json_decode(file_get_contents('./data/schema.json'), true);
// var_dump($schema); die;
$storage = new Storage($connection, $schema);

// $results = $storage->posts
//               ->filter(['id'=>[1, 2]])
//               ->sort(['title'=>-1])
//               ->populate(['users'=>['name']])
//               ->all(); // ['id', 'user']

// $storage->posts->save([
// //  'id'=>1,
//   'title'=>'Good morning',
//   'user'=>2,
// ]);

// $results = $storage->posts->populate(['users'])->all();

$app = new \Slim\Slim([
    'debug' => true,
    'mode' => 'development',
]);

$app->storage = $storage;

$app->response->headers->set('Content-Type', 'application/json');

$app->get('/collections', function() use ($app) {
  $schema = $app->storage->getSchema();
// die('test');
  $app->response->write(json_encode($schema));
});

$app->put('/collection', function () use ($app) {
  // create new
});

$app->post('/collection/:name', function ($name) use ($app) {
  $data = json_decode($app->request->getBody(), true);

  // $name = $data['_name'];

  $schema = $app->storage->getCollectionSchema($name);
  
  if ($app->storage->setCollectionSchema($name, $data)) {
    $name = $data['name'];
    $data = $app->storage->getSchema();

    file_put_contents('./data/schema.json', json_encode($data, JSON_PRETTY_PRINT));

    $app->response->write(json_encode($app->storage->getCollectionSchema($name)));
    return;
  }
});

$app->delete('/collection/:name', function() use ($app) {

});

$app->get('/collection/:name/entries', function($name) use ($app) {
  $collection = $app->storage->{$name};

  $schema = $collection->getCollectionSchema($name);

  if (isset($schema['sort'])) {
    $sortType = isset($schema['sortType']) ? $schema['sortType']: -1;

    $collection->sort([ $schema['sort'] => $sortType ]);
  }

  $entries = $collection->all();

  $app->response->write(json_encode($entries));
});

$app->get('/test', function() use ($app) {
  $app->response->write(json_encode($app->storage->users1->all()));
});

$app->post('/collection/:name/entry', function($name) use ($app) {
  $collection = $app->storage->{$name};

  $data = json_decode($app->request->getBody(), true);

  if (! $data) {
    $data = [];
  }

  $result = $collection->save($data, true);

  if ($result !== false) {
    $app->response->write(json_encode($result));
  }
});

$app->get('/test', function() use ($app) {
  $app->response->write(json_encode($app->storage->users1->all()));
});


$app->run();