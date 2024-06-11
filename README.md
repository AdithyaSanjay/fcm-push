fcm-push
========
A Node.JS simple interface to Firebase Cloud Messaging (FCM) for Android and iOS

## Installation

Via [npm][1]:

    $ npm install xxxxxxxxxxxxxxxxxxxxxx

## Usage

    var FCM = require('xxxxxxxxxxxxxxxxxxxxxxxxxxx');

    const projectId = ''
    const client_email = ''
    const private_key = ''
    const fcm = new FCM(projectId,client_email,private_key);

    var message = {
        token: 'registration_token_or_topics_name_with_prefix', // required fill with device token or `/topics/${topicName}`
        notification: {
            title: 'Title of your push notification',
            body: 'Body of your push notification'
        }
    };
    
    //callback style
    fcm.send(message, function(err, response){
      if (err) {
          console.log("Something has gone wrong!");
      } else {
          console.log("Successfully sent with response: ", response);
      }
    });

    //promise style
    fcm.send(message)
    .then(function(response){
        console.log("Successfully sent with response: ", response);
    })
    .catch(function(err){
        console.log("Something has gone wrong!");
        console.error(err);
    })
