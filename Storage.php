<?php

/**
 *
 */
class Storage
{
  private $collectionName;
  private $fields=[];
  private $sort=[];
  private $limit;
  private $skip;
  private $filter=[];
  private $populate=[];

  private $connection;
  private $schema;

  /**
   *
   */
  public function __construct(PDO $connection, array $schema=[])
  {
    $this->connection = $connection;
    $this->schema = $schema;

    $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  /**
   *
   */
  public function __get($name)
  {
    $this->collection($name);
    return $this;
  }

  /**
   *
   */
  public function getSchema()
  {
    return $this->schema;
  }

  /**
   *
   */
  public function getCollectionSchema($name)
  {
    $collections = $this->schema;

    foreach ($collections as $collection) {
      if (isset($collection['name']) && $collection['name'] == $name) {
        return $collection;
      }
    }

    return null;
  }

  /**
   *
   */
  public function setCollectionSchema($name, $schema)
  {
    $currentSchema = $this->getCollectionSchema($name);

    $batchSql = [];

    if ($currentSchema !== null) {
      if ($schema['name'] != $currentSchema['name']) {
        $batchSql[] = "ALTER TABLE {$currentSchema['name']} RENAME {$schema['name']}";
      }
    } else {
      $batchSql[] = "CREATE TABLE {$name} (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)";

      $currentSchema = [
        'name'=>$name,
        'fields'=>[],
      ];
    }

    function getSqlType($type) {
      $sqlType = ' VARCHAR(1000) ';

      switch ($type) {
        case 'text':
        case 'password':
        case 'select':
          $sqlType = ' VARCHAR(1000) ';
          break;
        case 'boolean':
          $sqlType = ' INT(1) NOT NULL DEFAULT "' . (isset($newField['defaultValue']) && $newField['defaultValue'] === true ? '1': '0') . '" ';
          break;
        case 'multiline':
        case 'wysiwyg':
          $sqlType = ' TEXT ';
          break;
        case 'datetime':
          $sqlType = ' DATETIME ';
          break;
        case 'number':
          $sqlType = ' INT(100) NOT NULL DEFAULT "' . (isset($newField['defaultValue']) && $newField['defaultValue'] === true ? (int)$newField['defaultValue']: '0') . '" ';
          break;
        case 'float':
          $sqlType = ' FLOAT NOT NULL DEFAULT "' . (isset($newField['defaultValue']) && $newField['defaultValue'] === true ? (float)$newField['defaultValue']: '0') . '" ';
          break;
      }

      return $sqlType;
    }

    foreach ($schema['fields'] as $field) {
      $isFound = false;

      foreach ($currentSchema['fields'] as $currentField) {
        if (isset($field['_name']) && $field['_name'] == $currentField['name']) {
          $isFound = true;

          if ($field['type'] != $currentField['type'] || $field['name'] != $currentField['name']) {
            $sqlType = getSqlType($field['type']);

            $batchSql[] = "ALTER TABLE {$schema['name']} CHANGE {$currentField['name']} {$field['name']} {$sqlType}";
          }

          break;
        }
      }

      if (! $isFound) {
        $sqlType = getSqlType($field['type']);

        $batchSql[] = "ALTER TABLE {$schema['name']} ADD {$field['name']} {$sqlType}";
      }
    }

    foreach ($currentSchema['fields'] as $currentField) {
      $isFound = false;

      foreach ($schema['fields'] as $i=>$field) {
        if (isset($field['_name']) && $field['_name'] == $currentField['name']) {
          $isFound = true;
          break;
        }
      }

      if (! $isFound) {
        $sqlType = getSqlType($field['type']);

        $batchSql[] = "ALTER TABLE {$schema['name']} DROP {$currentField['name']}";
      }
    }

    foreach ($schema['fields'] as $i=>$field) {
      unset($schema['fields'][$i]['_name']);
    }

    $isFound = false;

    foreach ($this->schema as $i => $collection) {
      if ($collection['name'] == $schema['_name']) {
        unset($schema['_name']);

        $this->schema[$i] = $schema;

        $isFound = true;
        break;
      }
    }

    if (! $isFound) {
      unset($schema['_name']);
      $this->schema[] = $schema;
    }

    foreach ($batchSql as $sql) {
      $sth = $this->connection->prepare($sql);

      if ($sth->execute() === false) {
        return false;
      }
    }

    return true;
  }

  /**
   *
   */
  public function getFieldSchema($name, $collectionName=null)
  {
    $collectionName = ($collectionName ? $collectionName: $this->collectionName);

    $collection = $this->getCollectionSchema($collectionName);
    $fields = $collection['fields'];

    foreach ($fields as $field) {
      if (isset($field['name']) && $field['name'] == $name) {
        return $field;
      }
    }

    return null;
  }

  /**
   *
   */
  public function collection($name)
  {
    $this->collectionName = $name;
    return $this;
  }

  /**
   *
   */
  public function sort(array $sort)
  {
    $this->sort = $sort;
    return $this;
  }

  /**
   *
   */
  public function skip($skip)
  {
    $this->skip = $skip;
    return $this;
  }

  /**
   *
   */
  public function limit($limit)
  {
    $this->limit = $limit;
    return $this;
  }

  /**
   *
   */
  public function filter(array $filter)
  {
    $this->filter = $filter;
    return $this;
  }

  /**
   *
   */
  public function populate($populate)
  {
    $this->populate = $populate;
    return $this;
  }

  /**
   *
   */
  public function all(array $fields=[])
  {
    if (! empty($fields)) {
      $this->fields = $fields;
    }

    return $this->find($this->collectionName, $this->filter, $this->sort, $this->fields, $this->populate, $this->limit, $this->skip);
  }

  /**
   *
   */
  public function one(array $fields=[])
  {
    if (! empty($fields)) {
      $this->fields = $fields;
    }

    $results = $this->find($this->collectionName, $this->filter, $this->fields, $this->fields, $this->populate, 1, $this->skip);

    if (count($results) > 0) {
      return $results[0];
    }

    return null;
  }

  /**
   *
   */
  public function first(array $fields=[])
  {
    if (! empty($fields)) {
      $this->fields = $fields;
    }

    $results = $this->find($this->collectionName, $this->filter, array('id'=>1), $this->fields, $this->populate, 1, $this->skip);

    if (count($results) > 0) {
      return $results[0];
    }

    return null;
  }

  /**
   *
   */
  public function last(array $fields=[])
  {
    if (! empty($fields)) {
      $this->fields = $fields;
    }

    $results = $this->find($this->collectionName, $this->filter, array('id'=>-1), $this->fields, $this->populate, 1, $this->skip);

    if (count($results) > 0) {
      return $results[0];
    }

    return null;
  }

  /**
   *
   */
  public function find($collectionName, array $filter, array $sort, array $fields, $populate, $limit, $skip)
  {
    if (! $collectionName) {
      throw new Exception("Collection name is required.");
    }

    if ($skip !== null && ! is_numeric($skip)) {
      throw new Exception("Skip should be numeric.");
    }

    if ($limit !== null && ! is_numeric($limit)) {
      throw new Exception("Limit should be numeric.");
    }

    $sqlTable = $collectionName;
    $sqlWhere = '';
    $sqlLimit = '';
    $sqlOrder = '';
    $sqlParams = null;

    if (! empty($fields)) {
      if (! in_array('id', $fields)) {
        array_unshift($fields, 'id');
      }

      $sqlColumns = implode(', ', $fields);
    } else {
      $sqlColumns = '*';
    }

    if (! empty($filter)) {
      $sqlParams = [];
      $and = [];

      foreach ($filter as $column=>$value) {
        if (is_array($value)) {
          $or = [];

          foreach ($value as $orColumn=>$orValue) {
            $placeholder = ':' . $column . '_' . uniqid();
            $or[] = " {$column}={$placeholder} ";
            $sqlParams[$placeholder] = $orValue;
          }

          $and[] = ' (' . implode(' OR ', $or) . ') ';
        } else {
          $placeholder = ':' . $column . '_' . uniqid();
          $and[] = " {$column}={$placeholder} ";
          $sqlParams[$placeholder] = $value;
        }
      }

      $sqlWhere = ' WHERE ' . implode(' AND ', $and);
    }

    if ($limit !== null) {
      $sqlLimit = " LIMIT {$limit} ". ($skip ? " OFFSET {$skip} ": '');
    }

    if (! empty($sort)) {
      $order = [];

      foreach ($sort as $column=>$type) {
        $order[] = " {$column} " . ($type > 0 ? ' ASC ': ' DESC ');
      }

      $sqlOrder = " ORDER BY " . implode(', ', $order);
    }

    $sql = "SELECT {$sqlColumns} FROM {$sqlTable} {$sqlWhere} {$sqlOrder} {$sqlLimit}";

    $sth = $this->connection->prepare($sql);

    try {
      if (! empty($sqlParams)) {
        if ($sth->execute($sqlParams) === false) {
          return null;
        }
      } else {
        if ($sth->execute() === false) {
          return null;
        }
      }
    } catch (PDOException $e) {
      throw new Exception($e->getMessage());
    }

    $results = $sth->fetchAll(PDO::FETCH_ASSOC);

    if (count($results) === 0) {
      return $results;
    }

    if (! empty($populate) && is_bool($populate) && $populate === true) {
      $populate = [];

      $scheme = $this->getCollectionSchema($collectionName);

      foreach ($scheme['fields'] as $field) {
        if ($field['type'] == 'collection') {
          $populate[] = $field['name'];
        }
      }
    }
    
    if (! empty($populate) && is_array($populate)) {
      foreach ($populate as $key=>$value) {
        if (is_array($value)) {
          $column = $key;
          $fields = $value;
        } else {
          $column = $value;
          $fields = null;
        }

        $fieldSchema = $this->getFieldSchema($column, $collectionName);

        if (! $fieldSchema || ! isset($fieldSchema['collection'])) {
          continue;
        }

        $populateCollectionName = $fieldSchema['collection'];
        $many = isset($fieldSchema['many']) ? (boolean) $fieldSchema['many']: false;

        if (! empty($fields)) {
          if (! in_array('id', $fields)) {
            array_unshift($fields, 'id');
          }

          $sqlColumns = implode(', ', $fields);
        } else {
          $sqlColumns = '*';
        }

        $sqlIds = [];

        if ($many) {
          foreach ($results as $result) {
            $sqlIds[] = $result['id'];
          }

          $sqlIds = array_unique($sqlIds);

          $sqlIds = implode(', ', $sqlIds);
          $sqlSecondTable = $populateCollectionName;
          $sqlFirstTable = $collectionName . ucfirst($sqlSecondTable);
          $sqlColumns = " t1.{$collectionName}Id, t2.* ";
          $sqlJoinCondition = " t1.{$sqlSecondTable}Id=t2.id ";
          $sqlWhere = " WHERE t1.{$collectionName}Id IN({$sqlIds}) ";
          
          // many to many
          $sql = "SELECT {$sqlColumns} FROM {$sqlFirstTable} AS t1 LEFT JOIN {$sqlSecondTable} AS t2 ON {$sqlJoinCondition} {$sqlWhere}";

          $sth = $this->connection->prepare($sql);

          try {
            if ($sth->execute() === false) {
              continue;
            }
          } catch (PDOException $e) {
            throw new Exception($e->getMessage());
          }

          $columnResults = $sth->fetchAll(PDO::FETCH_ASSOC);

          foreach ($results as $i=>$result) {
             $results[$i][$column] = [];

            foreach ($columnResults as $columnResult) {
              if (isset($result[$column]) && $result['id'] == $columnResult[$collectionName . 'Id']) {
                unset($columnResult[$collectionName . 'Id']);
                $results[$i][$column][] = $columnResult;
              }
            }
          }
        } else {
          foreach ($results as $result) {
            $sqlIds[] = $result[$column];
          }

          $sqlIds = array_unique($sqlIds);

          $sqlLimit = '';

          $sqlWhere = ' WHERE ' . (count($sqlIds) === 1 ? ' id=' . $sqlIds[0] . ' ': ' id IN(' . implode(', ', $sqlIds) . ') ');

          if (count($sqlIds) === 1) {
            $sqlLimit = ' LIMIT 1 ';
          }

          $sql = "SELECT {$sqlColumns} FROM {$populateCollectionName} {$sqlWhere} {$sqlLimit}";

          $sth = $this->connection->prepare($sql);

          try {
            if ($sth->execute() === false) {
              continue;
            }
          } catch (PDOException $e) {
            throw new Exception($e->getMessage());
          }

          $columnResults = $sth->fetchAll(PDO::FETCH_ASSOC);

          foreach ($results as $i=>$result) {
            foreach ($columnResults as $columnResult) {
              if (isset($result[$column]) && $result[$column] == $columnResult['id']) {
                $results[$i][$column] = $columnResult;
                break;
              }
            }
          }
        }
      }
    }

    return $results;
  }

  /**
   *
   */
  public function save(array $data, $returnRecord=false)
  {
    $sqlTable = $this->collectionName;

    $collectionSchema = $this->getCollectionSchema($this->collectionName);

    if (! $collectionSchema) {
      return false;
    }

    $sqlParams = [];

    if (isset($data['id'])) {
      $id = $data['id'];

      $sqlColumnsAndValues = [];
      $sqlWhere = " WHERE id={$id} ";

      foreach ($data as $column=>$value) {
        $fieldSchema = $this->getFieldSchema($column);

        if (! $fieldSchema) {
          continue;
        }

        $placeholder = ':' . $column . '_' . uniqid();
        $sqlColumnsAndValues[] = " {$column}={$placeholder} ";
        $sqlParams[$placeholder] = $value;
      }

      $sqlColumnsAndValues = implode(', ', $sqlColumnsAndValues);

      $sql = "UPDATE {$sqlTable} SET {$sqlColumnsAndValues} {$sqlWhere}";
    } else {
      $sqlColumns = [];

      foreach ($data as $column=>$value) {
        $fieldSchema = $this->getFieldSchema($column);

        if (! $fieldSchema) {
          continue;
        }

        $placeholder = ':' . $column . '_' . uniqid();
      
        $sqlColumns[] = $column;
        $sqlParams[$placeholder] = $value;
      }

      $sqlValues = implode(', ', array_keys($sqlParams));

      $sqlColumns = implode(', ', $sqlColumns);

      $sql = "INSERT INTO {$sqlTable}({$sqlColumns}) VALUES({$sqlValues})";
    }

    $sth = $this->connection->prepare($sql);

    if ($sth->execute($sqlParams) === false) {
      return false;
    }

    if ($returnRecord) {
      $id = isset($data['id']) ? $data['id']: $this->connection->lastInsertId();

      return $this->collection($this->collectionName)->filter([ 'id'=>$id ])->one();
    }

    return true;
  }

  /**
   *
   */
  public function saveMany(array $batchData)
  {
    foreach ($batchData as $data) {
      $this->save($data);
    }
  }
}