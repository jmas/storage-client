<?php

require_once('vendor/autoload.php');
require_once('./Storage.php');
require_once('./HttpBasicAuth.php');

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
$app->response->headers->set('Access-Control-Allow-Origin', '*');

// get all collections
$app->get('/collections', function() use ($app) {
  $schema = $app->storage->getSchema();
  $app->response->write(json_encode([
    'result'=>$schema,
  ]));
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

    $app->response->write(json_encode([
      'result' => $collectionScema,
    ]));
    return;
  }
});

// delete collection
$app->delete('/collections/:name', function($name) use ($app) {
  $result = false;

  if ($app->storage->removeCollection($name)) {
    $schema = $app->storage->getSchema();

    file_put_contents('./data/schema.json', json_encode($schema, JSON_PRETTY_PRINT));

    $result = true;
  }

  $app->response->write(json_encode([
    'result' => $result,
  ]));
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

  $filterParam = $app->request->get('filter');

  if ($filterParam) {
    $filters = [];

    foreach ($schema['fields'] as $field) {
      if (! isset($field['displayed']) || $field['displayed'] === false || $field['type'] === 'collectionOne' || $field['type'] === 'collectionMany') {
        continue;
      }
      
      $filters[$field['name']] = ['like' => '%' . trim($filterParam) . '%'];
    }

     $entries->filter($filters);
  }

  $skipParam = $app->request->get('skip');

  $limitParam = $app->request->get('limit');

  if ($limitParam) {
    $entries->limit($limitParam);
  }

  if ($skipParam) {
    $entries->skip($skipParam);
  }

  $entries = $entries->all();

  $app->response->write(json_encode([
    'result' => $entries,
  ]));
});

$app->get('/collections/:name/total', function($name) use ($app) {
  $total = $app->storage->collection($name)->count();

  $app->response->write(json_encode([
    'result' => $total,
  ]));
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
    $app->response->write(json_encode([
      'result' => $result
    ]));
  }
});

// delete collection entries
$app->delete('/collections/:name/entries', function($name) use ($app) {
  $data = json_decode($app->request->getBody(), true);

  $result = $app->storage->collection($name)->remove($data);

  $app->response->write(json_encode([
    'result'=>$result,
  ]));
});

// test
// $app->get('/test', function() use ($app) {
//   $result = $app->storage->collection('user')->filter([
//     'id'=>['from'=>2, 'to'=>2],
//   ])->all();

//   $app->response->write(json_encode($result));
// });

$app->run();