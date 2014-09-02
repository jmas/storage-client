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

  private $params=[];

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
  public function updateCollectionSchema($currentCollectionName, $collectionSchema)
  {
    $collectionName = $collectionSchema['name'];
    $currentCollectionSchema = $this->getCollectionSchema($currentCollectionName);

    $batchSql = [];

    if (! $currentCollectionSchema) {
      // create table
      $batchSql[] = "CREATE TABLE IF NOT EXISTS {$currentCollectionName} (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, createdAt DATETIME, updatedAt DATETIME)";

      $currentCollectionSchema = [
        'name' => $currentCollectionName,
        'fields' => [],
      ];
    }

    $collectionFields = $collectionSchema['fields'];
    $currentCollectionFields = $currentCollectionSchema['fields'];

    // rename, change type for existing fields
    foreach ($collectionFields as $collectionField) {
      $isFieldExists = false;

      foreach ($currentCollectionFields as $currentCollectionField) {
        if ($collectionField['_name'] == $currentCollectionField['name']) {
          $isFieldExists = true;

          if ($collectionField['type'] == 'collectionMany') {
            break;
          }

          if ($collectionField['name'] != $currentCollectionField['name'] || $collectionField['type'] != $currentCollectionField['type']) {
            // rename field OR change field type
            $fieldSqlType = $this->generateFieldSqlType($collectionField);

            $batchSql[] = "ALTER TABLE {$currentCollectionName} CHANGE {$currentCollectionField['name']} {$collectionField['name']} {$fieldSqlType}";
          }

          break;
        }
      }

      if (! $isFieldExists) {
        if ($collectionField['type'] != 'collectionMany') {
          // create new field
          $fieldSqlType = $this->generateFieldSqlType($collectionField);

          $batchSql[] = "ALTER TABLE {$currentCollectionName} ADD {$collectionField['name']} {$fieldSqlType}";
        } else {
          // create junction table
          $tableName = $this->makeJunctionTableName($collectionName, $collectionField['collection']);

          $batchSql[] = "CREATE TABLE IF NOT EXISTS {$tableName}({$collectionField['collection']}Id INT, {$collectionName}Id INT)";
        }
      }
    }

    // drop removed fields
    foreach ($currentCollectionFields as $currentCollectionField) {
      $isFieldExists = false;

      foreach ($collectionFields as $collectionField) {
        if ($currentCollectionField['name'] == $collectionField['_name']) {
          $isFieldExists = true;
          break;
        }
      }

      if (! $isFieldExists) {
        if ($currentCollectionField['type'] != 'collectionMany') {
          // drop field
          $batchSql[] = "ALTER TABLE {$currentCollectionName} DROP {$currentCollectionField['name']}";
        }
      }
    }

    // check for renaming current collection
    if ($currentCollectionName != $collectionName) {
      // update table name
      $batchSql[] = "ALTER TABLE {$currentCollectionName} RENAME {$collectionName}";
    }

    // remove _name property form schema and fields
    unset($collectionSchema['_name']);

    for ($i=0, $len=count($collectionSchema['fields']); $i<$len; $i++) {
      unset($collectionSchema['fields'][$i]['_name']);
    }

    // update current collection schema
    $isCollectionExists = false;

    for ($i=0, $len=count($this->schema); $i<$len; $i++) {
      if ($this->schema[$i]['name'] == $collectionName) {
        $this->schema[$i] = $collectionSchema;
        $isCollectionExists = true;
        break;
      }
    }

    // add new collection
    if (! $isCollectionExists) {
      $this->schema[] = $collectionSchema;
    }
    
    // execute batch sql
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
  public function removeCollection($collectionName)
  {
    foreach ($this->schema as $i => $collection) {
      if ($collection['name'] == $collectionName) {
        $sql = "DROP TABLE {$collection['name']}";
        $sth = $this->connection->prepare($sql);
        
        array_splice($this->schema, $i, 1);

        if ($sth->execute() !== false) {
          return true;
        }
      }
    }

    return false;
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
  public function exists()
  {
    return $this->count() > 0 ? true: false;
  }

  /**
   *
   */
  public function count()
  {
    $collectionName = $this->collectionName;
    $filter = $this->filter;
    $sort = $this->sort;
    $fields = $this->fields;
    $populate = $this->populate;
    $limit = $this->limit;
    $skip = $this->skip;

    $this->reset();

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

    if (! empty($filter)) {
      $sqlWhere = ' WHERE ' . $this->buildFilterSql($filter) . ' ';
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

    $sql = "SELECT COUNT(*) AS length FROM {$sqlTable} {$sqlWhere} {$sqlOrder} {$sqlLimit}";

    $sth = $this->connection->prepare($sql);

    if (! empty($this->params)) {
      foreach ($this->params as $key => $value) {
        $type = PDO::PARAM_STR;

        if (is_int($value)) {
          $type = PDO::PARAM_INT;
        }

        $sth->bindValue($key, $value, $type);
      }
    }

    try {
      if ($sth->execute() === false) {
        return null;
      }
    } catch (PDOException $e) {
      throw new Exception($e->getMessage());
    }

    $result = $sth->fetch(PDO::FETCH_ASSOC);

    return $result['length'];
  }

  /**
   *
   */
  public function find($collectionName, array $filter, array $sort, array $fields, $populate, $limit, $skip)
  {
    $this->reset();

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
      $sqlWhere = ' WHERE ' . $this->buildFilterSql($filter) . ' '; //implode(' AND ', $and);
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

    if (! empty($this->params)) {
      foreach ($this->params as $key => $value) {
        $type = PDO::PARAM_STR;

        if (is_int($value)) {
          $type = PDO::PARAM_INT;
        }

        $sth->bindValue($key, $value, $type);
      }
    }

    try {
      if ($sth->execute() === false) {
        return null;
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
        if ($field['type'] == 'collectionOne' || $field['type'] == 'collectionMany') {
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
        $many = $fieldSchema['type'] == 'collectionMany' ? true: false;

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
          $sqlFirstTable = $this->makeJunctionTableName($collectionName, $sqlSecondTable);
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
              if ($result['id'] == $columnResult[$collectionName . 'Id']) {
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
          $sqlIds = array_filter($sqlIds);

          $sqlLimit = '';

          if (! empty($sqlIds)) {
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

        if (! $fieldSchema || $fieldSchema['type'] == 'collectionMany') {
          continue;
        }

        $placeholder = ':' . $column . '_' . uniqid();
        $sqlColumnsAndValues[] = " {$column}={$placeholder} ";
        $sqlParams[$placeholder] = (is_array($value) ? $value['id']: $value);
      }

      array_push($sqlColumnsAndValues, ' updatedAt=NOW() ');

      $sqlColumnsAndValues = implode(', ', $sqlColumnsAndValues);

      $sql = "UPDATE {$sqlTable} SET {$sqlColumnsAndValues} {$sqlWhere}";
    } else {
      $sqlColumns = [];

      foreach ($data as $column=>$value) {
        $fieldSchema = $this->getFieldSchema($column);

        if (! $fieldSchema || $fieldSchema['type'] == 'collectionMany') {
          continue;
        }

        $placeholder = ':' . $column . '_' . uniqid();
      
        $sqlColumns[] = $column;
        $sqlParams[$placeholder] = (is_array($value) ? $value['id']: $value);
      }

      array_push($sqlColumns, 'createdAt');
      array_push($sqlColumns, 'updatedAt');

      $sqlValues = array_keys($sqlParams);

      array_push($sqlValues, 'NOW()');
      array_push($sqlValues, 'NOW()');

      $sqlColumns = implode(', ', $sqlColumns);
      $sqlValues = implode(', ', $sqlValues);

      $sql = "INSERT INTO {$sqlTable}({$sqlColumns}) VALUES({$sqlValues})";
    }
    
    $sth = $this->connection->prepare($sql);

    if ($sth->execute($sqlParams) === false) {
      return false;
    }

    $id = isset($data['id']) ? $data['id']: $this->connection->lastInsertId();

    $batchSql = [];

    foreach ($data as $column=>$value) {
      $fieldSchema = $this->getFieldSchema($column);

      if ($fieldSchema['type'] != 'collectionMany') {
        continue;
      }

      $junctionTableName = $this->makeJunctionTableName($sqlTable, $fieldSchema['collection']);
      $columnIdName = "{$sqlTable}Id";
      $fieldCollectionIdName = "{$fieldSchema['collection']}Id";
      $batchSql[] = "DELETE FROM {$junctionTableName} WHERE {$columnIdName}={$id}";

      if (is_array($value)) {
        foreach ($value as $item) {
          if (isset($item['id'])) {
            $itemId = $item['id'];
          } else if (is_numeric($item)) {
            $itemId = $item;
          } else {
            continue;
          }

          $batchSql[] = "INSERT INTO {$junctionTableName}({$columnIdName}, {$fieldCollectionIdName}) VALUES({$id}, {$itemId})";
        }
      }
    }

    if (count($batchSql) > 0) {
      foreach ($batchSql as $sql) {
        $sth = $this->connection->prepare($sql);

        if ($sth->execute() === false) {
          return false;
        }
      }
    }

    if ($returnRecord) {
      return $this->collection($this->collectionName)->filter([ 'id'=>$id ])->populate(true)->one();
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

  /**
   *
   */
  public function remove(array $ids)
  {
    $sqlTable = $this->collectionName;

    $this->reset();

    foreach ($ids as $i => $value) {
      $ids[$i] = (int) $value;
    }

    $sqlIds = implode(', ', $ids);

    $sql = "DELETE FROM {$sqlTable} WHERE id IN ($sqlIds)";

    $sth = $this->connection->prepare($sql);

    if ($sth->execute() !== false) {
      return true;
    }

    return false;
  }

  /**
   *
   */
  private function makeJunctionTableName($firstTableName, $secondTableName)
  {
    $names = [$firstTableName, $secondTableName];

    sort($names);

    for ($i=1; $i<count($names); $i++) {
      $names[$i] = ucfirst($names[$i]);
    }

    $names = implode('', $names);

    return $names;
  }

  /**
   *
   */
  private function generateFieldSqlType($field)
  {
    $sql = ' VARCHAR(1000) ';

    switch ($field['type']) {
      case 'text':
      case 'password':
      case 'select':
        $sql = ' VARCHAR(1000) ';
        break;
      case 'boolean':
        $sql = ' INT(1) DEFAULT "' . (isset($field['defaultValue']) && $field['defaultValue'] === true ? '1': '0') . '" ';
        break;
      case 'multiline':
      case 'wysiwyg':
        $sql = ' TEXT ';
        break;
      case 'datetime':
        $sql = ' DATETIME ';
        break;
      case 'number':
        $sql = ' INT DEFAULT "' . (isset($field['defaultValue']) && $field['defaultValue'] === true ? (int)$field['defaultValue']: '0') . '" ';
        break;
      case 'float':
        $sql = ' FLOAT DEFAULT "' . (isset($field['defaultValue']) && $field['defaultValue'] === true ? (float)$field['defaultValue']: '0') . '" ';
        break;
      case 'collectionOne':
        $sql = ' INT ';
        break;
    }

    return $sql;
  }

  /**
   *
   */
  private function reset()
  {
    $this->collectionName = null;
    $this->fields = [];
    $this->sort = [];
    $this->limit = null;
    $this->skip = null;
    $this->filter = [];
    $this->populate = [];

    $this->params = [];
  }

  /**
   *
   */
  private function isAssocArray($array)
  {
    foreach ($array as $a => $b) {
        if (! is_int($a)) {
            return true;
        }
    }

    return false;
  }

  /**
   *
   */
  private function buildFilterSql(array $filters)
  {
    if ($this->isAssocArray($filters)) {
      $or = [];

      foreach ($filters as $field => $value) {
        if (is_array($value) && $this->isAssocArray($value)) {
          if (isset($value['from'])) {
            $placeholder = ':' . $field . '_' . uniqid();
            $or[] = " {$field} >= {$placeholder} ";
            $this->params[$placeholder] = $value['from'];
          }

          if (isset($value['to'])) {
            $placeholder = ':' . $field . '_' . uniqid();
            $or[] = " {$field} <= {$placeholder} ";
            $this->params[$placeholder] = $value['to'];
          }

          if (isset($value['like'])) {
            $placeholder = ':' . $field . '_' . uniqid();
            $or[] = " {$field} LIKE {$placeholder} ";
            $this->params[$placeholder] = $value['like'];
          }
        } else if (is_array($value)) {
          foreach ($value as $fieldName=>$fieldValue) {
            $placeholder = ':' . $fieldName . '_' . uniqid();
            $or[] = " {$fieldName} = {$placeholder} ";
            $this->params[$placeholder] = $fieldValue;
          }
        } else {
          $placeholder = ':' . $field . '_' . uniqid();
          $or[] = " {$field} = {$placeholder} ";
          $this->params[$placeholder] = $value;
        }
      }

      return ' (' . implode(' OR ', $or) . ') ';
    } else {
      $and = [];

      foreach ($filters as $filter) {
        $and[] = $this->buildFilterSql($filter);
      }

      return implode(' AND ', $and);
    }
  }
}