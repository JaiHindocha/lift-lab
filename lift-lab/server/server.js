const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // disable SSL when running locally
  ssl: {
    rejectUnauthorized: false,
  },
});

// Define API routes and handlers
// Example API route to get all users
app.get('/users', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    const users = result.rows;
    client.release();
    res.json(users);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getAllPlans', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM workout_plan');
    const users = result.rows;
    client.release();
    res.json(users);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/getPlanByCategory', async (req, res) => {
  try {
    const client = await pool.connect();
    const {category} = req.body;
    // There is a table called plan_catergory that links workout_plan and catergory. It has two columns, plan_id and catergory_id.
    const result = await client.query(
      `SELECT DISTINCT workout_plan.name, workout_plan.description, workout_plan.plan_id FROM workout_plan, plan_category, category
       WHERE workout_plan.plan_id = plan_category.plan_id AND plan_category.category_id = category.category_id AND LOWER('` + category + `') = LOWER(category.category)`);
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/searchPlans', async (req, res) => {
  try {
    const client = await pool.connect();
    const {search} = req.body;
    const result = await client.query( 
      `SELECT DISTINCT workout_plan.name, workout_plan.description, workout_plan.plan_id FROM workout_plan
       WHERE LOWER(workout_plan.name) LIKE LOWER('%` + search + `%') OR LOWER(workout_plan.description) LIKE LOWER('%` + search + `%')`);
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/setPlan', async (req, res) => {
  try {
    const client = await pool.connect();
    const {user_id, plan_id} = req.body;
    const result = await client.query(
      `UPDATE users SET plan_id = '`+plan_id+`' WHERE user_id = '`+user_id+`'`);
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getExercises', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM exercise');
    const exercises = result.rows;
    client.release();
    res.json(exercises);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addPlan', async (req, res) => {
  try {
    const client = await pool.connect();
    const {user_id, name, description} = req.body;
    const result = await client.query("INSERT INTO workout_plan (user_id, name, description) VALUES ('"+user_id+"','"+name+"', '"+description+"') RETURNING plan_id");
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/categories', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM category');
    const categories = result.rows;
    client.release();
    res.json(categories);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addCategoryToPlan', async (req, res) => {
  try {
    const client = await pool.connect();
    const {plan_id, category} = req.body;
    const result = await client.query("INSERT INTO plan_category (plan_id, category_id) VALUES ('"+plan_id+"','"+category+"')");
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/addWeek', async (req, res) => {
  try {
    const client = await pool.connect();
    const {plan_id, week} = req.body;
    const result = await client.query("INSERT INTO week (plan_id, week) VALUES ('"+plan_id+"','"+week+"')");
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addDay', async (req, res) => {
  try {
    const client = await pool.connect();
    const {week_id, day} = req.body;
    const result = await client.query("INSERT INTO week (week_id, day) VALUES ('"+week_id+"','"+day+"')");
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addExerciseToPlan', async (req, res) => {
  try {
    const client = await pool.connect();
    const {day_id, exercise_id, sets, reps} = req.body;
    const result = await client.query("INSERT INTO day_to_week (day_id, exercise_id, sets, reps) VALUES ('"+day_id+"', '"+exercise_id+"', '"+sets+"', '"+reps+"')");
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/plan', async (req, res) => {
  try {
    const client = await pool.connect();
    const {user_id, week} = req.body;
    const result = await client.query(
      `SELECT day, day_to_week_id, sets, reps, exercise.name, exercise.description, exercise.image, day FROM day_to_week, exercise, day
      WHERE day_to_week.exercise_id = exercise.exercise_id AND day.day_id = day_to_week.day_id AND
      day_to_week.day_id IN
      (SELECT day_id FROM day WHERE day.week_id =
      (SELECT week_id FROM week WHERE week.week = '`+week+`'
      AND week.plan_id = (SELECT plan_id FROM users WHERE user_id = '`+user_id+`'))
      GROUP BY day_id)`);
    const rows = result.rows;
    const days = rows.reduce((groups, item) => {
      const { day } = item;
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(item);
      return groups;
    }, {});

    client.release();
    res.json(days);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

// Get name of a user's plan.
app.post('/plan/name', async (req, res) => {
  try {
    const client = await pool.connect();
    const {user_id} = req.body;
    const result = await client.query(
      `SELECT workout_plan.name FROM workout_plan WHERE workout_plan.plan_id = (SELECT plan_id FROM users WHERE user_id = '`+user_id+`')`);
    const rows = result.rows;
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const client = await pool.connect();
    const {username, password} = req.body;
    const result = await client.query("SELECT * FROM users WHERE username = '"+username+"'");
    const user = result.rows;
    const passwordsMatch = bcrypt.compareSync(password, user[0].password);
    if (passwordsMatch) {
      const payload = {
        user: {
          id: user[0].user_id,
          username: user[0].username,
          first_name: user[0].first_name,
          last_name: user[0].last_name
        }
      };

      jwt.sign(payload, "tammyStreet", {expiresIn: 10000},
        (err, token) => {
          if (err) throw err;
          res.status(200).json({token});
        }
      );
    }
    else {
      res.status(400).send("The password does not match.");
    }
    client.release();
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/users/signup', async (req, res) => {
  try {
    const client = await pool.connect();
    const {username, email, first_name, last_name, password} = req.body;

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    let user = await client.query("SELECT * FROM users WHERE username = '"+username+"' OR email = '"+email+"'");
    if (user.rows.length > 0) {
      res.status(400).send("Username or email already exists.");
    } else {
      const result = await client.query('INSERT INTO users (username, email, first_name, last_name, password) VALUES ($1, $2, $3, $4, $5)', 
      [username, email, first_name, last_name, hashedPassword]);
      res.status(200).send("User created");
      
      user = await client.query("SELECT * FROM users WHERE username = '"+username+"'");

      const payload = {
        user: {
          id: user[0].user_id,
          username: user[0].username,
          first_name: user[0].first_name,
          last_name: user[0].last_name
        }
      };

      jwt.sign(payload, "tammyStreet", {expiresIn: 10000},
        (err, token) => {
          if (err) throw err;
          res.status(200).json({token});
        }
      );
    }

    client.release();
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/currentWeek', async (req, res) => {
  try {
    const client = await pool.connect();
    const {user_id} = req.body;
    const result = await client.query("SELECT week FROM users WHERE user_id = '" + user_id + "' ");
    const users = result.rows;
    client.release();
    res.json(users);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/track', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("INSERT INTO user_track (day_to_week_id, user_id, set, reps, weight) VALUES ($1, $2, $3, $4, $5)", [1, 11, 1, 3, 100]);
    client.release();
    res.status(200).send('Workout tracked');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addExercise', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO exercise (name, type) VALUES ($1, $2)', ['Bench Press', '{Chest, Triceps}']);
    client.release();
    res.status(200).send('Exercise created');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addWeek', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO week (plan_id, week) VALUES ($1, $2)', [3, 1]);
    client.release();
    res.status(200).send('Week created');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addDay', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO day (week_id, day) VALUES ($1, $2)', [1, 'Monday']);
    client.release();
    res.status(200).send('Day created');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addWorkout', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO day_to_week (day_id, exercise_id, sets, reps) VALUES ($1, $2, $3, $4)', [1, 1, 1, 1]);
    client.release();
    res.status(200).send('Workout created');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/setUserPlanReps', async (req, res) => {
  try {
    const client = await pool.connect();
    const { day_to_week_id, user_id, set, reps } = req.body;
    const result = await client.query( 
      "INSERT INTO user_track (day_to_week_id, user_id, set, reps) " +
      "VALUES($1, $2, $3, $4) " +
      "ON CONFLICT (day_to_week_id, user_id, set) DO UPDATE " +
      "SET reps = EXCLUDED.reps",
      [day_to_week_id, user_id, set, reps]
    );
    client.release();
    res.status(200).send('Reps updated / inserted');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/setUserPlanWeight', async (req, res) => {
  try {
    const client = await pool.connect();
    const { day_to_week_id, user_id, set, weight } = req.body;
    const result = await client.query( 
      "INSERT INTO user_track (day_to_week_id, user_id, set, weight) " +
      "VALUES($1, $2, $3, $4) " +
      "ON CONFLICT (day_to_week_id, user_id, set) DO UPDATE " +
      "SET weight = EXCLUDED.weight ",
      [day_to_week_id, user_id, set, weight]
    );
    client.release();
    res.status(200).send('Weight updated / inserted');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/getUserPlanReps', async (req, res) => {
  try {
    const client = await pool.connect();
    const { user_id, day_to_week_id, set } = req.body;
    const result = await client.query("SELECT reps FROM user_track WHERE user_id = '" + user_id + "' AND day_to_week_id = '" + day_to_week_id + "' AND set = '" + set + "'");
    const users = result.rows;
    client.release();
    res.json(users);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/getUserPlanWeight', async (req, res) => {
  try {
    const client = await pool.connect();
    const { user_id, day_to_week_id, set } = req.body;
    const result = await client.query("SELECT weight FROM user_track WHERE user_id = '" + user_id + "' AND day_to_week_id = '" + day_to_week_id + "' AND set = '" + set + "'");
    const users = result.rows;
    client.release();
    res.json(users);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
