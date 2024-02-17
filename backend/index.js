const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt');
const mysql = require('mysql2');

const app = express();
app.use(cors())
const port = 9000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: "",
  database: 'finance_tracker_db',
});

app.use(cors());
app.use(bodyParser.json());

// Your routes and authentication logic go here 
app.get("/",(req,res)=>{
  res.send("Hi")
})



/*
  
app.post('/login',(req,res)=>{

  const {username,password}=req.body
  const query = 'SELECT * FROM users WHERE username = ? ';
const values = [username]

db.query(query, values, (error, results) => {
  if (error) {
    console.error('Error executing query:', error);
  
    return;
  }
 
 
  if (results.length>0) {

    console.log(results[0])



  
      
  bcrypt.compare(password,results[0].password,(error,response)=>{
      if (error){
        console.log(results)
        console.log("Failed")
        return res.json({message:"Failed"})
      }

  
      
      if (response){
        const data = results; 
        console.log(data)
      
        const token = jwt.sign({ userId: data.user_id, username: data.username }, 
          'your_secret_key', { expiresIn: '24h' });
         console.log({token,})
   return res.json({ jwtToken:token,message:"Login Success",user_id,Status:"Success" });
      }
      else{
        console.log("Password Didn't Match")
        return res.json({message:"Password Didn't Match"})
      } 

  
        
      
     })
     
    
      }else{
        console.log('User not found');
       return res.json({message:"You are not registerd"})
      }
})





})
*/





  
app.post('/register',async(req, res) => {
  const { username, email, password ,confirmPassword} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  
  const checkUserSql = `SELECT * FROM newUsers WHERE username =?   LIMIT 1`;
 const value=[username]

 db.query(checkUserSql,value, (err, results) => {
    if (err) {
      console.error('Error checking user existence:', err);
      res.status(500).json( 'Internal Server Error' );
    } else {
      if (results.length > 0) {
        console.log('User already registered')
        
        res.status(409).json({message:'User already registered'} );
      } else {
        
        const insertUserSql = 'INSERT INTO newUsers (username, email, password) VALUES (?, ?,?)';
        const insertUserValues = [username, email, hashedPassword];

        db.query(insertUserSql, insertUserValues, (err, results) => {
          if (err) {
            console.error('Error inserting user:', err);
            res.status(500).json('Internal Server Error' );
          } else {
            console.log('Registered successfully');
            res.status(200).json( {message:'Registered successfully'} );
          }
        });
      }
    }
  });
});






app.post('/login',(req,res)=>{

  const {username,password}=req.body
  const querys = 'SELECT user_id,username,password FROM newUsers WHERE username = ? ';
const values = [username]

db.query(querys, values, (error, results) => {
  if (error) {
    console.error('Error executing query:', error);
  
    return res.json({error:"Failed"});
  }
 
 
  if (results.length>0) {
   

const hashedPassword=results[0].password

  bcrypt.compare(password,hashedPassword,(error,response)=>{
      if (error){
        console.log("Failed")
        return res.json("Failed")
      }
      
      if (response){
        const data = results[0]; 
        const userId=data.user_id;
        const name=data.username; 
       
 
       
        const token = jwt.sign({ userId: data.user_id, username: data.username }, 'your_secret_key', { expiresIn: '24h' });
  
   return res.json({ usernamee:name,Status: 'Success', token,userId ,message:"Login Successful"});
      }else{
        console.log("Password Didn't Match")
        return res.json("Password Didn't Match")
      }

  
        
      
     })
     
    
      }else{
        console.log('User not found');
       return res.json("You are not registerd")
      } 
})

})


// API endpoint to add an expense
app.post('/api/addExpense', (req, res) => {
  const { amount, date, category, type, description,userId } = req.body;

  const sql = 'INSERT INTO transactions (amount, date, category, type, description,user_id) VALUES (?, ?, ?, ?, ?,?)';
  const values = [amount, date, category, type, description,userId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log('Error adding expense to the database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Expense added to the database');
      res.status(201).json({ message: 'Expense added successfully' });
    }
  });
});


app.get('/api/getExpenses/:userId', (req, res) => {
  const userId = req.params.userId;
const id=[userId]
  const query='select * from transactions where user_id=?'

  db.query(query, id,(err, results) => {
    if (err) {
      console.log('Error executing SELECT query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Fetched data from the transactions table:', results);
      console.log(results)
      res.status(200).json(results);
    }
  });
});

// API endpoint to delete an expense
app.delete('/api/deleteExpense/:id', (req, res) => {
  const expenseId = req.params.id;

  const sql = 'DELETE FROM transactions WHERE id = ?';
  const values = [expenseId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error deleting expense from the database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Expense deleted from the database');
      res.status(200).json({ message: 'Expense deleted successfully', });
    }
  });
});


app.get('/api/getExpense/',(req,res)=>{

  const param1 = req.query.param1
  const param2 = req.query.param2
  let sql
 
  if (param2!=="all"){
   
    sql=`select * from transactions where user_id=${param1} AND type=${param2} `

  }else if  (param2==="all"){

    sql=`select * from transactions where user_id=${param1} `
  }







  
  
  db.query(sql,(err,results)=>{
    if (err){
      console.log("Failed")
      return res.json({error:"Failed"})
    }else{
      console.log("Fetched Successfully")
      console.log(results)
      res.status(200).json(results)
    }
  })
})









app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
