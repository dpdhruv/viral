var attributes = 
[ 'business',
  'website',
  'name',
  'tag',
  'email',
  'phone_no',
  'image',
  'primary_colour',
  'secondary_colour',
  'theme_id',
  'social_share',
  'facebook_message',
  'linkedin_message',
  'twitter_message',
  'instagram_message',
  'pinterest_message',
  'messanger_message',
  'whatsapp_message',
]


for(let i=0; i < attributes.length; i++)    {
    // console.log(`router.get('/settings/${attributes[i]}',async (req, res, next) => {
    //     Settings.findOne({}).then(s => {
    //         res.send(s.${attributes[i]})
    //     }).catch(next)
    // });`
    // console.log(`router.post('/settings/${attributes[i]}',async (req, res, next) => {
    //     Settings.findOne({}).then(s => {
    //         s.${attributes[i]} = req.body.${attributes[i]}
    //         s.save()
    //     })
    // });`)
    console.log(`/settings/${attributes[i]}
    `)
    //console.log('')
}



