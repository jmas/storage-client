(function(a) {

var baseUrl = 'api.php';

var app = a.module('app', [
  'ngRoute',
  'textAngular',
  'flash',
  'ngRepeatReorder'
]);

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider.
    when('/collections', {
      templateUrl: 'partials/collections-list.html',
      controller: 'CollectionsListCtrl'
    }).
    when('/collection/:collectionName/edit', {
      templateUrl: 'partials/collection-edit.html',
      controller: 'CollectionEditCtrl'
    }).
    when('/collection/create', {
      templateUrl: 'partials/collection-edit.html',
      controller: 'CollectionEditCtrl'
    }).
    when('/collection/:collectionName/entries', {
      templateUrl: 'partials/entries-list.html',
      controller: 'EntriesListCtrl'
    }).
    when('/collection/:collectionName/entry/:entryId/edit', {
      templateUrl: 'partials/entry-edit.html',
      controller: 'EntryEditCtrl'
    }).
    when('/collection/:collectionName/entry/create', {
      templateUrl: 'partials/entry-edit.html',
      controller: 'EntryEditCtrl'
    }).
    otherwise({
      redirectTo: '/collections'
    });
});

app.run(function(CollectionService) {
  CollectionService.load();
});

app.directive('field', function() {
  return {
    restrict: 'E',
    scope: {
      options: '=',
      value: '=',
      name: '=',
      entry: '='
    },
    templateUrl: 'partials/field.html'
  };
});

app.factory("AppService", function() {
  var app = {
    breadcrumbs: []
  };

  return {
    setBreadcrumbs: function(breadcrumbs)
    {
      app.breadcrumbs = breadcrumbs;
    },
    getBreadcrumbs: function()
    {
      return app.breadcrumbs;
    }
  };
});

app.factory("CollectionService", function($http) {
  var data = {
    collections: []
  };

  return {
    load: function()
    {
      var self = this;

      return $http({method: 'GET', url: baseUrl + '/collections'}).success(function(result) {
        self.setCollections(result);
      });
    },
    loadEntries: function(collectionName)
    {
      var collection = this.getByName(collectionName);
      var self = this;

      if (typeof collection.entries != 'undefined') {
        collection.entries.splice(0, collection.entries.length);
      }

      return $http({method: 'GET', url: baseUrl + '/collection/' + collection.name + '/entries'}).success(function(result) {
        self.setEntries(collectionName, result);
      });
    },
    setCollections: function(items)
    {
      for (var i=0,len=items.length; i<len; i++) {
        items[i]._name = items[i].name;

        if (typeof items[i].fields != 'undefined') {
          for (var j=0,jlen=items[i].fields.length; j<jlen; j++) {
            items[i].fields[j]._name = items[i].fields[j].name;
          }
        }

        this.add(items[i]);
        // data.collections.push(items[i]);  
      }
    },
    setEntries: function(collectionName, items)
    {
      var collection = this.getByName(collectionName);

      if (typeof collection.entries == 'undefined') {
        collection.entries = [];
      }

      for (var i=0,len=items.length; i<len; i++) {
        collection.entries.push(items[i]);
      }
    },
    all: function()
    {
      return data.collections;
    },
    getById: function(id)
    {
      for (var i=0,len=data.collections.length; i<len; i++) {
        if (data.collections[i].id == id) {
          return data.collections[i];
        }
      }

      return null;
    },
    getByName: function(name)
    {
      for (var i=0,len=data.collections.length; i<len; i++) {
        if (data.collections[i].name == name) {
          return data.collections[i];
        }
      }

      return null;
    },
    getIndexByName: function(name)
    {
      for (var i=0,len=data.collections.length; i<len; i++) {
        if (data.collections[i].name == name) {
          return i;
        }
      }

      return null;
    },
    getByIndex: function(index)
    {
      return data.collections[index] || null;
    },
    set: function(collectionName, collectionData)
    {
      var collection = this.getByName(collectionName);
      
      for (var k in collectionData) {
        collection[k] = collectionData[k];
      }
    },
    getEntryById: function(collectionName, entryId)
    {
      var collection = this.getByName(collectionName);

      if (! collection || typeof collection.entries == 'undefined') {
        return null;
      }

      for (var i=0,len=collection.entries.length; i<len; i++) {
        if (collection.entries[i].id == entryId) {
          return collection.entries[i];
        }
      }

      return null;
    },
    getEntryByIndex: function(collectionName, entryId)
    {
      var collection = this.getByName(collectionName);

      if (! collection.entries) {
        return null;
      }

      return collection.entries[entryId] || null;
    },
    addField: function(collectionName, data)
    {
      var collection = this.getByName(collectionName);

      // if (typeof collection.fields == 'undefined' || collection.fields === null) {
      //   collection.fields = [];
      // }

      data = data || {};

      collection.fields.push(data);

      // collection.fields[index] = (typeof data == 'object' ? data: {});
    },
    removeField: function(collectionName, index)
    {
      var collection = this.getByName(collectionName);

      collection.fields.splice(index, 1);
    },
    removeCollection: function(collectionName)
    {
      // for (var i=0,len=collections.length; i<len; i++) {
      //   if (collections[i].id == collectionId) {
      //     collections.splice(i, 1);
      //     break;
      //   }
      // }

      // data.collections.splice(collectionId, 1);
    },
    add: function(item)
    {
      var length = data.collections.push(item);
      // return collections[length - 1];
      return length - 1;
    },
    addEntry: function(collectionName, entry)
    {
      var entry = entry || { id: null };

      var collection = this.getByName(collectionName);

      if (! collection) {
        return null;
      }

      if (typeof collection.entries == 'undefined') {
        collection.entries = [];
      }

      for (var i=0,len=collection.fields.length; i<len; i++) {
        var item = collection.fields[i];
        entry[item.name] = null;
      }

      var length = collection.entries.push(entry);
      // return collection.entries[length - 1];
      return length - 1;
    },
    setEntry: function(collectionName, entry)
    {
      var collection = this.getByName(collectionName);
      var isFound = false;

      if (typeof collection.entries == 'undefined') {
        collection.entries = [];
      }

      for (var i=0, len=collection.entries.length; i<len; i++) {
        if (collection.entries[i].id == entry.id) {
          collection.entries[i] = entry;
          isFound = true;
          break;
        }
      }

      if (! isFound) {
        collection.entries.push(entry);
      }
    },
    save: function(collectionName)
    {
      var self = this;

      var collection = this.getByName(collectionName);

      if (typeof collection._name == 'undefined') {
        collection._name = collection.name;
      }

      var name = collection._name;

      var data = {};

      for (var i in collection.fields) {
        if (typeof collection.fields[i]._name == 'undefined') {
          collection.fields[i]._name = collection.fields[i].name;
        }
      }

      for (var k in collection) {
        if (k == 'entries') {
          continue;
        }

        data[k] = collection[k]; 
      }

      return $http({method: 'POST', data: data, url: '/orm/collection/' + name})
        .success(function(data) {
          if (typeof data.error == 'undefined') {
            self.set(collectionName, data);
          }
        });
    },
    saveEntry: function(collectionName, entryId)
    {
      var self = this;
      var collection = this.getByName(collectionName);
      var entry = this.getEntryById(collectionName, entryId);

      for (var k in entry) {
        if (k == 'id' && entry.id === null) {
          delete entry.id;
          break;
        }
      }

      // console.log(collection);
      return $http({method: 'POST', data: entry, url: baseUrl + '/collection/' + collection.name + '/entry'})
        .success(function(result) {
          if (typeof data.error == 'undefined') {
            self.setEntry(collectionName, result);
          }
        });
    }
  };
});

app.controller('BreadcrumbsCtrl', function($scope, AppService) {
  $scope.app = AppService;
});

app.controller('EntryEditCtrl', function($scope, $routeParams, $location, AppService, CollectionService, flash) {
  var collectionName = $routeParams.collectionName;
  var entryId = $routeParams.entryId || null;

  $scope.collection = CollectionService.getByName(collectionName);
  $scope.entry = CollectionService.getEntryById(collectionName, entryId);

  if (! $scope.entry) {
    CollectionService.addEntry(collectionName);
    $scope.entry = CollectionService.getEntryById(collectionName, null);
  }

  $scope.save = function(redirect)
  {
    CollectionService.saveEntry($scope.collection.name, $scope.entry.id).success(function(data) {
      if (typeof data.error == 'undefined') {
        flash('success', 'Saved successfully!');
      }
    }).then(function(response) {
      if (entryId === null && redirect !== false) {
        $location.path('/collection/' + $scope.collection.name + '/entry/' + response.data.id + '/edit');
      }
    });
  };

  $scope.saveAndClose = function()
  {
    $location.path('/collection/' + $scope.collection.name + '/entries');
    $scope.save(false);
  };

  AppService.setBreadcrumbs([{
    path: 'collections',
    name: 'Collections'
  }, {
    path: 'collection/' + $scope.collection.name + '/entries',
    name: 'Collection' + ' ' + $scope.collection.name + ' ' + 'entries'
  }, $scope.entry.id ? 'Edit entry': 'Create entry']);
});

app.controller('EntriesListCtrl', function($scope, $routeParams, $location, AppService, CollectionService) {
  var collectionName = $routeParams.collectionName;

  CollectionService.loadEntries(collectionName);

  $scope.collectionName = collectionName;
  
  $scope.selectedEntries = [];

  $scope.collection = CollectionService.getByName(collectionName);

  if (! $scope.collection) {
    $location.path('/collections');
    return;
  }

  $scope.selectEntry = function(entryId)
  {
    var index = $scope.selectedEntries.indexOf(entryId);

    if (index == -1) {
      $scope.selectedEntries.push(entryId);
    } else {
      $scope.selectedEntries.splice(index, 1);
    }
  };

  $scope.isSelectedEntry = function(entryId)
  {
    return ($scope.selectedEntries.indexOf(entryId) >= 0);
  };

  $scope.selectAll = function()
  {
    var entries = $scope.collection.entries;

    if (! entries) {
      return;
    }

    for (var i=0,len=entries.length; i<len; i++) {
      if ($scope.selectedEntries.indexOf(i) == -1) {
        $scope.selectedEntries.push(i);
      }
    }
  };

  $scope.deselectAll = function()
  {
    $scope.selectedEntries = [];
  };

  $scope.isAllSelected = function()
  {
    if (! $scope.selectedEntries || ! $scope.collection.entries) {
      return null;
    }

    return $scope.selectedEntries.length == $scope.collection.entries.length;
  };

  $scope.isSelected = function()
  {
    return $scope.selectedEntries && $scope.selectedEntries.length > 0;
  };

  $scope.toDate = function(unixtime)
  {
    var date = new Date(parseInt(unixtime) * 1000);
    return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
  };

  AppService.setBreadcrumbs([{
    path: 'collections',
    name: 'Collections'
  }, 'Collection' + ' ' + $scope.collection.name + ' ' + 'entries' ]);
});

app.controller('CollectionsListCtrl', function($scope, AppService, CollectionService) {
  AppService.setBreadcrumbs(['Collections']);

  $scope.collections = CollectionService.all();

  $scope.removeCollection = function(collectionName) {
    CollectionService.removeCollection(collectionName);
  };
});

app.controller('CollectionEditCtrl', function($scope, $routeParams, $location, AppService, CollectionService, flash) {
  var collectionName = $routeParams.collectionName || null;

  $scope.collectionName = collectionName;
  $scope.collection = CollectionService.getByName(collectionName);
  
  if (! $scope.collection) {
    CollectionService.add({
      name: null,
      fields: [
        {
          name: '',
          sort: 1,
          type: 'text',
          label: '',
          defaultValue: '',
          required: false,
          displayed: true
        }
      ]
    });

    $scope.collection = CollectionService.getByName(null);
  }

  $scope.activeFieldIndex = null;

  $scope.toggleField = function(index)
  {
    if ($scope.activeFieldIndex == index) {
      $scope.activeFieldIndex = null;
    } else {
      $scope.activeFieldIndex = index;
    }
  };

  $scope.addField = function()
  {
    CollectionService.addField($scope.collection.name, {
      name: null,
      sort: 1,
      type: 'text',
      label: '',
      defaultValue: '',
      required: false,
      displayed: true
    });
  };

  $scope.removeField = function(index)
  {
    CollectionService.removeField($scope.collection.name, index);
  };

  $scope.save = function()
  {
    CollectionService.save($scope.collection.name)
      .then(function(data) {
        flash('success', 'Saved successfully!');

        if (collectionName === null) {
          $location.path('/collection/' + $scope.collection.name + '/edit');
        }
      });

    // CollectionService.save(collectionId);
  };

  $scope.saveAndClose = function()
  {
    $location.path('/collections');
    $scope.save($scope.collection.name);
  };

  AppService.setBreadcrumbs([{
    path: 'collections',
    name: 'Collections'
  }, $scope.collection.name ? 'Edit collection' + ' ' + $scope.collection.name: 'Create collection' ]);
});

})(angular);