from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()
from Playlist.api import * 
from tastypie.api import Api

v1_api = Api(api_name='v1')

v1_api.register(UserResource())
v1_api.register(PlaylistResource())
v1_api.register(SignUpResource())
v1_api.register(TracksResource())
urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'MusicStore.views.home', name='home'),
    # url(r'^MusicStore/', include('MusicStore.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
     url(r'^admin/', include(admin.site.urls)),
     url(r'^api/', include(v1_api.urls)),
)
