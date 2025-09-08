const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 4000;

// Enable CORS with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // For now, we'll use a simple token format: "uid-timestamp"
  // In production, you'd want to use proper JWT tokens
  if (!token.startsWith('uid-')) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  const uid = token;
  
  // Verify user exists
  db.get('SELECT uid, email, name FROM users WHERE uid = ?', [uid], (err, user) => {
    if (err) {
      console.error('[AUTH] Database error:', err);
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
};

// Helper function to generate UUID
const generateId = () => {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// SQLite DB setup
const dbPath = path.join(__dirname, 'kairos-auth.db');
console.log('[DB] Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Error opening database:', err.message);
    process.exit(1); // Exit if we can't open the database
  }
  console.log('[DB] Connected to SQLite database');
});

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL,
    uid TEXT UNIQUE NOT NULL,
    createdTime INTEGER NOT NULL,
    lastLoginTime INTEGER
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating users table:', err.message);
    } else {
      console.log('[DB] Users table ready');
    }
  });

  // Projects table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tid TEXT NOT NULL DEFAULT 'mvp_projects',
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    target_audience TEXT,
    business_model TEXT,
    competition_analysis TEXT,
    unique_value_proposition TEXT,
    success_metrics TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES users(uid)
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating projects table:', err.message);
    } else {
      console.log('[DB] Projects table ready');
    }
  });

  // Roadmap documents table
  db.run(`CREATE TABLE IF NOT EXISTS roadmap_documents (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tid TEXT NOT NULL DEFAULT 'roadmap_documents',
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'generated',
    generated_at INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating roadmap_documents table:', err.message);
    } else {
      console.log('[DB] Roadmap documents table ready');
    }
  });

  // User diagrams table
  db.run(`CREATE TABLE IF NOT EXISTS user_diagrams (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tid TEXT NOT NULL DEFAULT 'user_diagrams',
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    diagram_type TEXT NOT NULL,
    diagram_code TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating user_diagrams table:', err.message);
    } else {
      console.log('[DB] User diagrams table ready');
    }
  });

  // Teams table
  db.run(`CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tid TEXT NOT NULL DEFAULT 'teams',
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (owner_id) REFERENCES users(uid)
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating teams table:', err.message);
    } else {
      console.log('[DB] Teams table ready');
    }
  });

  // Team members table
  db.run(`CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tid TEXT NOT NULL DEFAULT 'team_members',
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(uid)
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating team_members table:', err.message);
    } else {
      console.log('[DB] Team members table ready');
    }
  });

  // Team invitations table
  db.run(`CREATE TABLE IF NOT EXISTS team_invitations (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tid TEXT NOT NULL DEFAULT 'team_invitations',
    team_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'pending',
    token TEXT NOT NULL,
    invited_at INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating team_invitations table:', err.message);
    } else {
      console.log('[DB] Team invitations table ready');
    }
  });

  // Team activities table
  db.run(`CREATE TABLE IF NOT EXISTS team_activities (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tid TEXT NOT NULL DEFAULT 'team_activities',
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(uid)
  )`, (err) => {
    if (err) {
      console.error('[DB] Error creating team_activities table:', err.message);
    } else {
      console.log('[DB] Team activities table ready');
    }
  });
});

// Registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  console.log('[REGISTER] Incoming:', { email, name });
  if (!email || !password || !name) {
    console.error('[REGISTER] Missing fields:', { email, password, name });
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }
  
  // More detailed debugging for the request
  console.log('[REGISTER] Full request body:', req.body);
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('[REGISTER] DB error on select:', err);
      console.error('[REGISTER] Error details:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    if (user) {
      console.error('[REGISTER] User already exists:', email);
      return res.status(409).json({ error: 'User already exists.' });
    }
    
    const passwordHash = bcrypt.hashSync(password, 10);
    const uid = `uid-${Date.now()}`;
    const createdTime = Date.now();
    
    console.log('[REGISTER] About to insert:', { email, name, uid, createdTime });
    
    db.run(
      'INSERT INTO users (email, passwordHash, name, uid, createdTime, lastLoginTime) VALUES (?, ?, ?, ?, ?, ?)',
      [email, passwordHash, name, uid, createdTime, null],
      function (err) {
        if (err) {
          console.error('[REGISTER] DB error on insert:', err);
          console.error('[REGISTER] Error details:', err.message, err.code);
          return res.status(500).json({ error: 'Registration failed.' });
        }
        console.log('[REGISTER] Success:', { uid, email, name });
        return res.json({
          user: { uid, email, name, createdTime, lastLoginTime: null }
        });
      }
    );
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const lastLoginTime = Date.now();
    db.run('UPDATE users SET lastLoginTime = ? WHERE email = ?', [lastLoginTime, email]);
    return res.json({
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        createdTime: user.createdTime,
        lastLoginTime
      }
    });
  });
});

// ===== PROJECT ENDPOINTS =====

// Create project
app.post('/api/projects', authenticateUser, (req, res) => {
  const { name, industry, problem_statement, target_audience, business_model, competition_analysis, unique_value_proposition, success_metrics } = req.body;
  
  if (!name || !industry || !problem_statement) {
    return res.status(400).json({ error: 'Name, industry, and problem statement are required' });
  }
  
  const projectId = generateId();
  const now = Date.now();
  
  db.run(
    `INSERT INTO projects (id, uid, name, industry, problem_statement, target_audience, business_model, competition_analysis, unique_value_proposition, success_metrics, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [projectId, req.user.uid, name, industry, problem_statement, target_audience || '', business_model || '', competition_analysis || '', unique_value_proposition || '', success_metrics || '', now, now],
    function(err) {
      if (err) {
        console.error('[PROJECTS] Create error:', err);
        return res.status(500).json({ error: 'Failed to create project' });
      }
      
      res.json({
        _id: projectId,
        _uid: req.user.uid,
        _tid: 'mvp_projects',
        name,
        industry,
        problem_statement,
        target_audience: target_audience || '',
        business_model: business_model || '',
        competition_analysis: competition_analysis || '',
        unique_value_proposition: unique_value_proposition || '',
        success_metrics: success_metrics || '',
        created_at: now,
        updated_at: now
      });
    }
  );
});

// Get all projects for user
app.get('/api/projects', authenticateUser, (req, res) => {
  db.all('SELECT * FROM projects WHERE uid = ? ORDER BY updated_at DESC LIMIT 50', [req.user.uid], (err, rows) => {
    if (err) {
      console.error('[PROJECTS] Get error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    
    const projects = rows.map(row => ({
      _id: row.id,
      _uid: row.uid,
      _tid: row.tid,
      name: row.name,
      industry: row.industry,
      problem_statement: row.problem_statement,
      target_audience: row.target_audience,
      business_model: row.business_model,
      competition_analysis: row.competition_analysis,
      unique_value_proposition: row.unique_value_proposition,
      success_metrics: row.success_metrics,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json({ items: projects });
  });
});

// Update project
app.put('/api/projects/:id', authenticateUser, (req, res) => {
  const projectId = req.params.id;
  const { name, industry, problem_statement, target_audience, business_model, competition_analysis, unique_value_proposition, success_metrics } = req.body;
  
  const now = Date.now();
  
  db.run(
    `UPDATE projects SET name = ?, industry = ?, problem_statement = ?, target_audience = ?, business_model = ?, competition_analysis = ?, unique_value_proposition = ?, success_metrics = ?, updated_at = ?
     WHERE id = ? AND uid = ?`,
    [name, industry, problem_statement, target_audience || '', business_model || '', competition_analysis || '', unique_value_proposition || '', success_metrics || '', now, projectId, req.user.uid],
    function(err) {
      if (err) {
        console.error('[PROJECTS] Update error:', err);
        return res.status(500).json({ error: 'Failed to update project' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({ success: true, updated_at: now });
    }
  );
});

// Delete project
app.delete('/api/projects/:id', authenticateUser, (req, res) => {
  const projectId = req.params.id;
  
  db.run('DELETE FROM projects WHERE id = ? AND uid = ?', [projectId, req.user.uid], function(err) {
    if (err) {
      console.error('[PROJECTS] Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true });
  });
});

// ===== DOCUMENT ENDPOINTS =====

// Create document
app.post('/api/documents', authenticateUser, (req, res) => {
  const { project_id, title, document_type, content } = req.body;
  
  if (!project_id || !title || !document_type || !content) {
    return res.status(400).json({ error: 'Project ID, title, document type, and content are required' });
  }
  
  const documentId = generateId();
  const now = Date.now();
  
  db.run(
    `INSERT INTO roadmap_documents (id, uid, project_id, title, document_type, content, generated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [documentId, req.user.uid, project_id, title, document_type, content, now],
    function(err) {
      if (err) {
        console.error('[DOCUMENTS] Create error:', err);
        return res.status(500).json({ error: 'Failed to create document' });
      }
      
      res.json({
        _id: documentId,
        _uid: req.user.uid,
        _tid: 'roadmap_documents',
        project_id,
        title,
        document_type,
        content,
        status: 'generated',
        generated_at: now
      });
    }
  );
});

// Get documents (optionally filtered by project)
app.get('/api/documents', authenticateUser, (req, res) => {
  const { project_id } = req.query;
  
  let query = 'SELECT * FROM roadmap_documents WHERE uid = ?';
  let params = [req.user.uid];
  
  if (project_id) {
    query += ' AND project_id = ?';
    params.push(project_id);
  }
  
  query += ' ORDER BY generated_at DESC LIMIT 100';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('[DOCUMENTS] Get error:', err);
      return res.status(500).json({ error: 'Failed to fetch documents' });
    }
    
    const documents = rows.map(row => ({
      _id: row.id,
      _uid: row.uid,
      _tid: row.tid,
      project_id: row.project_id,
      title: row.title,
      document_type: row.document_type,
      content: row.content,
      status: row.status,
      generated_at: row.generated_at
    }));
    
    res.json({ items: documents });
  });
});

// Update document
app.put('/api/documents/:id', authenticateUser, (req, res) => {
  const documentId = req.params.id;
  const { title, content, status } = req.body;
  
  db.run(
    `UPDATE roadmap_documents SET title = ?, content = ?, status = ?
     WHERE id = ? AND uid = ?`,
    [title, content, status, documentId, req.user.uid],
    function(err) {
      if (err) {
        console.error('[DOCUMENTS] Update error:', err);
        return res.status(500).json({ error: 'Failed to update document' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      res.json({ success: true });
    }
  );
});

// Delete document
app.delete('/api/documents/:id', authenticateUser, (req, res) => {
  const documentId = req.params.id;
  
  db.run('DELETE FROM roadmap_documents WHERE id = ? AND uid = ?', [documentId, req.user.uid], function(err) {
    if (err) {
      console.error('[DOCUMENTS] Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete document' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ success: true });
  });
});

// ===== DIAGRAM ENDPOINTS =====

// Create diagram
app.post('/api/diagrams', authenticateUser, (req, res) => {
  const { project_id, title, diagram_type, diagram_code } = req.body;
  
  if (!project_id || !title || !diagram_type || !diagram_code) {
    return res.status(400).json({ error: 'Project ID, title, diagram type, and diagram code are required' });
  }
  
  const diagramId = generateId();
  const now = Date.now();
  
  db.run(
    `INSERT INTO user_diagrams (id, uid, project_id, title, diagram_type, diagram_code, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [diagramId, req.user.uid, project_id, title, diagram_type, diagram_code, now],
    function(err) {
      if (err) {
        console.error('[DIAGRAMS] Create error:', err);
        return res.status(500).json({ error: 'Failed to create diagram' });
      }
      
      res.json({
        _id: diagramId,
        _uid: req.user.uid,
        _tid: 'user_diagrams',
        project_id,
        title,
        diagram_type,
        diagram_code,
        created_at: now
      });
    }
  );
});

// Get diagrams (optionally filtered by project)
app.get('/api/diagrams', authenticateUser, (req, res) => {
  const { project_id } = req.query;
  
  let query = 'SELECT * FROM user_diagrams WHERE uid = ?';
  let params = [req.user.uid];
  
  if (project_id) {
    query += ' AND project_id = ?';
    params.push(project_id);
  }
  
  query += ' ORDER BY created_at DESC LIMIT 50';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('[DIAGRAMS] Get error:', err);
      return res.status(500).json({ error: 'Failed to fetch diagrams' });
    }
    
    const diagrams = rows.map(row => ({
      _id: row.id,
      _uid: row.uid,
      _tid: row.tid,
      project_id: row.project_id,
      title: row.title,
      diagram_type: row.diagram_type,
      diagram_code: row.diagram_code,
      created_at: row.created_at
    }));
    
    res.json({ items: diagrams });
  });
});

// Update diagram
app.put('/api/diagrams/:id', authenticateUser, (req, res) => {
  const diagramId = req.params.id;
  const { title, diagram_type, diagram_code } = req.body;
  
  db.run(
    `UPDATE user_diagrams SET title = ?, diagram_type = ?, diagram_code = ?
     WHERE id = ? AND uid = ?`,
    [title, diagram_type, diagram_code, diagramId, req.user.uid],
    function(err) {
      if (err) {
        console.error('[DIAGRAMS] Update error:', err);
        return res.status(500).json({ error: 'Failed to update diagram' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Diagram not found' });
      }
      
      res.json({ success: true });
    }
  );
});

// Delete diagram
app.delete('/api/diagrams/:id', authenticateUser, (req, res) => {
  const diagramId = req.params.id;
  
  db.run('DELETE FROM user_diagrams WHERE id = ? AND uid = ?', [diagramId, req.user.uid], function(err) {
    if (err) {
      console.error('[DIAGRAMS] Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete diagram' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    
    res.json({ success: true });
  });
});

// Health check
app.get('/api/auth/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Auth server running with SQLite on http://localhost:${PORT}`);
});
