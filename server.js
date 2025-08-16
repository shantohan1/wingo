import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'yourpass',
  database: 'msd',
  waitForConnections: true,
  connectionLimit: 10
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function labelOf(n){
  return {
    bigSmall: n >= 5 ? 'BIG':'SMALL',
    oddEven: (n % 2 === 0) ? 'EVEN':'ODD'
  };
}

app.post('/api/rounds', async (req,res)=>{
  try{
    const { round_no, result_int } = req.body;
    const { bigSmall } = labelOf(result_int);
    await db.query(
      'INSERT INTO rounds (round_no, result_int, result_label) VALUES (?,?,?)',
      [round_no, result_int, bigSmall]
    );
    res.json({ok:true});
  }catch(e){ res.status(400).json({ok:false, error:e.message}); }
});

app.get('/api/rounds/latest', async (req,res)=>{
  const n = Number(req.query.n || 50);
  const [rows] = await db.query(
    'SELECT round_no,result_int,created_at FROM rounds ORDER BY id DESC LIMIT ?',
    [n]
  );
  res.json(rows.reverse());
});

app.post('/api/odds', (req,res)=>{
  const { side, stake } = req.body;
  const p = 0.5;
  const payout = 1;
  const ev = p * (stake * payout) + (1 - p) * (-stake);
  res.json({ side, stake, p, ev });
});

app.post('/api/simulate', (req,res)=>{
  const { startingBalance=1000, stake=10, rounds=200, side='BIG' } = req.body;
  let balance = startingBalance;
  const path = [];
  for(let i=0;i<rounds;i++){
    const result = Math.floor(Math.random()*10);
    const isBig = result >= 5;
    const win = (side==='BIG'?isBig:!isBig);
    balance += win ? stake : -stake;
    path.push(balance);
  }
  res.json({ finalBalance: balance, path });
});

app.post('/api/explain', async (req,res)=>{
  const { recent } = req.body;
  const text = recent.map(r=>r.result_int).join(', ');
  const prompt = `
Recent digits: [${text}]
Summarize frequencies & streaks. 
Explain why past results don't predict the future (gambler's fallacy).
Give 3 responsible play tips.
Do NOT predict the next number.
Limit: 120 words.
`;
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{role:"user", content: prompt}],
    temperature: 0.2
  });
  res.json({ message: resp.choices[0].message.content });
});

app.listen(3000, ()=>console.log('API running on http://localhost:3000'));
