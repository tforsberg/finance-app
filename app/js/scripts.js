var finances = angular.module( 'app', [ 'ngAnimate', 'ui.router' ] );
var host = 'http://localhost:3000/';

/* controllers */

finances.controller( 'AppCtrl', function( $scope, Transactions ) {
	Transactions.get().then( function( _data ) {
		console.log( _data );
		$scope.transaction_data = _data;
	} );
} );

finances.controller( 'MainCtrl', function( $scope ) {} );


/* filters */

finances.filter( 'daterange', function() {
	return function( items, date ) {

		var term = '';
		var threshold = 0;
		var filteredTransactions = [];

		switch ( date ) {
			case 'Day':
				term = "Date";
				break;
			case 'Week':
				threshold = 1;
				break;
			case 'Month':
				term = "Month";
				break;
			case 'Year':
				term = "FullYear";
				break;
		}

		var rightNow = new Date()[ 'get' + term ]();
		if ( typeof items !== 'undefined' ) {
			for ( var i = 0; i < items.length; i++ ) {
				var threshold = new Date( items[ i ].date )[ 'get' + term ]();
				if ( rightNow === threshold && parseInt( items[ i ].date.split( '-' )[ 0 ] ) === new Date().getFullYear() ) {
					filteredTransactions.push( items[ i ] );
				}
			}
		}

		return filteredTransactions;
	};
} );


/* directives */

finances.directive( 'back', [ '$window', function( $window ) {
	return {
		restrict: 'A',
		link: function( scope, elem, attrs ) {
			elem.bind( 'click', function() {
				$window.history.back();
			} );
		}
	};
} ] );

finances.directive( 'submitNew', [ 'Transactions', function( Transactions ) {
	return {
		restrict: 'A',
		link: function( scope, elem, attrs ) {
			elem.bind( 'click', function() {
				console.log( 'clicked' );
				Transactions.create();
			} );
		}
	};
} ] );

finances.directive( 'delete', [ 'Transactions', function( Transactions ) {
	return {
		restrict: 'A',
		link: function( scope, elem, attrs ) {
			elem.bind( 'click', function( _one, _two ) {
				console.log( _one );
				console.log( _two );
				console.log( scope );
				// Transactions.delete( '564933dbc5180b864f59e236' ).then( function( _resolve ) {
				// 	console.log( _resolve );
				// } );
			} );
		}
	};
} ] );


/* factories / services */

finances.factory( 'Transactions', function( $http, $q ) {
	return {
		get: function( _id ) {
			var deferred = $q.defer();
			_id = typeof _id === 'undefined' ? 'all' : _id;
			$http.jsonp( host + 'transactions/get/' + _id + '?callback=JSON_CALLBACK' ).success( function( data, status, headers, config ) {
				deferred.resolve( data );
			} ).error( function( data, status, headers, config ) {
				deferred.reject( status );
			} );
			return deferred.promise;
		},
		create: function( _data ) {
			var deferred = $q.defer();
			$http.post( host + 'transactions/create', _data ).success( function( data, status, headers, config ) {
				console.log( 'create' );
				deferred.resolve( data );
			} ).error( function( data, status, headers, config ) {
				deferred.reject( status );
			} );
			return deferred.promise;
		},
		update: function( _id, _data ) {
			var deferred = $q.defer();
			console.log( _id );
			$http.post( host + 'transactions/update/' + _id, _data ).success( function( data, status, headers, config ) {
				console.log( 'update' );
				deferred.resolve( data );
			} ).error( function( data, status, headers, config ) {
				deferred.reject( status );
			} );
			return deferred.promise;
		},
		delete: function( _id ) {
			var deferred = $q.defer();
			console.log( _id );
			$http.post( host + 'transactions/delete/' + _id ).success( function( data, status, headers, config ) {
				console.log( 'delete' );
				deferred.resolve( data );
			} ).error( function( data, status, headers, config ) {
				deferred.reject( status );
			} );
			return deferred.promise;
		}
	}
} );

finances.config( function( $stateProvider, $urlRouterProvider ) {

	var PreviousStateStorage = {
		PreviousState: [ "$state", function( $state ) {
			var currentStateData = {
				Name: $state.current.name,
				Params: $state.params,
				URL: $state.href( $state.current.name, $state.params )
			};
			return currentStateData;
      } ]
	}

	var PreviousStateCtrl = [ "PreviousState", function( PreviousState ) {
		if ( PreviousState.Name == "mystate" ) {
			// ...
		}
  } ]

	$urlRouterProvider.otherwise( '/dashboard' );

	$stateProvider.state( 'main', {
		url: '/',
		abstract: true,
		templateUrl: "views/main.html",
		controller: function( $scope, $location ) {
			$scope.appName = $location.$$url.split( '/' )[ 1 ];
		}
	} )

	/* Main - Dashboard */

	.state( 'main.dashboard', {
		url: 'dashboard',
		templateUrl: 'views/dashboard.html',
		resolve: PreviousStateStorage,
		controller: PreviousStateCtrl
	} )

	/* Main - Transactions */

	.state( 'main.transactions', {
		url: 'transactions',
		templateUrl: 'views/transactions.day.html'
	} )

	.state( 'main.transactions.day', {
		url: '/day',
		views: {
			'@main': {
				templateUrl: 'views/transactions.day.html'
			}
		}
	} )

	.state( 'main.transactions.week', {
		url: '/week',
		views: {
			'@main': {
				templateUrl: 'views/transactions.week.html'
			}
		}
	} )

	.state( 'main.transactions.month', {
		url: '/month',
		views: {
			'@main': {
				templateUrl: 'views/transactions.month.html'
			}
		}
	} )

	.state( 'main.transactions.year', {
		url: '/year',
		views: {
			'@main': {
				templateUrl: 'views/transactions.year.html'
			}
		}
	} )

	.state( 'main.transactions.new', {
		url: '/new',
		views: {
			'@': {
				templateUrl: 'views/transactions.new.html',
				controller: function( $scope, $state, $stateParams, Transactions ) {

					// TODO: angular form validation

					$scope.create = function( _formData ) {
						Transactions.create( _formData );
					};

				}
			}
		}
	} )

	.state( 'main.transactions.details', {
		url: '/details/:id',
		views: {
			'@': {
				templateUrl: 'views/transactions.details.html',
				controller: function( $scope, $state, $stateParams, Transactions ) {

					Transactions.get( $stateParams.id ).then( function( _return ) {
						$scope.transactions = _return
					} );

					$scope.update = function( _formData ) {
						Transactions.update( _formData._id, _formData );
					};

					$scope.delete = function() {
						console.log( 'delete' );
						// verify action
						// api call to remove record with _id
					};

				}
			}
		}
	} )

	/* Main - Categories */

	.state( 'main.categories', {
		url: 'categories',
		templateUrl: 'views/categories.html'
	} );

	/* Panels */

	$stateProvider.state( 'panel', {
		url: "/",
		templateUrl: "views/panel.html"
	} )

	.state( 'panel.menu', {
		url: "menu",
		templateUrl: "views/menu.html",
		resolve: PreviousStateStorage,
		controller: PreviousStateCtrl
	} )

	.state( 'panel.settings', {
		url: "settings",
		templateUrl: "views/settings.html",
		resolve: PreviousStateStorage,
		controller: PreviousStateCtrl
	} )

	.state( 'panel.new', {
		url: "new",
		templateUrl: "views/new.html",
		resolve: PreviousStateStorage,
		controller: PreviousStateCtrl
	} )

} );