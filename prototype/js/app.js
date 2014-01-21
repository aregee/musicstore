 'use strict';

angular.module('Webid',['restangular','factory.session']).
config(function(RestangularProvider,$httpProvider ,$routeProvider) {


      $httpProvider.defaults.useXdomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
      RestangularProvider.setBaseUrl("http://127.0.0.1:8000/api/v1/");


       $routeProvider.when('/join', {
	   		templateUrl:'views/signup.html',
	   		controller: 'SignupCtrl'
	   })
	  .when('/login', { 
	  	templateUrl:'views/login.html',
	  	controller:"LoginCtrl"	
	  })
	  .when('/home' , { 
	  templateUrl: 'views/home.html', 
	   controller: "HomeCtrl"})
	  .when('/create', {
	  	templateUrl:'views/create_list.html',
	  	controller: "ListCreateCtrl"
	  })
	  .when('/playlists',{
	  		templateUrl: 'views/view_lists.html',
	  		controller: "ListsCtrl"
	  })
	  .when('/playlists/:_id',{
	  		templateUrl: 'views/playlist.html',
	  		controller: "ListViewCtrl"
	  })
	  .when('/tracks/:phone_id', {
	  		templateUrl:'views/view_track.html',
	  		controller:"ViewTrackCtrl"
	  })
	  .when('/tracks', {
	  		templateUrl:'views/tracks.html',
	  		controller: "TracksList"
	  })
	  .otherwise({ redirectTo: '/login'});
	   
});

//Signup Controller - User Signup or User Post logic with JS 
function SignupCtrl($scope,Restangular){
				$scope.Signup = function(){Restangular.all('signup').post($scope.register).then(function(register)
{
$scope.$emit('event:auth-join', {username: $scope.register.username, password: $scope.register.password});

})}
	}
//Create WebId Page
function ListCreateCtrl($scope,Restangular,$location){
		$scope.user = lscache.get('userData');
		
	//	console.log(data);
		$scope.Webid = function(){
				//var data = {user: $scope.user.resource_uri ,first_name:$scope.first_name,last_name:$scope.last_name}
				$scope.$emit('event:auth-webid', {play_user:$scope.user.resource_uri, playlist_name:$scope.name});
				}
		}

//Login Controller - Userl login method , returns username 
function LoginCtrl($log, $Session,$scope,$rootScope,$location){
	$scope.Login = function(){
			$scope.$emit('event:auth-login',{username:$scope.username, password:$scope.password});
	}
}

function HomeCtrl($scope,Restangular,$q){
    
    $scope.user = lscache.get('userData');
  //  var data = { user : $scope.user.resource_uri , username : $scope.user.username }
   // console.log(data);
   	var defer = $q.defer();
   	$scope.profile = Restangular.one("users" , $scope.user.id).get();

   	/*defer.promise.then(function(response){
   		var data = Restangular.copy(response);
   		lscache.set('profileData', data);
   		return data	
   	});
   	defer.resolve();
*/
    $scope.Logout = function() {
    		$scope.$emit('event:auth-logout',{});
    }
          
	} 

// List all the users Playlists 

function ListsCtrl($scope,Restangular,$rootScope,$location){
		$scope.user = lscache.get('userData');
		$scope.tracks = Restangular.one("users",$scope.user.id).getList("playlists");
		//$scope.Phones = Restangular.one("profiles",$scio)
}

// Public View of Playlist controller 

function ListViewCtrl($scope,Restangular,$routeParams,$q,$location){
		$scope.user = lscache.get('userData');
		$scope.id = $routeParams._id;
		var defer = $q.defer();
		defer.promise = $scope.playlist = Restangular.one("users",$scope.user.id).one("playlists",$scope.id).get();
	
	/*	$scope.Add = function () {
			defer.promise.then(function (response) {
				// body...
				var data = Restangular.copy(response);
				//lscache.set('contactData',data);
				$scope.$emit('event:auth-addcontact',{ follower : lscache.get('profileData').resource_uri , followee: data.resource_uri});
			});
			
			
		} */
		defer.resolve();
				
}

function ViewTrackCtrl($scope,Restangular,$routeParams,$q,$location){
		$scope.user = lscache.get('userData')
		$scope.id = $routeParams.phone_id;
		var defer = $q.defer();
		defer.promise = $scope.song= Restangular.one("tracks",$scope.id).get();
		/*$scope.Delete = function() {
			    defer.promise.then(function(response){
			    	var data = Restangular.copy(response);
			    	Restangular.one("phonenumber",data.id).remove().then(function(){$location.path('/home')});
			    });*/

		
}






function TracksList($scope,Restangular,$q,$location) {
		$scope.user = lscache.get('userData');
		$scope.tracks = Restangular.all("tracks").getList();
		$scope.playlists = Restangular.one('users',$scope.user.id).getList('playlists');
		$scope.selection = [];
		var select  = [];

	// toggle selection for a given fruit by name
 	$scope.toggleSelection = function toggleSelection(fruitName)		 {
    var idx = $scope.selection.indexOf(fruitName);

    // is currently selected
    if (idx > -1) {
      $scope.selection.splice(idx, 1);
    }

    // is newly selected
    else {
      $scope.selection.push(fruitName);
      console.log($scope.selection);

    }
 
  }
	console.log($scope.selection);  	

	$scope.create = function() {
		Restangular.all("playlists").put() 
	}
}
