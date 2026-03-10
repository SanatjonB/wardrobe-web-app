This is a very minimalistic design of a wardrobe app
you need two things a supabase acc and a resend acc

1)NEXT_PUBLIC_SUPABASE_URL=
1)NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
2)RESEND_API_KEY=

1 label is for your supabase
create a account then that info and create a env.local file and put that together
2 label is for resend which is a platform that lets you send emails well I did not create a specific email so it goes to the one i used for sign up same for you

Supabase handles auth here however 3 users can get a confirmation link
you have two options 1 turn off confirmation for user creation
2 go to resend create a actual dns connect that removes the limit from supabase where you can go to email and click smp custom once i do it i will update this read me
