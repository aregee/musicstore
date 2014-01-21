from fabric.api import *

user = "aregee"
#Provide the username you used while setting up the project.
key =  "269eab44987203289aceec32a72b524b5b030e58"

#Add the api_key that you createdd in the admin 
# Supply User Pin from profile for autmated testing 
pid_1 = "1"
pid_2 = "2"
pin_1 = "081e1c"
pin_2 = "2c566a"

def setup():

    local("python manage.py syncdb --noinput")
    local("python manage.py migrate")

def update_search():
    local("python manage.py update_index")

def start():
    local("python manage.py runserver")

def PostUser():
    
    print("\nTo Register a new user We will post his/her email ,desired username , password  to /signup endpoint \n")
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"username":"spock","email":"some@mail.com","password":"notebook"}' http://127.0.0.1:8000/api/v1/signup/""" )
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"username":"kirk", "email":"some@mail.com","password":"notebook"}' http://127.0.0.1:8000/api/v1/signup/""" )
  



def GetUser():
    #print("\n~ To login , we require username and password as data parms for /users/login/ endpoint and returns their API_KEY , Pin and basic user bio like below ~ \n")
    local("""curl --dump-header - -H "Content-Type:application/json" -X POST --data '{"username":"spock","password":"notebook" }' http://127.0.0.1:8000/api/v1/users/login/""")
    local("""curl --dump-header - -H "Content-Type:application/json" -X GET http://127.0.0.1:8000/api/v1/users/1/playlists/""") 
  

def PostPlaylist():
    #print("\n ~ For every newly created user, we would add a Live Contact Card and Genrate their Unique 6 digits pin , API endpoint /profiles/ which take following data user , first_name, last_name ~ \n")
    local("""curl --dump-header - -H "Content-Type:application/json" -X POST --data '{"play_user":"/api/v1/users/1/" , "playlist_name":"SomePlayList" ,"tracks":["/api/v1/tracks/2/"] }' http://127.0.0.1:8000/api/v1/playlists/""" )
    #  local("""curl --dump-header - -H "Content-Type:application/json" -X POST --data '{"user":"/api/v1/users/2/" , "first_name":"Captain" ,"last_name":"Kirk" }' http://127.0.0.1:8000/api/v1/profiles/""" )
    #GetUser()
    #local("""curl --dump-header - -H "Content-Type:application/json" -X POST --data '{"user":"/api/v1/user/uhura/" , "about_me":"Hello I am Uhura" }' http://127.0.0.1:8000/api/v1/profile/?username=%s\&api_key=%s""" % (user,key))
    #local("""curl --dump-header - -H "Content-Type:application/json" -X POST --data '{"user":"/api/v1/user/kirk/" , "about_me":"Hello I am Kirk,Captain of the USS Enterprise" }' http://127.0.0.1:8000/api/v1/profile/?username=%s\&api_key=%s""" % (user,key))
    #local("""curl --dump-header - -H "Content-Type:application/json" -X POST --data '{"user":"/api/v1/user/anshula/" , "about_me":"Hello I am Anshula of the USS Enterprise" }' http://127.0.0.1:8000/api/v1/profile/?username=%s\&api_key=%s""" % (user,key))

def PostTracks():
    #print("\nTo add a new Contact to your ContactBook , simply Follow your friends SmarCard like this  ")
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"artist_name":"Pink Floyd","track_name":"Astronomy Domine"}'  http://127.0.0.1:8000/api/v1/tracks/""" )
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"artist_name":"Pink Floyd","track_name":"Wish You were here"}'  http://127.0.0.1:8000/api/v1/tracks/""" )
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"artist_name":"Pink Floyd","track_name":"Time"}'  http://127.0.0.1:8000/api/v1/tracks/""" )
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"artist_name":"Pink Floyd","track_name":"High Hopes"}'  http://127.0.0.1:8000/api/v1/tracks/""" )
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"artist_name":"Pink Floyd","track_name":"Poles Apart"}'  http://127.0.0.1:8000/api/v1/tracks/""" )
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"artist_name":"Pink Floyd","track_name":"Welcome to the Machine"}'  http://127.0.0.1:8000/api/v1/tracks/""" )
    local("""curl --dump-header - -H "Content-Type: application/json" -X POST --data '{"artist_name":"Pink Floyd","track_name":"Have a Cigar"}'  http://127.0.0.1:8000/api/v1/tracks/""" )
    
def PatchPlaylist():
    local("""curl --dump-header - -H "Content-Type:application/json" -X PATCH --data '{ "playlist_name":"Greatests Hits Collection Pink Floyd","tracks":["/api/v1/tracks/11/","/api/v1/tracks/5/","/api/v1/tracks/6/","/api/v1/tracks/7/","/api/v1/tracks/8/","/api/v1/tracks/9/","/api/v1/tracks/10/","/api/v1/tracks/12/"] }' http://127.0.0.1:8000/api/v1/playlists/1/""" )



def GetTest():
    GetUser()

def Init():
    PostUser()
    GetUser()
    
def PostTest():
    PostUser()
    PostTracks()
    PostPlaylist()
    GetUser()
    PatchPlaylist()    
    GetUser()



def dbClean():
    local("./manage.py flush")
    
