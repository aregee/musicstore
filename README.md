##Assignment for OpenLabs

### Setup Instructions :
  
    $ cd MusicStore_server/
    $ virtualenv mstore_env
    $ source mstore_env/bin/activate 
    $ pip install -r requirements.txt 
    $ fab setup start 
 
### To test APIs :

    $ cd MusicStore_server/
    $ source mstore_env/bin/activate
    $ fab PostTest  
 
### Setup Client 

    $ cd MusicStore_server/
    $ ./serve.sh
 
 
