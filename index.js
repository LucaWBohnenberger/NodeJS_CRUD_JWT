import dotenv from 'dotenv';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';   
import pdf from 'html-pdf';
    
dotenv.config();
const prisma = new PrismaClient();

const app = express();
app.use(express.json());  
 

//Rota de authenticação
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return res.status(422).json({ error: 'Email or password is missing' });
  }
  
  const userExists = await prisma.user.findUnique({
    where: {
      email, 
    }, 
  }); 

  if(!userExists) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, userExists.password);

  if(!isPasswordCorrect) {
    return res.status(422).json({ error: 'Password is incorrect' });
  }

  const secret = process.env.SECRET;
  const token = jwt.sign({ id: userExists.id }, secret)

  res.status(200).json({msg: 'Login successfully', token});

})
 

//CRUD users
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();

  res.status(200).json(users);
});

app.get('/users/:id', async (req, res) => {
  const users = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json(users);
});


app.post('/users', async (req, res) => {

  const { email, password , level, name} = req.body;

  if(!email || !password || !name) {
    return res.status(422).json({ error: 'Email, password or name is missing' });
  }

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  }); 

  if(userExists) {
    return res.status(422).json({ error: 'Email alredy registered, please use another email' });
  }

  //Modiify password to hash
  const salt = await bcrypt.genSalt(11);
  const hash = await bcrypt.hash(password, salt);

  //Create user
  await prisma.user.create({
    data: {
      name,
      level,
      email,
      password: hash,
    },
  }

  );

  res.status(201).json(req.body);
});

 
app.put('/users/:id', async (req, res) => {

  const { email, password , level, name} = req.body;

  //Modiify password to hash
  const salt = await bcrypt.genSalt(11);
  const hash = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where:{
      id: req.params.id,
    },
    data: {
      name,
      email,
      level,
      password: hash,
    },
  });

  res.status(201).json(req.body);
});


app.delete('/users/:id', async (req, res) => {
  
    await prisma.user.delete({
      where:{
        id: req.params.id,
      },
    });
    
    res.status(204).send();
});

//Teste 
app.get('/teste', async (req, res) => {
  const users = await prisma.user.findMany();
    
  ejs.renderFile('print.ejs' , {users}, (err, html) => {
    if(err) {
      return res.status(500).json({ msg:'Internal server error'});
    }
    
    const options = {
      height: '11.25in',
      width: '8.5in',
      header:{
        height: '20mm',
      },
      footer:{
        height: '20mm',
      }
    };

    //Create PDF
    pdf.create(html, options).toFile('report.pdf', (err, data) => {
      if(err) {
        return res.status(500).json({ msg:'Internal server error'});
      }

      res.status(201).json({ msg:'Report created', data});
    });
  });
})


//Private route
app.get('/opa', verifyJWT, async (req, res) => {

  const user = await prisma.user.findUnique({
    where: {
      id: req.body.id,
    },
  });

  if(user.level < 4) {
    res.status(401).json({ msg:'Access denied'});
  }


  const users = await prisma.user.findMany();
    
  ejs.renderFile('print.ejs' , {users}, (err, html) => {
    if(err) {
      return res.status(500).json({ msg:'Internal server error'});
    }
    
    const options = {
      height: '11.25in',
      width: '8.5in',
      header:{
        height: '20mm',
      },
      footer:{
        height: '20mm',
      }
    };

    //Create PDF
    pdf.create(html, options).toFile('report.pdf', (err, data) => {
      if(err) {
        return res.status(500).json({ msg:'Internal server error'});
      }

      res.status(201).json({ msg:'Report created', data});
    });
  });

})

function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) {
    res.status(401).json({ msg:'Access denied'});
  }

  try{
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();

  } catch(error) {
    res.status(401).json({ msg:'Invalid token'});
  }
}



app.listen(3000)
