<?php

require_once('vendor/autoload.php');
require_once('./Storage.php');
require_once('./HttpBasicAuth.php');

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

// init slim application
$app = new \Slim\Slim(
  file_exists('./config.local.php') ? require_once('./config.local.php'): require_once('./config.php')
);

// get access to storage
$connection = new PDO($app->config('pdo.dsn'), $app->config('pdo.username'), $app->config('pdo.password'));
$schema = json_decode(file_get_contents('./data/schema.json'), true);
$storage = new Storage($connection, $schema);
$app->storage = $storage;

// auth
$app->add(new \Slim\Extras\Middleware\HttpBasicAuth(function($username, $password) use ($app) {
  $isUserExists = $app->storage->collection($app->config('auth.collectionName'))->filter([
    $app->config('auth.usernameField')=>$username,
    $app->config('auth.passwordField')=>$password,
  ])->exists();

  if ($isUserExists) {
    return true;
  } else if ($app->config('auth.allowMaster')
    && $username === $app->config('auth.masterUsername')
    && $password === $app->config('auth.masterPassword')) {
    return true;
  }

  return false;
}));

// set json http header
$app->response->headers->set('Content-Type', 'application/json');

// get all collections
$app->get('/collections', function() use ($app) {
  $schema = $app->storage->getSchema();
  $app->response->write(json_encode($schema));
});

// update collections order
$app->post('/collections', function() use ($app) {
  $data = json_decode($app->request->getBody(), true);

  $schema = $app->storage->getSchema();

  $reorderedSchema = [];

  foreach ($data as $name) {
    foreach ($schema as $collectionSchema) {
      if ($collectionSchema['name'] == $name) {
        $reorderedSchema[] = $collectionSchema;
      }
    }
  }
  
  file_put_contents('./data/schema.json', json_encode($reorderedSchema, JSON_PRETTY_PRINT));
});

// update collecion schema
$app->post('/collections/:name', function ($name) use ($app) {
  $data = json_decode($app->request->getBody(), true);
 
  if ($app->storage->updateCollectionSchema($name, $data)) {
    $schema = $app->storage->getSchema();

    file_put_contents('./data/schema.json', json_encode($schema, JSON_PRETTY_PRINT));

    $collectionScema = $app->storage->getCollectionSchema($data['name']);

    $app->response->write(json_encode($collectionScema));
    return;
  }
});

// delete collection
$app->delete('/collections/:name', function() use ($app) {

});

// get collection entries
$app->get('/collections/:name/entries', function($name) use ($app) {
  $collection = $app->storage->{$name};

  $schema = $collection->getCollectionSchema($name);

  if (isset($schema['sort'])) {
    $sortType = isset($schema['sortType']) ? $schema['sortType']: -1;

    $collection->sort([ $schema['sort'] => $sortType ]);
  }

  $entries = $collection->populate(true);

  $ids = $app->request->get('ids');

  if ($ids) {
    $entries->filter([ 'id' => $ids ]);
  }

  $entries = $entries->all();

  $app->response->write(json_encode($entries));
});

// update collection entries
$app->post('/collections/:name/entries', function($name) use ($app) {
  $collection = $app->storage->collection($name);

  $data = json_decode($app->request->getBody(), true);

  if (! $data) {
    $data = [];
  }

  $result = $collection->save($data, true);

  if ($result !== false) {
    $app->response->write(json_encode($result));
  }
});

// delete collection entries
$app->delete('/collections/:name/entries', function() use ($app) {

});

// test
$app->get('/test', function() use ($app) {
  $result = $app->storage->collection('post')->filter(['published'=>false])->all();

  $app->response->write(json_encode($result));
});

$app->run();