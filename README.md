# GTBootcamp_Project2

## Getting Started
### Setup .env File
This file is used by the scripts to connect to the local instance of PostgreSQL.
1. Create a `.env` in the root of the respository. similar to:
    ```
    DB_HOST="localhost"
    DB_USER="<database_username>"
    DB_PASSWD="<database_password>"
    DB_NAME="<database_name>"
    ```

### Setup Database
1. In the local instance of PostgreSQL create a database called `climate_db`:
    ```sql
    DROP DATABASE IF EXISTS climate_db;
    CREATE DATABASE climate_db;
    ```
1. Create the tables using [schema.sql](app/schema.sql)

### Install Required Modules
1. Install `python-dotenv` module
    ```
    pip3 install python-dotenv
    ```
1. Install `flask-sqlalchemy` module
    ```
    pip3 install flask-sqlalchemy
    ``` 
1. Install `psycopg2-binary` module
    ```
    pip3 install psycopg2-binary
    ```