# A small backend project in NodeJS

### For it to work correctly, it is necessary to create an .env with the link to a mangoDB database as follows DATABASE_URL='mongodb+srv://(user name):(password)@cluster0.hpermdi.mongodb.net/(cluster name)?retryWrites=true&w=majority&appName=Cluster0' and it is also necessary to add a term for how bcrypt works in the .env, it must be done as follows SECRET= (several random letters).


This project has a CRUD for users, an authentication route with JWT and a password encryption system with bcrypt. Furthermore, it has a route that prints a PDF with the list of all users, which can only be accessed via the jwt token and the account ID having level 4 or higher.
