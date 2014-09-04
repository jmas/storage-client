(function(a) {

var apiUrl = localStorage.apiUrl;

var app = a.module('app', [
  'ngRoute',
  'textAngular',
  'ngRepeatReorder',
  'angular-loading-bar',
  'debounce',
  'pascalprecht.translate'
]);


app.config(function($routeProvider, $locationProvider, $translateProvider, cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;

  $locationProvider.html5Mode(false);

  $routeProvider
    .when('/collections', {
      templateUrl: 'partials/collections.html',
      controller: 'CollectionsCtrl'
    })
    .when('/collections/:collectionName/edit', {
      templateUrl: 'partials/collection-edit.html',
      controller: 'CollectionEditCtrl'
    })
    .when('/collections/create', {
      templateUrl: 'partials/collection-edit.html',
      controller: 'CollectionEditCtrl'
    })
    .when('/collections/:collectionName/entries/:entryId/edit', {
      templateUrl: 'partials/entry-edit.html',
      controller: 'EntryEditCtrl'
    })
    .when('/collections/:collectionName/entries/create', {
      templateUrl: 'partials/entry-edit.html',
      controller: 'EntryEditCtrl'
    })
    .when('/collections/:collectionName/entries', {
      templateUrl: 'partials/entries.html',
      controller: 'EntriesCtrl'
    })
    .when('/start', {
      templateUrl: 'partials/start.html',
      controller: 'StartCtrl'
    })
    .otherwise({
      redirectTo: '/collections'
    });

    $translateProvider.useStaticFilesLoader({
      prefix: 'languages/',
      suffix: '.json'
    });
});


app.run(function($translate, $location, EntriesService) {
  if (! localStorage.language || ! localStorage.apiUrl) {
    $location.path('start');
  } else {
    EntriesService.loadCollections()
      .error(function() {
        $location.path('start');
      });

    $translate.use(localStorage.language);
  }
});


app.directive('eatClick', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element[0].onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
      };
    }
  }
});


app.directive('entry', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      fields: '=',
      record: '=',
      onActive: '&'
    },
    controller: function($scope, $rootScope) {
      $scope.toggleActive = function() {
        if ($scope.onActive()) {
          $scope.onActive()($scope.record, ! $scope.record._active);
        }
      };

      $scope.humanizeDate = function(date) {
        return moment(date).fromNow();
      };

      $scope.viewEntries = function(field, entry) {
        $rootScope.$emit('entryBrowser:view', field, entry);
      };
    },
    templateUrl: 'partials/entry.html'
  };
});


app.directive('entryField', function() {
  return {
    restrict: 'E',
    scope: {
      field: '=',
      entry: '='
    },
    templateUrl: 'partials/entry-field.html',
    controller: function($scope, $rootScope, EntriesService) {
      $scope.getCollectionFields = function(collectionName) {
        return EntriesService.getCollectionFields(collectionName);
      };

      $scope.createAndSelectEntry = function(field, entry) {
        $rootScope.$emit('entry:createAndSelect', field, entry);
      };

      $scope.selectEntry = function(field, entry) {
        $rootScope.$emit('entryBrowser:select', field, entry);
      };
    }
  };
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


app.directive('modalDialog', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: true,
    templateUrl: 'partials/dialog.html',
    controller: function($scope, $element) {
      $scope.$watch('active', function(value) {
        if (value === true) {
          $element[0].querySelector('.dialog').style.top = document.getElementsByTagName('BODY')[0].scrollTop + 'px';
        }
      });
    }
  };
});


app.directive('shortList', function() {
  return {
    restrict: 'A',
    scope: {
      list: '=shortList'
    },
    transclude: true,
    template: '<div ng-transclude></div><div class="view-all" ng-if="items.length > 2 && isViewAllShowed"><a ng-click="viewAll()">{{ "View All" | translate }} ({{items.length}})</a></div>',
    controller: function($scope, $element) {
      $scope.items = [];
      $scope.isViewAllShowed = false;

      $scope.$watch('list', function(items) {
        if (! items) {
          $scope.isViewAllShowed = false;
          return;
        }

        for (var i=0,len=items.length; i<len; i++) {
          if (i > 1) {
            items[i]._displayed = false;
          } else {
            items[i]._displayed = true;
          }
        }

        $scope.items = items;
        $scope.isViewAllShowed = true;
      });

      $scope.viewAll = function() {
        for (var i=0,len=$scope.items.length; i<len; i++) {
          $scope.items[i]._displayed = true;
        }

        $scope.isViewAllShowed = false;
      };
    }
  };
});


app.factory("AppService", function($translate, $rootScope) {
  return {
    breadcrumbs: [],

    setBreadcrumbs: function(breadcrumbs) {
      this.breadcrumbs = breadcrumbs;
    },

    getBreadcrumbs: function() {
      return this.breadcrumbs;
    },

    showMessage: function(type, msg) {
      $rootScope.$emit('message', type, msg);
    }
  };
});


app.controller('MessagesCtrl', function($scope, $rootScope) {
  $scope.messages = [];

  $scope.remove = function(id) {
    for (var i=0,len=$scope.messages.length; i<len; i++) {
      if ($scope.messages[i] && $scope.messages[i].id == id) {
        $scope.messages.splice(i, 1);
      }
    }
  };

  $rootScope.$on('message', function(event, type, message) {
    var id = Math.random() + type + message;

    $scope.messages.unshift({
      id: id,
      type: type,
      text: message
    });

    setTimeout((function(id) {
      return function() {
        $scope.$apply(function() {
          $scope.remove(id);
        });        
      };
    })(id), 5000);
  });
});


app.controller('StartCtrl', function($scope, $translate, $location, AppService, EntriesService) {
  $scope.apiUrl = localStorage.apiUrl;
  $scope.languages = window.languages.slice(0);
  $scope.language = localStorage.language || 'default';

  $scope.$watch('language', function() {
    $translate.use($scope.language);
  });

  $scope.save = function() {
    localStorage.language = $scope.language || 'default';
    localStorage.apiUrl = $scope.apiUrl || '';

    apiUrl = $scope.apiUrl;
    
    EntriesService.loadCollections()
      .error(function() {
        AppService.showMessage('error', 'You need to set valid API URL');
      })
      .success(function() {
        $location.path('collections');
      });
  };

  AppService.setBreadcrumbs(['Start']);
});


app.controller('BreadcrumbsCtrl', function($scope, AppService) {
  $scope.app = AppService;
});


app.factory('EntriesService', function($http) {
  return {
    collections: [],

    loadEntries: function(collectionName, skip, limit, filter) {
      var me=this;

      if (me.collections.length > 0) {
        var collection = this.getCollection(collectionName);
        var params = {};

        if (typeof collection.entries != 'undefined' && ! skip) {
          collection.entries.splice(0, collection.entries.length);
        }

        params.skip = skip || null;
        params.filter = filter || null;
        params.limit = limit || null;

        return $http({
          method: 'GET',
          params: params,
          url: apiUrl + '/collections/' + collection.name + '/entries'
        }).success(function(response) {
          if (response.result) {
            me.setEntries(collectionName, response.result);
          }
        });
      } else {
        return $http({
          method: 'GET',
          url: apiUrl + '/collections'
        })
          .success(function(response) {
            if (typeof response.result !== 'undefined' && response.result.length > 0) {
              me.setCollections(response.result);
              me.loadEntries(collectionName, skip, limit, filter);
            }
          });
      }
    },

    addEntry: function(collectionName, entry)
    {
      var entry = entry || { id: null };

      var collection = this.getCollection(collectionName);

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

      collection.entries.unshift(entry);

      return entry;
    },

    getEntry: function(collectionName, entryId) {
      var collection = this.getCollection(collectionName);

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

    getEntries: function(collectionName) {
      var collection = this.getCollection(collectionName);

      if (! collection || typeof collection.entries == 'undefined') {
        collection.entries = [];
      }

      return collection.entries;
    },

    setEntry: function(collectionName, entry)
    {
      var collection = this.getCollection(collectionName);
      var isEntryFound = false;

      if (typeof collection.entries == 'undefined') {
        collection.entries = [];
      }

      for (var i=0, len=collection.entries.length; i<len; i++) {
        if (collection.entries[i].id == entry.id) {
          collection.entries[i] = entry;
          isEntryFound = true;
          break;
        }
      }

      if (! isEntryFound) {
        collection.entries.push(entry);
      }
    },

    setEntries: function(collectionName, items) {
      var collection = this.getCollection(collectionName);

      if (typeof collection.entries === 'undefined') {
        collection.entries = [];
      }

      for (var i=0,len=items.length; i<len; i++) {
        collection.entries.push(items[i]);
      }
    },

    removeEntries: function(collectionName, entriesIds) {
      var collection = this.getCollection(collectionName);

      return $http({
        method: 'DELETE',
        data: entriesIds,
        url: apiUrl + '/collections/' + collectionName + '/entries'
      })
        .success(function(response) {
          if (typeof response.error === 'undefined') {
            for (var i=0,leni=entriesIds.length; i<leni; i++) {
              for (var j=0,lenj=collection.entries.length; j<lenj; j++) {
                if (entriesIds.indexOf(collection.entries[j].id) !== -1) {
                  collection.entries.splice(j, 1);
                  break;
                }
              }
            }
          }
        });
    },

    saveEntry: function(collectionName, entry)
    {
      var me = this;
      var collection = this.getCollection(collectionName);

      for (var k in entry) {
        if (k == 'id' && entry.id === null) {
          delete entry.id;
          break;
        }
      }

      return $http({
        method: 'POST',
        data: entry,
        url: apiUrl + '/collections/' + collection.name + '/entries'
      })
        .success(function(response) {
          if (typeof response.error === 'undefined') {
            entry.id = response.result.id;
            me.setEntry(collectionName, response.result);
          }
        });
    },

    loadCollections: function() {
      var me = this;

      return $http({
        method: 'GET',
        url: apiUrl + '/collections'
      })
        .success(function(response) {
          if (typeof response.result !== 'undefined') {
            me.setCollections(response.result);
          }
        });
    },

    getCollection: function(collectionName) {
      for (var i=0,len=this.collections.length; i<len; i++) {
        if (this.collections[i].name == collectionName) {
          return this.collections[i];
        }
      }

      return null;
    },

    getCollections: function() {
      return this.collections;
    },

    addCollection: function(data) {
      this.collections.push(data);
    },

    setCollection: function(collectionName, data) {
      var collection = this.getCollection(collectionName);
      
      if (! collection) {
        this.collections.push(data);
      }

      for (var k in data) {
        collection[k] = data[k];
      }
    },

    setCollections: function(items) {
      for (var i=0,len=items.length; i<len; i++) {
        items[i]._name = items[i].name;

        if (typeof items[i].fields != 'undefined') {
          for (var j=0,jlen=items[i].fields.length; j<jlen; j++) {
            items[i].fields[j]._name = items[i].fields[j].name;
          }
        }

        this.collections.push(items[i]);  
      }
    },

    removeCollection: function(collectionName) {
      var me = this;

      return $http({
        method: 'DELETE',
        url: apiUrl + '/collections/' + collectionName
      })
        .success(function(response) {
          if (typeof response.error == 'undefined') {
            for (var i=0,len=me.collections.length; i<len; i++) {
              if (me.collections[i].name == collectionName) {
                me.collections.splice(i, 1);
                break;
              }
            }
          }
        });
    },

    saveCollection: function(collectionName) {
      var me = this;
      var collection = this.getCollection(collectionName);

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

      return $http({
        method: 'POST',
        data: data,
        url: apiUrl + '/collections/' + name
      })
        .success(function(response) {
          if (typeof response.result !== 'undefined') {
            me.setCollection(collectionName, response.result);
          }
        });
    },

    saveCollectionsOrder: function()
    {
      var collections = [];

      for (var i=0,len=this.collections.length; i<len; i++) {
        collections.push(this.collections[i].name);
      }

      return $http({
        method: 'POST',
        data: collections,
        url: apiUrl + '/collections'
      });
    },

    getCollectionField: function(collectionName, fieldName) {
      var collection = this.getCollection(collectionName);

      for (var i=0, len=collection.fields.length; i<len; i++) {
        if (collection.fields[i].name == fieldName) {
          return collection.fields[i];
        }
      }

      return null;
    },

    getCollectionFields: function(collectionName) {
      var collection = this.getCollection(collectionName);

      if (collection) {
        return collection.fields;
      }

      return null;
    },

    addCollectionField: function(collectionName, data) {
      var collection = this.getCollection(collectionName);

      if (typeof collection.fields === 'undefined') {
        collection.fields = [];
      }

      data = data || {};

      collection.fields.push(data);
    },

    removeCollectionField: function(collectionName, fieldIndex)
    {
      var collection = this.getCollection(collectionName);

      collection.fields.splice(fieldIndex, 1);
    }
  };
});


app.controller('CollectionsCtrl', function($scope, AppService, EntriesService) {
  AppService.setBreadcrumbs(['Collections']);

  $scope.collections = EntriesService.getCollections();

  $scope.$on('ngrr-reordered', function() {
    EntriesService.saveCollectionsOrder();
  });

  $scope.removeCollection = function(collectionName) {
    EntriesService.removeCollection(collectionName);
  };
});


app.controller('CollectionEditCtrl', function($scope, $routeParams, $location, AppService, EntriesService) {
  $scope.collectionName = $routeParams.collectionName || null;
  $scope.collection = EntriesService.getCollection($scope.collectionName);
  $scope.collections = EntriesService.getCollections();
  $scope.isLabelEmpty = false;

  if (! $scope.collection) {
    EntriesService.addCollection({
      name: null,
      label: null,
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

    $scope.collection = EntriesService.getCollection(null);
  }

  if (! $scope.collection.label) {
    $scope.isLabelEmpty = true;
  }

  $scope.activeFieldIndex = null;

  $scope.updateLabel = function() {
    if ($scope.isLabelEmpty) {
      if ($scope.collection.name.length > 0) {
        $scope.collection.label = $scope.collection.name[0].toString().toUpperCase() + $scope.collection.name.substr(1);
      } else {
        $scope.collection.label = '';
      }
    }
  };

  $scope.toggleField = function(index) {
    if ($scope.activeFieldIndex == index) {
      $scope.activeFieldIndex = null;
    } else {
      $scope.activeFieldIndex = index;
    }
  };

  $scope.addField = function() {
    EntriesService.addCollectionField($scope.collection.name, {
      name: null,
      sort: 1,
      type: 'text',
      label: '',
      defaultValue: '',
      required: false,
      displayed: true
    });
  };

  $scope.removeField = function(index) {
    EntriesService.removeCollectionField($scope.collection.name, index);
  };

  $scope.save = function(redirect) {
    return EntriesService.saveCollection($scope.collection.name)
      .error(function() {
        AppService.showMessage('error', 'Not saved');
      })
      .then(function() {
        AppService.showMessage('success', 'Saved successfully');

        if ($scope.collectionName === null && redirect !== false) {
          $location.path('collections/' + $scope.collection.name + '/edit');
        }
      });
  };

  $scope.saveAndClose = function() {
    $scope.save(false).then(function() {
      $location.path('collections');
    });
  };

  AppService.setBreadcrumbs([{
    path: 'collections',
    name: 'Collections'
  }, $scope.collection.name ? 'Setup': 'Create' ]);
});


app.controller('EntriesCtrl', function($scope, $rootScope, $routeParams, AppService, EntriesService) {
  $scope.collectionName = $routeParams.collectionName;

  $scope.collection = {};

  $scope.skip = null;
  $scope.limit = null || 25;
  $scope.filter = null;

  $scope.$watch('filter', function(value) {
    $scope.skip = 0;

    EntriesService.loadEntries($scope.collectionName, $scope.skip, $scope.limit, $scope.filter)
      .then(function() {
        $scope.collection = EntriesService.getCollection($scope.collectionName);

        AppService.setBreadcrumbs([{
          path: 'collections',
          name: 'Collections'
        }, $scope.collection.label || $scope.collection.name]);
      });
  });

  $scope.createEntry = function() {
    $rootScope.$emit('entry:edit', $scope.collectionName);
  };

  $scope.loadMoreEntries = function() {
    $scope.skip = $scope.skip + $scope.limit;
    EntriesService.loadEntries($scope.collectionName, $scope.skip, $scope.limit, $scope.filter);
  };

  $scope.editEntry = function(entryId) {
    var entry = EntriesService.getEntry($scope.collectionName, entryId);
    $rootScope.$emit('entry:edit', $scope.collectionName, entry);
  };

  $scope.removeEntry = function(entryId) {
    EntriesService.removeEntries($scope.collectionName, [entryId])
      .error(function() {
        AppService.showMessage('error', 'Not removed');
      })
      .then(function() {
        AppService.showMessage('success', 'Removed successfully');
      });
  };

  $scope.deselectAll = function() {
    var entries = EntriesService.getEntries($scope.collectionName);

    for (var i=0,len=entries.length; i<len; i++) {
      entries[i]._active = false;
    }
  };

  $scope.selectAll = function() {
    var entries = EntriesService.getEntries($scope.collectionName);

    for (var i=0,len=entries.length; i<len; i++) {
      entries[i]._active = true;
    }
  };

  $scope.isAllSelected = function() {
    var entries = EntriesService.getEntries($scope.collectionName);

    for (var i=0,len=entries.length; i<len; i++) {
      if (typeof entries[i]._active === 'undefined' || entries[i]._active !== true) {
        return false;
      }
    }

    return true;
  };

  $scope.isSelected = function() {
    var entries = EntriesService.getEntries($scope.collectionName);

    for (var i=0,len=entries.length; i<len; i++) {
      if (typeof entries[i]._active !== 'undefined' && entries[i]._active === true) {
        return true;
      }
    }

    return false;
  };

  $scope.onActive = function(entry, isActive) {
    entry._active = isActive;
  };

  $scope.removeSelected = function() {
    var entries = EntriesService.getEntries($scope.collectionName);
    var ids = [];

    for (var i=0,len=entries.length; i<len; i++) {
      if (typeof entries[i]._active !== 'undefined' && entries[i]._active === true) {
        ids.push(entries[i].id);
      }
    }

    EntriesService.removeEntries($scope.collectionName, ids)
      .error(function() {
        AppService.showMessage('error', 'Not removed');
      })
      .then(function() {
        AppService.showMessage('success', 'Removed successfully');
      });
  };

  AppService.setBreadcrumbs([{
    path: 'collections',
    name: 'Collections'
  }, 'Entries']);
});


app.controller('EntryEditDialogCtrl', function($scope, $rootScope, AppService, EntriesService) {
  $scope.active = false;
  $scope.editingItems = [];
  $scope.editing = {};

  $scope.save = function() {
    EntriesService.saveEntry($scope.editing.collectionName, $scope.editing.entry)
      .error(function() {
        AppService.showMessage('error', 'Not saved');
      })
      .then(function(response) {
        if ($scope.editing.targetEntry && $scope.editing.targetField) {
          if ($scope.editing.targetField.type == 'collectionOne') {
            $scope.editing.targetEntry[$scope.editing.targetField.name] = $scope.editing.entry;
          } else {
            if (typeof $scope.editing.targetEntry[$scope.editing.targetField.name] === 'undefined' || $scope.editing.targetEntry[$scope.editing.targetField.name] === null) {
              $scope.editing.targetEntry[$scope.editing.targetField.name] = [];
            }

            $scope.editing.targetEntry[$scope.editing.targetField.name].push($scope.editing.entry);
          }
        }

        $scope.editingItems.splice($scope.editingItems.length - 1, 1);

        if ($scope.editingItems.length > 0) {
          $scope.editing = $scope.editingItems[$scope.editingItems.length - 1];
        } else {
          $scope.active = false;
        }

        AppService.showMessage('success', 'Saved successfully');
      });
  };

  $scope.cancel = function() {
    $scope.editingItems.splice($scope.editingItems.length - 1, 1);

    if ($scope.editingItems.length > 0) {
      $scope.editing = $scope.editingItems[$scope.editingItems.length - 1];
      $scope.title = $scope.editing.title;
    } else {
      $scope.active = false;
    }
  };

  $scope.humanizeDate = function(date) {
    return moment(date).fromNow();
  };

  $rootScope.$on('entry:edit', function(event, collectionName, entry) {
    if (! entry) {
      entry = EntriesService.addEntry(collectionName);
    }

    $scope.editingItems.push({
      title: (typeof entry.id === 'undefined' || entry.id === null ? 'Create Entry': 'Edit Entry'),
      collectionName: collectionName,
      entry: entry,
      fields: EntriesService.getCollectionFields(collectionName),
      targetEntry: null,
      targetField: null
    });

    $scope.editing = $scope.editingItems[$scope.editingItems.length - 1];

    $scope.title = $scope.editing.title;
    $scope.active = true;
  });

  $rootScope.$on('entry:createAndSelect', function(event, field, entry) {
    $scope.editingItems.push({
      title: 'Create Entry',
      collectionName: field.collection,
      entry: {},
      fields: EntriesService.getCollectionFields(field.collection),
      targetEntry: entry,
      targetField: field
    });

    $scope.editing = $scope.editingItems[$scope.editingItems.length - 1];

    $scope.title = $scope.editing.title;
    $scope.active = true;
  });
});


app.controller('EntryBrowserDialogCtrl', function($scope, $rootScope, EntriesService) {
  $scope.collectionName = null;

  $scope.title = null;
  $scope.active = false;
  $scope.isView = false;

  $scope.collection = null;
  $scope.entry = null;
  $scope.field = null;

  $scope.params = {
    skip: null,
    limit: null || 10,
    filter: ''
  };

  var refreshEntries = function() {
    if (! $scope.collectionName || $scope.isView) {
      return;
    }

    EntriesService.loadEntries($scope.collectionName, $scope.params.skip, $scope.params.limit, $scope.params.filter)
      .then(function() {
        $scope.collection = EntriesService.getCollection($scope.collectionName);
        updateActiveItems();
      });
  };

  var updateActiveItems = function() {
    if (! $scope.collection || ! $scope.entry[$scope.field.name]) {
      return;
    }

    if ($scope.field.type == 'collectionOne') {
      for (var i=0,len=$scope.collection.entries.length; i<len; i++) {
        if ($scope.collection.entries[i].id == $scope.entry[$scope.field.name].id) {
          $scope.collection.entries[i]._active = true;
        } else {
          $scope.collection.entries[i]._active = false;
        }
      }      
    } else if ($scope.field.type == 'collectionMany') {
      for (var i=0,len=$scope.collection.entries.length; i<len; i++) {
        var isFoundEntry = false;

        for (var j=0,jlen=$scope.entry[$scope.field.name].length; j<jlen; j++) {
          if ($scope.collection.entries[i].id == $scope.entry[$scope.field.name][j].id) {
            isFoundEntry = true;
            break; 
          }
        }

        $scope.collection.entries[i]._active = isFoundEntry;
      }
    }
  };

  $scope.$watch('params.filter', function() {
    $scope.params.skip = 0;
    refreshEntries();
  });

  $scope.clear = function() {
    $scope.collectionName = null;
    $scope.active = false;
    $scope.entry = null;
    $scope.field = null;
    $scope.params.filter = '';
    $scope.params.skip = 0;
    $scope.isView = false;
  };

  $scope.select = function() {
    if ($scope.field.type == 'collectionOne') {
      for (var i=0,len=$scope.collection.entries.length; i<len; i++) {
        if ($scope.collection.entries[i]._active == true) {
          $scope.collection.entries[i]._active = false;
          $scope.entry[$scope.field.name] = $scope.collection.entries[i];
          break;
        }
      }
    } else {
      var items = [];

      for (var i=0,len=$scope.collection.entries.length; i<len; i++) {
        if ($scope.collection.entries[i]._active == true) {
          $scope.collection.entries[i]._active = false;
          items.push($scope.collection.entries[i]);
        }
      }

      $scope.entry[$scope.field.name] = items;
    }

    $scope.clear();
  };

  $scope.cancel = function() {
    $scope.clear();
  };

  $scope.loadMoreEntries = function() {
    $scope.params.skip = $scope.params.skip + $scope.params.limit;
    refreshEntries();
  };

  $scope.onActive = function(entry, isActive) {
    if ($scope.isView) {
      return;
    }

    if ($scope.field.type == 'collectionOne') {
      for (var i=0,len=$scope.collection.entries.length; i<len; i++) {
        if ($scope.collection.entries[i].id == entry.id) {
          $scope.collection.entries[i]._active = isActive;
        } else {
          $scope.collection.entries[i]._active = false;
        }
      }
    } else {
      for (var i=0,len=$scope.collection.entries.length; i<len; i++) {
        if ($scope.collection.entries[i].id == entry.id) {
          $scope.collection.entries[i]._active = isActive;
        }
      }
    }
  };

  $rootScope.$on('entryBrowser:select', function(event, field, entry) {
    $scope.collectionName = field.collection;
    $scope.active = true;
    $scope.entry = entry;
    $scope.field = field;
    $scope.params.filter = '';
    $scope.isView = false;
    $scope.title = 'Select Entry';

    refreshEntries();
  });

  $rootScope.$on('entryBrowser:view', function(event, field, entry) {
    var fields = EntriesService.getCollectionFields(field.collection);

    $scope.collectionName = field.collection;

    if ((field.type == 'collectionOne' && typeof entry[field.name] == 'object')
      || (field.type == 'collectionMany' && entry[field.name] instanceof Array))  {
      $scope.collection = {
        fields: fields,
        entries: (field.type == 'collectionOne' ? [entry[field.name]]: entry[field.name])
      };
    } else {
      // load entries by ids
      // EntriesService.loadEntries($scope.collectionName);
    }

    $scope.active = true;
    $scope.entry = entry[field.name];
    $scope.field = field;
    $scope.params.filter = '';
    $scope.isView = true;
    $scope.title = 'View Entries';

    updateActiveItems();
  });
});

})(angular);