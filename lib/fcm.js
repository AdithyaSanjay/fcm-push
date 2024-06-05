const https = require('https');
const { google } = require('googleapis');

class FCM {
    constructor(projectId, keyFilePath) {
        if (!projectId) throw new Error('No project ID is given.');
        if (!keyFilePath) throw new Error('No key file path is given.');

        this.projectId = projectId;
        this.keyFilePath = keyFilePath;
        this.fcmOptions = {
            host: 'fcm.googleapis.com',
            path: `/v1/projects/${projectId}/messages:send`,
            method: 'POST'
        };
    }

    async getAccessToken() {
        const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
        const key = require(this.keyFilePath);
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );

        return new Promise((resolve, reject) => {
            jwtClient.authorize((err, tokens) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tokens.access_token);
                }
            });
        });
    }

    async send(message) {
        try {
            const accessToken = await this.getAccessToken();
            const options = {
                ...this.fcmOptions,
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            };

            const data = JSON.stringify({
                message: message
            });

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let responseData = '';

                    res.setEncoding('utf8');
                    res.on('data', (chunk) => responseData += chunk);
                    res.on('end', () => {
                        console.log('Message sent to Firebase for delivery, response:', responseData);
                        resolve(responseData);
                    });
                });

                req.on('error', (err) => {
                    console.error('Unable to send message to Firebase:', err);
                    reject(err);
                });

                req.write(data);
                req.end();
            });
        } catch (err) {
            console.error('Error sending message:', err);
        }
    }
}

module.exports = FCM;
