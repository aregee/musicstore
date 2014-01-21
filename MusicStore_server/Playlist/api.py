from tastypie.serializers import Serializer 
from tastypie.resources import ModelResource,ALL_WITH_RELATIONS,ALL
from tastypie import fields 
from tastypie.authorization import Authorization
from tastypie.authentication import Authentication 
from Playlist.models import *
from Playlist.mixins import *
from django.utils import simplejson
from surlex.dj import surl
from django.core.serializers import json
from tastypie.utils import trailing_slash
from django.contrib.auth import login, logout, authenticate
from django.db import IntegrityError 
from tastypie.http import HttpForbidden, HttpUnauthorized 
from tastypie.exceptions import BadRequest
from django.shortcuts import get_object_or_404
from django.conf.urls.defaults import *


class PrettyJSONSerializer(Serializer): 
    json_indent = 4 
 
    def to_json(self, data, options=None): 
        options = options or {} 
        data = self.to_simple(data, options) 
        return simplejson.dumps(data, cls=json.DjangoJSONEncoder, sort_keys=True, ensure_ascii=False, indent=self.json_indent) 
    def from_json(self, content):
        data = simplejson.loads(content)

        if 'requested_time' in data:
            # Log the request here...
            pass

        return data
class SignUpResource(ModelResource):
	class Meta:
		allowed_methods = ['post']
		object_class = User
		include_resource_uri = False
		fields = ['username','email']
		resource_name = 'signup'
		authentication = Authentication()
		authorization = Authorization()
	def obj_create(self, bundle, request=None, **kwargs):
		username , password , email = bundle.data['username'] , bundle.data['password'] , bundle.data['email']
		try:
			bundle.obj = User.objects.create_user(username,email,password)
		except IntegrityError:
			raise BadRequest('This Username already exist , please pick different handle')
		return bundle


class UserResource(ModelResource,PublicEndpointResourceMixin):
	apikey = fields.CharField(blank=True,null=True,readonly=True)
	#playlist = fields.ToManyField('')
	class Meta:
		queryset = User.objects.all()
		serializer = PrettyJSONSerializer()
		authorization = Authorization()
		authentication = Authentication()
		allowed_methods = ['post','get','delete','patch','put']
		login_allowed_methods = ['post']
		#fields = ['id','email','username']
		excludes = ['is_active','is_superuser','is_staff','password']
		include_resource_uri = True
		resource_name = 'users'
		#filtering = { 'username' : All,}
		urlargs = {"name":resource_name,"slash": trailing_slash() }


	def prepend_urls(self):
		return	[
			surl(r"^<resource_name={name}>/login{slash}$".format(**self._meta.urlargs), self.wrap_view('dispatch_login'), name='api_user_login'),
			url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/playlists%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_playlist'), name="api_get_playlist"),
			url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/playlists/(?P<pk2>\w[\w/-]*)%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_songs'), name="api_get_songs"),
			url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/songs/(?P<pk3>\w[\w/-]*)%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_song'), name="api_get_song"),
			]

	def dispatch_login(self,request,**kwargs):
			return self.dispatch_public('login',request,**kwargs)

	def post_login(self,request,**kwargs):
			data = self.deserialize(request,request.raw_post_data, format=request.META.get('CONTENT_TYPE','application/json'))	
			username = data.get('username','')
			password = data.get('password','')
			user = authenticate(username=username,password=password)
			if user:
				if user.is_active:
					login(request,user)
					return self.get_detail(request,pk=user.id)
				else:
					return self.create_response(request,{'success':False,'reason':'disabled',}, HttpForbidden)
			else:
				return self.create_response(request,{'success':False,'reason':'incorrect username or password'}, HttpForbidden)					

	def dehydrate_apikey(self,bundle):
			user = bundle.obj
			if hasattr(user, 'api_key')	and user.api_key.key:
				return user.api_key.key
			return None	

	def get_playlist(self,request,**kwargs):
		try:
		  user_pk = kwargs['pk']
		except ObjectDoesNotExist:
		  return HttpGone()
		qs = Playlist.objects.filter(user=user_pk)
		list = []
		tracks = []
		for result in qs:
 		   data={"username":result.user.username,"playlist_name":result.playlist_name ,'id' :result.id , 'songs' :[ x for x in result.tracks.prefetch_related()]}
		   list.append(data)
	
		objects_list = {
			'playlists' : list,
		}

		self.log_throttled_access(request)
		return self.create_response(request, objects_list)

	def get_songs(self,request,**kwargs):
		#user_pk = kwargs['pk']
		play_pk = kwargs['pk2']
		qs = Playlist.objects.get(id=play_pk)

		playlists = []
		for result in qs.tracks.prefetch_related():
			data = {'Artist_Name' : result.artist_name , 'Track_Name':result.track_name , 'id':result.id }		
			playlists.append(data)

		objects_list = {
			'songs' : playlists,
		}

		self.log_throttled_access(request)
		return self.create_response(request, objects_list)

	def get_song(self,request,**kwargs):
		user_pk = kwargs['pk']
		play_pk = kwargs['pk3']
		result = Tracks.objects.get(id=play_pk)

		playlists = []
		#for result in qs:
		data = {'Artist_Name' : result.artist_name , 'Track_Name':result.track_name , 'id':result.id}		
		playlists.append(data)

		objects_list = {
			'Track' : playlists,
		}

		self.log_throttled_access(request)
		return self.create_response(request, objects_list)


	def dehydrate(self,bundle, **kwargs):
		bundle.data["Field"]	= "Last_login"
		return bundle 

class TracksResource(ModelResource):
	class Meta:
		queryset = Tracks.objects.all()
		serializer = PrettyJSONSerializer()
		resource_name = 'tracks'
		include_resource_uri = True
		authorization = Authentication()
		authorization = Authorization()



class PlaylistResource(ModelResource):
	play_user = fields.ToOneField(UserResource, 'user', full=False)
	tracks =  fields.ToManyField(TracksResource,'tracks',null=True, full=True)
	track = fields.ToOneField(TracksResource,'track',null=True,full=True)
	class Meta:
		queryset = Playlist.objects.all()
		serializer = PrettyJSONSerializer()
		resource_name = 'playlists'
		allowed_methods = ['post','get','delete','patch','put']
		include_resource_uri = True
		authentication = Authentication()
		authorization = Authorization()

	def dehydrate(self,bundle):
		bundle.data["username"] = bundle.obj.user

		return bundle

#class AddSongResource(ModelResource):
#	 class Meta:
#	 	queryset

