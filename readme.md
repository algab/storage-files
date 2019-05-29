# STORAGE FILES

<p align="center">
  <img src="https://raw.githubusercontent.com/algab/storage-files/updates/logo.png">
</p>

API for files storage and control.

## Description

### Bucket

The bucket is the main directory where the files will be stored. A bucket may contain one or more folders and also one or more objects. A user can create only one bucket.

Attention buckets of the same name are not allowed.

### Folder

Folder is a child directory, meaning it belongs to a bucket. A folder can not contain other folders, only objects. Within a bucket can contain as many folders as the user wants to create.

Attention is not allowed folders with the same name.

### Object

Objects is any binary file that will be stored inside a bucket.


## Why SocketIO ?

The socketIO is used to transmit the upload percentage of the files. From the user's nickname, it is possible to capture the percentage of the upload.

