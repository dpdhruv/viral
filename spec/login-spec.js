const request = require('request');
const server = 'http://localhost';
const port = 8080;
const roles = require('../config/roles');
const { getJWT } = require('./helper/jwt');



describe('Login suite', () => {

    it('Successful login', async () => {
        await new Promise((resolve) => {
            request.post(`${server}:${port}/login`, { form: { username: 'parth9218', password: 'ASDFGG1234asdf@43'}}, async (error, response, body) => {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(body)).toEqual({ status: 'success', message: 'Successful Authentication'});
                try {
                    let jwt = await getJWT(roles.USER, response);
                    expect(jwt.useruuid).toBe('parth9218');
                }   catch(err)  {
                    fail(err);
                }
                resolve();
            });
        });
    });

    it('Failed Login', async  () => {
        await new Promise((resolve) => {
            request.post(`${server}:${port}/login`, { form: { username: 'parth9218', password: 'Zaree'}}, (error, response, body) => {            expect(response.statusCode).toBe(401);
                expect(JSON.parse(body)).toEqual({ status: 'failure', message: 'Invalid Username or password'});
                resolve();
            });
        });
    });
})