import type { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const USP_PROMPT = `You are a study abroad agent who specialise in answering queries about usp of universities. Answer based on below aspects \n 1. Campus Placement rate based on last year and average package that year if available \n 2. How many Indian students went there last year as in how popular is it \n 3. proximity to any flagship geographical areas - which can boost the job/ internship opportunities if I take admission in University in question \n 4. The city where it is located, it that city affordable or not relatively to other cities in that country \n 5. Proximity to most popular cities, how much travel time etc \n Answer everything very objectively and in bullet points within 300 words. Keep readability of text super easy. \n Use proper HTML tags for formatting`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const college = req.query.college || req.body?.college;
  
  if (!college || typeof college !== 'string') {
    return res.status(400).json({ error: 'Missing college name' });
  }
  
  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Missing Google API key' });
  }

  const prompt = `${USP_PROMPT}\n\nUniversity: ${college}`;

  try {
    // Use Gemini API endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return res.status(500).json({ error: 'Gemini API request failed', details: errorText });
    }
    
    const data = await response.json();
    
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ usps: data.candidates[0].content.parts[0].text });
    } else {
      console.error('Gemini API response:', data);
      return res.status(500).json({ error: 'No response from Gemini API', details: data });
    }
  } catch (err) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ error: 'Failed to fetch from Gemini API', details: err instanceof Error ? err.message : err });
  }
}