const https = require('https');
const { google } = require('googleapis');

class FCM {
    constructor(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid configuration object.');
        }

        const { project_id, client_email, private_key } = config;

        if (!project_id) throw new Error('No project ID is given.');
        if (!client_email) throw new Error('No client email is given.');
        if (!private_key) throw new Error('No private key is given.');

        this.project_id = project_id;
        this.client_email = client_email;
        this.private_key = private_key;
        this.fcmOptions = {
            host: 'fcm.googleapis.com',
            path: `/v1/projects/${project_id}/messages:send`,
            method: 'POST'
        };
    }

    async getAccessToken() {
        const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
        const jwtClient = new google.auth.JWT(
            this.client_email,
            null,
            this.private_key,
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