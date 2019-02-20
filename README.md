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

input:  username and password in x-www-urlencoded form
output: json object indicating success or failure in authentication,
        json web token divided in two cookies 

POST /signup

input:  username, password, phone_no, name in x-www-urlencoded form
output: 
    on success:
        wraps encrypted user data in json web token and sends an otp to the phone_no of the user,
        JSON object indicating the status
    on failure:
        json object indicating errors if any of the fields do not meet the requirements while insertion

    
GET /signup
    input:  referral_code of the user in query parameter
    output: wraps referrel_code and username of the corresponding user in JWT,
            JSON object indicating the status



POST /resetpassword
    input: username in x-www-urlencoded form
    output: JWT containing the username, 
            OTP is sent to the phone_no of the corresponding username for verification,
            JSON object indicating the status


----------------------------------VERIFICATION ROUTES ---------------------------------------

POST /verification/sms/:action
    input: action indicating the action which will be invoked after successful verification of otp in the           url, 
            otp in x-www-urlencoded form    if action is signup.
            otp, new_password in x-www-urlencoded form if action is resetpassword

    output: OTP is verified 
            if action is signup, the user data sent along with JWT will be decrypted and new user with these fields will be created and the sms will be sent to him/her.
            if the user is created with referral_code, the referrer will be sent the message informing that her referred person has signed up.

            if action is resetpassword,
            password of the user will be updated

    

----------------------------------------ADMIN ROUTES ---------------------------------------------

POST /validation/redeem
    input: coupon id and username in x-www-urlencoded form
    ouput: JSON object indicating the status of the coupon