        (function () {
        'use strict';
        /*
        Angular Apikey Session Authentication

        This module deals with the following concepts
        - anonymous / authenticated users
        - username/password for initial session authentication
        - apikeys instead of passwords for remaining interaction
        - feature flip code checking


        :: Dataflow

        event:login-required
        perform anything you need at this point, something like
        showing a login form would be appropriate

        LoginController.login
        sends username and password via an event to the session service

        $Session.login
        performs the api post to the login endpoint
        collects the user data and stores userid, apikey, username in time limited cookies
        on success, it broadcasts a login-confirmed


        :: Elements

        Service: $Session
        .hasFeatures
        .logout
        .login
        .setApiKeyAuthHeader
        .refreshCredentials
        .cacheCredentials
        .wipeCredentials


        Controller: LoginController
        .login


        Run: Initialise Module
        sets up all the events required to decouple this module.

        event:auth-login

        event:auth-logout

        event:auth-login-required

        event:auth-login-confirmed

        $routeChangeSuccess

        */

        angular.module("factory.session",['http-auth-interceptor','restangular'])
        .constant('constSessionExpiry', 20)// in minutes
        .config(function(RestangularProvider)
        {
        RestangularProvider.setRequestSuffix('/');

        }
        )
        .factory("$Session", [
        '$rootScope',
        '$q',
        '$location',
        '$log',
        '$http',
        'Restangular',
        'authService',
        'constSessionExpiry',

        function($rootScope, $q, $location, $log, $http, Restangular, authService, constSessionExpiry ) {
        return {

        loginInProgress: false,
        User: null,
        authSuccess: function(){
        this.loginInProgress = false;
        $rootScope.$broadcast('event:session-changed');
        authService.loginConfirmed();

        $location.path("/home");

        },
        authSuccess2: function(){
        this.loginInProgress = false;
        $rootScope.$broadcast('event:session-changed');
        authService.loginConfirmed();
        $location.path("/create");
        },

        logout: function(){
        $log.info("Handling request for logout");
        this.wipeUser();
        $rootScope.$broadcast('event:auth-logout-confirmed');
        $location.path("/login");
        },


        login: function(data){
        $log.info("Preparing Login Data", data);
        var $this = this;
        return Restangular
        .all('users/login')
        .post(data)
        .then(function userLoginSuccess(response){
            $log.info("login.post: auth-success", response);
            $this.User = response;
            // remove properties we don't need.
            delete $this.User.route
            delete $this.User.restangularCollection
            $this.User.is_authenticated = true;
            $this.cacheUser()
            $this.setApiKeyAuthHeader();
            $this.authSuccess();
        }, function userLoginFailed(response){
            $log.info('login.post: auth-failed', response);
            $this.logout();
            return $q.reject(response);
        });
        },
        //Create a New Profile for User
        webid : function(data) {
        $log.info("preparing Webid  data", data );
        var $this = this;
        return Restangular
        .all("playlists")
        .post(data)
        .then(function(response) {
        $log.info("created webid with :: ", response);
        $location.path("/home");
        $this.refreshUser();
        })},

        addcontact : function(data) {
                //$log.info("Contact data ::" , response);
                var $this = this;
                return Restangular
                .all("contacts")
                .post(data)
                .then(function() {
                    //$log.info("added contact to user's list" , response);
                    $location.path("/contacts");

                })},

        addphone : function(data) {
            var $this = this;
            return Restangular
            .all("phonenumber")
            .post(data)
            .then(function () {
                $location.path("/home")

             })},        
        addsocial : function(data) {
            var $this = this;
            return Restangular
            .all("social")
            .post(data)
            .then(function () {
                $location.path("/home")

             })},   

          addemail : function(data) {
            var $this = this;
            return Restangular
            .all("email")
            .post(data)
            .then(function () {
                $location.path("/home")

             })},     

          addwebsite : function(data) {
            var $this = this;
            return Restangular
            .all("web")
            .post(data)
            .then(function () {
                $location.path("/home")

             })},     


        join: function(data){
        $log.info("Preparing Login Data", data);
        var $this = this;
        return Restangular
        .all('users/login')
        .post(data)
        .then(function userLoginSuccess(response){
            $log.info("login.post: auth-success", response);
            $this.User = response;
            // remove properties we don't need.
            delete $this.User.route
            delete $this.User.restangularCollection
            $this.User.is_authenticated = true;
            $this.cacheUser()
            $this.setApiKeyAuthHeader();
            $this.authSuccess2();
        }, function userLoginFailed(response){
            $log.info('login.post: auth-failed', response);
            $this.logout();
            return $q.reject(response);
        });
        },




        setApiKeyAuthHeader: function(){
        if(this.hasOwnProperty('User') && this.User){
        $http.defaults.headers.common.Authorization = "apikey "+this.User.username+':'+this.User.apikey;
        $log.info("Setting Authorization Header", $http.defaults.headers.common.Authorization)
        }else{
        $log.info("No user for AuthHeader")
        delete $http.defaults.headers.common.Authorization;
        }
        },

        refreshUser: function(){
        var $this = this;
        var cachedUser = lscache.get('userData');
        $log.info("Request to pull User from Cache");
        $log.info("$Session.User", $this.User)
        $log.info('lscache.get("userData")', cachedUser)

        if(!$this.User && cachedUser && cachedUser.hasOwnProperty('apikey') && cachedUser.apikey){
        $log.info('Attempting pull user from cache', cachedUser)
        $this.User = cachedUser;
        $log.info("MWWA:",$this.User)
        }
        else{
        $log.warn("No user available.")
        $rootScope.$broadcast("event:auth-login-required")
        //Change to login when APIKEys are hooked up 
        $location.path("/login")
        }

        if($this.User && $this.User.hasOwnProperty('apikey') && $this.User.apikey){
        $this.setApiKeyAuthHeader();
        Restangular
        .one('users', $this.User.id)

        .get().then(function(response){
            $log.info("User data updated from server.")
            $this.User = response;
            $this.cacheUser();
            $this.setApiKeyAuthHeader();
            $this.authSuccess()
        }, function(response){
            $log.error("Error retrieving user. logging out.");
            $this.logout();
        })


        }

        },

        cacheUser: function(){
        if(!this.User){
        $log.warn("Can't cache a null value User")
        return false;
        }
        if(!this.User.hasOwnProperty("id") && this.User.hasOwnProperty("resource_uri")){
        $log.info("Building $this.User.id")
        var bits = this.User.resource_uri.split("/")
        this.User.id = Number(bits[bits.length-1])
        }
        $log.info("Caching User", this.User);
        lscache.set('userData', this.User, constSessionExpiry);
        },

        wipeUser: function(){
        $log.info("Wiping User");
        lscache.remove('userData');
        lscache.remove('profileData');
        lscache.remove('contactData');
        this.User = null;
        this.setApiKeyAuthHeader();
        $rootScope.$broadcast('event:session-changed');
        }
        };
        }]).run(['$rootScope',
        '$log',
        '$Session',

        function($rootScope, $log, $Session ,$routeProvider){
        $rootScope.Session = $Session;

        //namespace the localstorage with the current domain name.
        lscache.setBucket(window.location.hostname);

        // on page refresh, ensure we have a user. if none exists
        // then auth-login-required will be triggered.
        $Session.refreshUser();

        // Best practice would be to hook these events in your app.config
        // login
        $rootScope.$on('event:auth-login-required', function(scope, data) {
        $log.info("session.login-required");
        });

        $rootScope.$on('event:auth-login', function(scope, data) {
        $log.info("session.send-login-details");
        $Session.login(data);

        });

        $rootScope.$on('event:auth-refreshUser', function() {
        $log.info("session.send-refresh-details");
        //            this.refreshUser();

        });

        $rootScope.$on('event:auth-join', function(scope, data) {
        $log.info("session.send-join-details");
        $Session.join(data);
        });

        $rootScope.$on('event:auth-follow', function(scope, data) {
        $log.info("session.send-follow-details");
        $Session.follow(data);
        });

        $rootScope.$on('event:auth-liked', function(scope, data) {
        $log.info("session.send-liked-details");
        $Session.liked(data);
        });

        $rootScope.$on('event:auth-comment', function(scope, data) {
        $log.info("session.send-liked-details");
        $Session.comment(data);
        });
        $rootScope.$on('event:auth-webid', function(scope, data) {
        $log.info("session.create_webid");
        $Session.webid(data);
        });

        $rootScope.$on('event:auth-addcontact', function(scope, data) {
        $log.info("session.create_webid");
        $Session.addcontact(data);
        });

        $rootScope.$on('event:auth-addphone', function(scope, data) {
        $log.info("session.create_webid");
        $Session.addphone(data);
        });

        $rootScope.$on('event:auth-addsocial', function(scope, data) {
        $log.info("session.create_webid");
        $Session.addsocial(data);
        });

        $rootScope.$on('event:auth-addemail', function(scope, data) {
        $log.info("session.create_webid");
        $Session.addemail(data);
        });

        $rootScope.$on('event:auth-addwebsite', function(scope, data) {
        $log.info("session.create_webid");
        $Session.addwebsite(data);
        });

        $rootScope.$on('event:auth-login-confirmed', function(scope, data) {
        $log.info("session.login-confirmed");
        });

        // logout
        $rootScope.$on('event:auth-logout', function(scope, data) {
        $log.info("session.request-logout");
        $Session.logout();
        });
        $rootScope.$on('event:auth-logout-confirmed', function(scope, data) {
        $log.info("session.logout-confirmed");
        });

        // session state change
        $rootScope.$on('event:session-changed', function(scope){
        $log.info("session.changed > ", $Session.User)
        });

        $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
        if(!$Session.User && next.$$route.loginRequired){
        $log.info("Unauthenticated access to ", next.$$route)
        $rootScope.$broadcast('event:auth-login-required')
        }
        })


        }])

        })();
