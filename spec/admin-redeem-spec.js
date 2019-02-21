const request = require('request');
const server = 'http://localhost';
const port = 8080;

let coupon = '';
let user = '';

describe('Redeem a coupon', () => {
    it('Valid coupon', async () => {
        await new Promise((resolve) => {
            request.post(`${server}:${port}/admin/validation/redeem`, { form: { coupon: coupon, user: user } }, (error, response, body) => {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(body)).toEqual({ status: 'success', message: 'Valid Coupon', action: 'valid'});
                resolve();
            });
        });
    });

    it('Used coupon', async () => {
        await new Promise((resolve) => {
            request.post(`${server}:${port}/admin/validation/redeem`, { form: { coupon: coupon , user: user } }, (error, response, body) => {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(body)).toEqual({ status: 'success', message: 'Coupon has been used', action: 'used'});
                resolve();
            });
        });
    });
})