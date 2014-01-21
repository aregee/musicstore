from django.db import models
from django.contrib.auth.models import User
import os,datetime
from django.utils import timezone 
#from binascii import hexlify 
from django.core.exceptions import ValidationError
from tastypie.models import create_api_key

try:
	models.signals.post_save.connect(create_api_key, sender=User)
except Exception, e:
	pass



#def _create_Id():

#		return hexlify(os.urandom(3))


"""class UserProfile(models.Model):
	user = models.ForeignKey(User, related_name="user")
	first_name = models.CharField(max_length="40", blank=False)
	last_name = models.CharField(max_length="40",blank=False)
	user_pin = models.CharField(max_length=6,primary_key=True,default=_create_Id)

def __unicode__(self):
	return "%s" % self.user.first_name"""
   		
class Tracks(models.Model):
 	track_name = models.CharField(max_length="60", blank=False)
 	artist_name = models.CharField(max_length="60", blank=True)

 	def __unicode__(self):

 		return self.track_name

class Playlist(models.Model):
	user = models.ForeignKey(User, related_name='play_user')
	playlist_name = models.CharField(max_length='60',blank=False)
	tracks = models.ManyToManyField(Tracks,blank=True)
	def __unicode__(self):
		return self.playlist_name

class AddSongModel(models.Model):
	playlist = models.ForeignKey(Playlist, related_name='play_list')
	track = models.ForeignKey(Tracks, related_name='play_track')
	created = models.DateTimeField(default=timezone.now)

	class Meta:
	 	unique_together = ('playlist', 'track')


	def __unicode__(self):
		return "%s added  %s to  playlist : %s " % (self.playlist.user.username, self.track , self.playlist)





# Create your models here.
