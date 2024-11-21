const express=require("express");
const {open}=require("sqlite");
const path=require("path");
const sqlite3=require("sqlite3");
const cors=require("cors");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

let db;
const app=express();
app.use(express.json());
app.use(cors());

const initializeDBAndServer= async() =>{
    try {
        db=await open({
            filename: path.join(__dirname,"todo.db"),
            driver:sqlite3.Database
        });
        app.listen(3000, ()=>{
            console.log('server running at 3000');
        })
    }
    catch(error){
        console.log("Database error");

    }
}

initializeDBAndServer();

app.post("/users/", async (request, response) => {
    console.log(response.body)
    console.log(request.body)
    const { name ,userName,email,password} = request.body;
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const selectUserQuery = `SELECT * FROM users WHERE name = '${name}'`;
    const dbUser = await db.get(selectUserQuery);
    console.log(dbUser);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          users ( name,username,email,password) 
        VALUES 
          (
            
            '${name}',
            '${userName}',
            '${email}',
            '${hashedPassword}'
            
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(dbResponse);
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status(400).send({message:"User Already Exists"});
      
      
    }
  });

  app.post("/login", async (request, response) => {
    const { userName, password } = request.body;
    console.log(password)
    const selectUserQuery = `SELECT * FROM users WHERE username = '${userName}'`;
    const dbUser = await db.get(selectUserQuery);
    console.log(dbUser)
    console.log("he")
    if (dbUser === undefined) {
      response.status(400);
      
      response.status(400).send({message:"Invalid User"});

    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      console.log(isPasswordMatched)
      if (isPasswordMatched === true) {
        const payload = {
          username: userName,
        };
        const jwt_token = jwt.sign(payload, "MY_SECRET_TOKEN");
        response.send({ jwt_token });
      } else {
        
        response.status(400).send({message:"Invalid Password"});
      }
    }
  });


  
  app.get("/api/books/", async (request, response) => {
    
    try{
      const {
        name,
      } = request.query;
      const getBooksQuery = `
        SELECT
          *
        FROM
         users;`;
      
      const booksArray = await db.all(getBooksQuery);
      console.log(booksArray);
      response.send(booksArray);

    }
    catch(error){
      console.error(error+"hello")
      response.send(500);
    }
  });

  app.post("/api/books1", async (request, response) => {
    
    try{
      const {
        name,
      } = request.body;
      console.log(name);
      
      
    }
    catch(error){
      console.error(error+"hello")
      response.send(500);
    }
  });