// const request = require('request');
// const server = 'http://localhost';
// const port = 8080;

// describe('Redeem a coupon', () => {
//     it('Valid coupon', async () => {
//         await new Promise((resolve) => {
//             request.post(`${server}:${port}/admin/validation/redeem`, { form: { coupon: '519e2a20-955b-4b21-8213-2cf2b644db04', user: 'prayag9218' } }, (error, response, body) => {
//                 expect(response.statusCode).toBe(200);
//                 expect(JSON.parse(body)).toEqual({ status: 'success', message: 'Valid Coupon', action: 'valid'});
//                 resolve();
//             });
//         });
//     });

//     it('Used coupon', async () => {
//         await new Promise((resolve) => {
//             request.post(`${server}:${port}/admin/validation/redeem`, { form: { coupon: '519e2a20-955b-4b21-8213-2cf2b644db04', user: 'prayag9218' } }, (error, response, body) => {
//                 expect(response.statusCode).toBe(200);
//                 expect(JSON.parse(body)).toEqual({ status: 'success', message: 'Coupon has been used', action: 'used'});
//                 resolve();
//             });
//         });
//     });
// })