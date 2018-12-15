# MasseyHacks Registration System (CODENAME: GOOSE)

[![Greenkeeper badge](https://badges.greenkeeper.io/MasseyHacks/MasseyHacks-V-Registration.svg)](https://greenkeeper.io/)
[![Travis-CI badge](https://travis-ci.org/MasseyHacks/MasseyHacks-V-Registration.svg?branch=master)

Registration system for MasseyHacks V. Goose is currently being developed and is extremely unstable at the current state. Please use with caution.

**Setup**

Start off with making the db directory and running mongodb

```
mkdir db
mongod --dbpath db
```

Run

```
npm install
```

to install all dependencies. If you are running on a system with low memory (< 1GB). Please allocate space for swap to ensure npm can complete its install.

After npm install is completed, run

```
cp .env.template .env
```

to create a new settings file. Fill in all the fields. 

After that, run 

```
cp config/data/organizers.json.template config/data/organizers.json
```

to create a new organizers file. This will store the initial organizers who will have superuser access. Edit the default values to your information.

To start goose, run

```
npm start
```

Congrats, the Goose server should now be running!(Hopefully)

___
Developed By: Henry Tu, James Xu, Ryan Zhang, David Hui
