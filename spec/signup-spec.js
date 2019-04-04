const request = require('request');
const server = 'http://localhost';
const port = 8080;
const { getJWT } = require('./helper/jwt');
const { decrypt } = require('../helper/crypt');
const roles = require('../config/roles');
let referral_code = 'lmiiXUD';


describe('Sign up suite', () => {

    it('valid user details', async () => {
        await new Promise((resolve) => {
            let user = {
                username: 'mas123',
                password: 'root@F154',
                phone_no: '7938238195',
                name: 'Mas'
            }
            request.post(`${server}:${port}/signup`, { form: user}, async  (error, response, body) => {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(body)).toEqual({ status: 'success', message: 'otp has been sent for verification'});
                try {
                    let jwt = await getJWT(roles.VERIFY_NEW_USER, response);
                    expect({ role: jwt.role, user: JSON.parse(decrypt(jwt.user)) }).toEqual({ role: 'verify_new_user', user: user});
                }   catch(err)  {
                    fail(err);
                }
                resolve();
            });
        });
    })

    it('Existing username and phone', async () => {
        await new Promise((resolve) => {
            let user = {
                username: 'parth9218',
                password: 'Zareen123@',
                phone_no: '9409521572',
                name: 'Parth'
            }
            request.post(`${server}:${port}/signup`, { form: user}, (error, response, body) => {
                expect(response.statusCode).toBe(406);
                expect(JSON.parse(body)).toEqual({ status: 'failure', message: 'Username exists\nphone_no exists\n'});
                resolve();
            });
        });
    })

    it('enters Invalid details', async () => {
        await new Promise((resolve) => {
            let user = {
                username: '23324a',
                password: 'fdasgr',
                phone_no: '23431532',
                name: '32!'
            }
            request.post(`${server}:${port}/signup`, { form: user}, (error, response, body) => {
                expect(response.statusCode).toBe(406);
                expect(JSON.parse(body)).toEqual({ status: 'failure', message: `Invalid Username\nInvalid Password\nInvalid phone number\nInvalid name\n`});
                resolve();
            });
        });
    })

    it('send valid referrel code', async () => {
        await new Promise((resolve) => {
            request.get(`${server}:${port}/signup?referral_id=${referral_code}`,async  (error, response, body) => {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(body)).toEqual({ status: 'success', message: `sign up as with referral id`});
                try {
                    await getJWT(roles.SIGNUP_REFERRAL, response);
                }   catch(err)  {
                    fail(err);
                }
                resolve();
            });
        });
    })

    it('send invalid referrel link', async () => {
        await new Promise((resolve) => {
            let referral_code = '234wef'
            request.get(`${server}:${port}/signup?referral_id=${referral_code}`, (error, response, body) => {
                expect(response.statusCode).toBe(412);
                expect(JSON.parse(body)).toEqual({ status: 'failure', message: `Invalid referral id`});
                resolve();
            });
        });
    })
});