# Green Store
For MANUAL ---> scroll down
## Project modules

# Green Store dev guide

## manual

# Run applicaton locally without container:
If you would like to run the server without using Docker container, please follow the below steps:
1. Install sqlite3:
```
$ sudo apt-get install sqlite3
```
2. Copy the green-store/.env file into the green-store/src/bin directory:
```
green-store $ cp .env src/bin/
```
3. Run ```green-store/src $ npm install```
4. Run ```green-store/src $ /bin/sh ./start.sh```
   
The application server should now be running directly in the host OS, using the port specified in the .env file (8091 by default for now)\
If you encounter problems, please create an issue for this repository. 
# Run application locally using Docker Compose (recommended for development):
Always make sure using the correct Docker context, by executing:
```
green-store $ docker context use default
```
Build the Docker image:
```
green-store $ docker compose up --build -d 
```
Note 1: This will run the container as soon as the image is built. \
Note 2 : . (this note will appear during deployment setup)
 
If the image is already built, starting or stopping the container is as easy as running ```docker compose up``` or ```docker compose down```.


# Update the image in the Azure Container Registry (use to update the application hosted at Azure)
This section will be completed during deployment setup
# Run and stop the live remote container 
This section will be completed during deployment setup
# Live demo of the hosted container instance
```diff
- NOT YET AVAILABLE
```
1. Visit xxx://xxx.xxx.azurecontainer.io (the FQDN will be updated during deployment setup)
# Change the network port used to access the application
To change the port used to access the application you need to modify the **.env** file.
# Where do I learn more about the project technologies?
To learn more about the project, you can visit the repository community wiki: (doesn't exist yet)
If you feel like sharing the knowledge about the project technologies or have useful resources to include, feel free to contribute to the repository wiki.  
# What needs to be done?
Check issues

