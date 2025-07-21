import { promises as fs } from 'fs';
import path from 'path';

const JSON_DIR = path.join(process.cwd(), 'json');
const DATA_FILE = path.join(JSON_DIR, 'userCollegeData.json');

async function ensureJsonDir() {
  try {
    await fs.mkdir(JSON_DIR, { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }
}

async function readData() {
  await ensureJsonDir();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty object
    return {};
  }
}

async function writeData(data) {
  await ensureJsonDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');
  if (!phone) {
    return new Response(JSON.stringify({ error: 'Missing phone parameter' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  const userCollegeDataStore = await readData();
  const data = userCollegeDataStore[phone] || { collegeOrder: [], notes: {} };
  return new Response(JSON.stringify(data), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' } 
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { phone, collegeOrder, notes } = body;
  if (!phone) {
    return new Response(JSON.stringify({ error: 'Missing phone in body' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  const userCollegeDataStore = await readData();
  userCollegeDataStore[phone] = {
    collegeOrder: Array.isArray(collegeOrder) ? collegeOrder : [],
    notes: typeof notes === 'object' && notes !== null ? notes : {},
  };
  await writeData(userCollegeDataStore);
  return new Response(JSON.stringify({ success: true }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' } 
  });
} 