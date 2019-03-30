# viral backend

Server is started by running 'server.js' file.
By default server starts on 8080 port

Environment variables needed for the app are as follows:

VARIABLE                    DEFAULT                     DESCRIPTION

PORT                        8080                        port on which server is going to listen
KEY                         root@1234                   key used to sign JSON web tokens and encrypt data.
DB_URL                                                  postgres database url
APIKEY                                                  apikey to send sms via textlocal



Following are the list of endpoints supported.

----------------------- APP_ROUTES ------------------------------------------

POST /login

input:  username and password in json format
        format: { "username": USERNAME, "password", "PASSWORD" }
output: json object indicating success or failure in authentication,   
        format: { "jwt": "JWT TOKEN", "status": "SUCCESS OR FAILURE", "message": "MESSAGE" }

POST /signup

input:  username, password, phone_no, name, otp and optional referral code in json object
        format: { "username": "USERNAME",
                  "password": "PASSWORD",
                  "name": "NAME",
                  "phone_no": "PHONE_NO",
                  "referral_code": "REFERRAL CODE"              // optional field
                  "otp": "OTP"
                 }
                  
output: json object with status and message and jwt 
        format: { 
                  "jwt": "JWT TOKEN",
                  "status": "SUCCESS OR FAILURE",
                  "message": "MESSAGE" 
                }


POST /resetpassword
    input: username in json
           format: { "username": "USERNAME" }
    output: JWT containing the username, 
            OTP is sent to the phone_no of the corresponding username for verification,
            JSON object indicating the status
            format: { "jwt": "JWT",
                      "otp": "OTP",
                      "status": "SUCCESS OR FAILURE",
                      "message": MESSAGE"
                     }
                     
                     
POST /getotp
        input: json object containing the phone_no
              format: { "phone_no": "PHONE NO" }
              
        output: checks if the valid number is provided, if yes then sends the otp to that number
              format: { "otp": "OTP",
                        "status": "SUCCESS OR FAILURE",
                        "message": "MESSAGE" 
                       }

GET /user
       output: user details are sent
              format: {
                            "status": 'SUCCESS or FAILURE',
                            "message": "",
                            user :
                            {
                                   "username: "USERNAME",
                                   "name": "NAME",
                                   "phone_no": "PHONE_NO"
                            }
                      }

GET /referred_users
       output: counts of the signup users and redeemed users
              format: {
                            "status": 'SUCCESS or FAILURE',
                            "message": "",
                            "users": { "signup_users" : "COUNT", "redeemed_users": "COUNT"}
                      }

GET /coupons
output: returns coupons of the corresponding user as indicated in the useruuid field of jwt
          format: { "status": "SUCCESS" OR "FAILURE"
                    "message": "MESSAGE",
                    "COUPONS": [ list of coupon objects ]         // available only success
                                                                  // in status
                  }             
                  
                  
GET /username/:USERNAME
        output: returns status if the username is available
                format: {
                                status: 'SUCCESS OR FAILURE'
                                message: 'username is available' OR 'username exists'
                        }


----------------------------------VERIFICATION ROUTES ---------------------------------------
route: /verification

POST /sms/:action
    input: action indicating the action which will be invoked after successful verification of otp in the url, 
           action--> resetpassword
           format: { "otp": "OTP", "password": "NEW PASSWORD" }
      

    output: if action is resetpassword and the otp matches with the one sent to the phone number of the user
            the password of that user will be replaced with the new_password and the status message will be 
            sent in the response
            format: { "status": "SUCCESS OR FAILURE", "message": "MESSAGE" }

    

----------------------------------------ADMIN ROUTES ---------------------------------------------

route: /admin

POST /validation/redeem
    input: coupon id and username in json object
           format: { "coupon: "COUPON ID", "user": "USERNAME" }
    ouput: if coupon is valid and not used, the status of the coupon will be updated to used and appropriate response
           will be sent
           format: { "status": "SUCCESS OR FAILURE", "message": "MESSAGE", "action": "ACTION" }
           
GET /coupons
    ouput: all the coupons available in the database will be returned in list of json objects
    
GET /coupons/:userid
    output: all the coupons of the user indicated by the userid will be returned
    
