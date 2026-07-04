import express from 'express';
const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello World maza a gya h !");
});

export default app;
