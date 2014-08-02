(function(a) {

var app = a.module('app', [
  'ngRoute',
  'textAngular',
  'flash',
  'ngRepeatReorder'
]);

app.config(function($routeProvider) {
  $routeProvider.
    when('/collections', {
      templateUrl: 'partials/collections-list.html',
      controller: 'CollectionsListCtrl'
    }).
    when('/collection/:id/edit', {
      templateUrl: 'partials/collection-edit.html',
      controller: 'CollectionEditCtrl'
    }).
    when('/collection/create', {
      templateUrl: 'partials/collection-edit.html',
      controller: 'CollectionEditCtrl'
    }).
    when('/collection/:id/entries', {
      templateUrl: 'partials/entries-list.html',
      controller: 'EntriesListCtrl'
    }).
    when('/collection/:collectionId/entry/:entryId/edit', {
      templateUrl: 'partials/entry-edit.html',
      controller: 'EntryEditCtrl'
    }).
    when('/collection/:collectionId/entry/create', {
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
    setBreadcrumbs: function(breadcrumbs) {
      app.breadcrumbs = breadcrumbs;
    },
    getBreadcrumbs: function() {
      return app.breadcrumbs;
    }
  };
});

app.factory("CollectionService", function($http) {
  var data = {
    collections: []
  };
  // var collections = [
  //   {
  //     id: 1,
  //     name: 'First Collection',
  //     sort: null,
  //     fields: [
  //       {
  //         name: 'first',
  //         sort: 1,
  //         type: 'text',
  //         label: 'Text example',
  //         defaultValue: 'first field value',
  //         required: true,
  //         displayed: true
  //       },
  //       {
  //         name: 'second',
  //         sort: 1,
  //         type: 'select',
  //         label: 'Select example',
  //         defaultValue: 'second field value',
  //         required: true,
  //         options: ['item 1', 'item 2', 'item 3']
  //       },
  //       {
  //         name: 'three',
  //         sort: 1,
  //         type: 'boolean',
  //         label: 'Boolean example',
  //         defaultValue: 'default value',
  //         required: true
  //       },
  //       {
  //         name: 'four',
  //         sort: 1,
  //         type: 'wysiwyg',
  //         label: 'Wysiwyg example',
  //         defaultValue: 'default value'
  //       }
  //     ],
  //     entries: [
  //       {
  //         id: 1,
  //         first: 'Hello 1',
  //         second: 'item 1',
  //         three: true,
  //         modified: 1406226504
  //       },
  //       {
  //         id: 2,
  //         first: 'Hello 2',
  //         second: 'World 2',
  //         modified: 1406226504
  //       },
  //       {
  //         id: 3,
  //         first: 'Hello 3',
  //         second: 'World 3',
  //         modified: 1406226504
  //       }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: 'Second Collection',
  //     sort: null,
  //     fields: [
  //       {
  //         name: 'first',
  //         sort: 1,
  //         type: 'text',
  //         label: 'First',
  //         defaultValue: 'first field value',
  //         required: true
  //       },
  //       {
  //         name: 'second',
  //         sort: 1,
  //         type: 'text',
  //         label: 'Second',
  //         defaultValue: 'second field value',
  //         required: true
  //       }
  //     ]
  //   }
  // ];

  return {
    load: function() {
      var self = this;

      return $http({method: 'GET', url: '/orm/collections'}).success(function(result) {
        self.setCollections(result);
      });
    },
    loadEntries: function(collectionIndex) {
      var collection = this.getByIndex(collectionIndex);
      var self = this;

      if (typeof collection.entries != 'undefined') {
        collection.entries.splice(0, collection.entries.length);
      }

      return $http({method: 'GET', url: '/orm/collection/' + collection.name + '/entries'}).success(function(result) {
        self.setEntries(collectionIndex, result);
      });
    },
    setCollections: function(items) {
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
    setEntries: function(collectionIndex, items) {
      var collection = this.getByIndex(collectionIndex);

      if (typeof collection.entries == 'undefined') {
        collection.entries = [];
      }

      for (var i=0,len=items.length; i<len; i++) {
        collection.entries.push(items[i]);
      }
    },
    all: function() {
      return data.collections;
    },
    getById: function(id) {
      for (var i=0,len=data.collections.length; i<len; i++) {
        if (data.collections[i].id == id) {
          return data.collections[i];
        }
      }

      return null;
    },
    getByIndex: function(index) {
      return data.collections[index] || null;
    },
    set: function(index, data) {
      data.collections[index] = data;
    },
    getEntryById: function(collectionId, entryId) {
      var collection = this.getByIndex(collectionId);

      if (! collection.entries) {
        return null;
      }

      for (var i=0,len=collection.entries.length; i<len; i++) {
        if (collection.entries[i].id == entryId) {
          return collection.entries[i];
        }
      }

      return null;
    },
    getEntryByIndex: function(collectionId, entryId) {
      var collection = this.getByIndex(collectionId);

      if (! collection.entries) {
        return null;
      }

      return collection.entries[entryId] || null;
    },
    addField: function(collectionId, data) {
      var collection = this.getByIndex(collectionId);

      // if (typeof collection.fields == 'undefined' || collection.fields === null) {
      //   collection.fields = [];
      // }

      data = data || {};

      collection.fields.push(data);

      // collection.fields[index] = (typeof data == 'object' ? data: {});
    },
    removeField: function(collectionId, index) {
      var collection = this.getByIndex(collectionId);

      collection.fields.splice(index, 1);
    },
    removeCollection: function(collectionId) {
      // for (var i=0,len=collections.length; i<len; i++) {
      //   if (collections[i].id == collectionId) {
      //     collections.splice(i, 1);
      //     break;
      //   }
      // }

      // data.collections.splice(collectionId, 1);
    },
    add: function(item) {
      var length = data.collections.push(item);
      // return collections[length - 1];
      return length - 1;
    },
    addEntry: function(collectionId) {
      var entry = {};

      var collection = this.getByIndex(collectionId);

      if (! collection.entries) {
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
    save: function(collectionId) {
      var self = this;

      var collection = this.getByIndex(collectionId);

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
            self.set(collectionId, data);
          }
        });

      // var collections = [];

      // for (var i=0,len=data.collections.length; i<len; i++) {
      //   var item=data.collections[i];
      //   collections.push({
      //     name: item.name,
      //     fields: item.fields
      //   });
      // }

      // console.log(data.collections);      
    },
    saveEntry: function(collectionIndex, entryIndex) {
      var collection = this.getByIndex(collectionIndex);
      var entry = this.getEntryByIndex(collectionIndex, entryIndex);
      // console.log(collection);
      return $http({method: 'POST', data: entry, url: '/orm/collection/' + collection.name + '/entry'})
        .success(function(data) {
          if (typeof data.error == 'undefined') {
            // self.set(collectionId, data);
          }
        });
    }
  };
});

app.controller('BreadcrumbsCtrl', function($scope, AppService) {
  $scope.app = AppService;
});

app.controller('EntryEditCtrl', function($scope, $routeParams, $location, AppService, CollectionService, flash) {
  var collectionId = $routeParams.collectionId;
  var entryId = $routeParams.entryId;

  $scope.collection = CollectionService.getByIndex(collectionId);
  $scope.entry = CollectionService.getEntryByIndex(collectionId, entryId);

  if (! $scope.entry) {
    entryId = CollectionService.addEntry(collectionId);
    $scope.entry = CollectionService.getEntryByIndex(collectionId, entryId);
  }

  $scope.save = function() {
    // flash('success', 'Sorry, can\'t save.');

    CollectionService.saveEntry(collectionId, entryId).success(function(data) {
      console.log('save', data);
      if (typeof data.error == 'undefined') {
        flash('success', 'Saved successfully!');
      }
    });
  };

  $scope.saveAndClose = function() {
    $location.path('/collection/' + collectionId + '/entries');
    $scope.save();
  };

  AppService.setBreadcrumbs([{
    path: '/collections',
    name: 'Collections'
  }, {
    path: '/collection/' + collectionId + '/entries',
    name: $scope.collection.name
  }, 'Entry']);
});

app.controller('EntriesListCtrl', function($scope, $routeParams, $location, AppService, CollectionService) {
  var collectionId = $routeParams.id;

  CollectionService.loadEntries(collectionId);

  $scope.collectionId = collectionId;
  
  $scope.selectedEntries = [];

  $scope.collection = CollectionService.getByIndex(collectionId);

  if (! $scope.collection) {
    $location.path('/collections');
    return;
  }

  $scope.selectEntry = function(entryId) {
    var index = $scope.selectedEntries.indexOf(entryId);

    if (index == -1) {
      $scope.selectedEntries.push(entryId);
    } else {
      $scope.selectedEntries.splice(index, 1);
    }
  };

  $scope.isSelectedEntry = function(entryId) {
    return ($scope.selectedEntries.indexOf(entryId) >= 0);
  };

  $scope.selectAll = function() {
    var entries = $scope.collection.entries;

    if (! entries) {
      return;
    }

    for (var i=0,len=entries.length; i<len; i++) {
      if ($scope.selectedEntries.indexOf(entries[i].id) == -1) {
        $scope.selectedEntries.push(entries[i].id);
      }
    }
  };

  $scope.deselectAll = function() {
    $scope.selectedEntries = [];
  };

  $scope.isAllSelected = function() {
    if (! $scope.selectedEntries || ! $scope.collection.entries) {
      return null;
    }

    return $scope.selectedEntries.length == $scope.collection.entries.length;
  };

  $scope.isSelected = function() {
    return $scope.selectedEntries && $scope.selectedEntries.length > 0;
  };

  $scope.toDate = function(unixtime) {
    var date = new Date(parseInt(unixtime) * 1000);
    return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
  };

  AppService.setBreadcrumbs([{
    path: '/collections',
    name: 'Collections'
  }, 'Entries of' + ' ' + $scope.collection.name ]);
});

app.controller('CollectionsListCtrl', function($scope, AppService, CollectionService) {
  AppService.setBreadcrumbs(['Collections']);

  $scope.collections = CollectionService.all();

  // $scope.$on('appInitialized', function() {
  //   CollectionService.load();
  // });

  $scope.removeCollection = function(collectionId) {
    CollectionService.removeCollection(collectionId);
  };
});

app.controller('CollectionEditCtrl', function($scope, $routeParams, $location, AppService, CollectionService, flash) {
  var collectionId = $routeParams.id || null;
  
  $scope.collection = CollectionService.getByIndex(collectionId);
  
  if (! $scope.collection) {
    collectionId = CollectionService.add({
      name: '',
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

    $scope.collection = CollectionService.getByIndex(collectionId);
  }

  $scope.activeFieldIndex = null;

  $scope.toggleField = function(index) {
    if ($scope.activeFieldIndex == index) {
      $scope.activeFieldIndex = null;
    } else {
      $scope.activeFieldIndex = index;
    }
  };

  $scope.addField = function() {
    CollectionService.addField(collectionId, {
      name: '',
      sort: 1,
      type: 'text',
      label: '',
      defaultValue: '',
      required: false,
      displayed: true
    });
  };

  $scope.removeField = function(index) {
    CollectionService.removeField(collectionId, index);
  };

  $scope.save = function() {
    CollectionService.save(collectionId)
      .then(function(data) {
        flash('success', 'Saved successfully!');
      });

    // CollectionService.save(collectionId);
  };

  $scope.saveAndClose = function() {
    $location.path('/collections');
    $scope.save();
  };

  AppService.setBreadcrumbs([{
    path: '/collections',
    name: 'Collections'
  }, $scope.collection.name ]);
});

})(angular);