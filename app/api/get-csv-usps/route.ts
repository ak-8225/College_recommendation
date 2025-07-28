import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, collegeName, program } = await request.json();
    
    console.log(`[CSV USP API] Fetching USPs for phone: ${phone}, college: ${collegeName}, program: ${program}`);
    
    // Fetch the CSV data from the new sheet with program-specific USPs
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTr0rMEUltIom1ACFl16G4L_VO9NNfgsMlK3HnQlFyDdQRQ3xHjMVAzvz5SMxsucL0FEUR4yQMVdKBj/pub?output=csv";
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    // Parse CSV manually with better comma handling
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV has no data');
    }
    
    // Better CSV parsing to handle commas within quoted fields
    function parseCSVLine(line: string): string[] {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
    console.log('[CSV USP API] Headers:', headers);
    console.log('[CSV USP API] Headers count:', headers.length);
    
    // Helper function to normalize phone numbers for matching
    const normalizePhone = (phoneStr: string): string => {
      return String(phoneStr || '').replace(/\D/g, '').trim();
    };
    
    const targetPhone = normalizePhone(phone);
    console.log(`[CSV USP API] Looking for phone: "${targetPhone}"`);
    
    // Find matching row by phone number AND college+program combination
    let matchedRow: string[] | null = null;
    let phoneColumnIndex = -1;
    let collegeColumnIndex = -1;
    let programColumnIndex = -1;
    
    // Find the column indices
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      if (header.includes('phone')) {
        phoneColumnIndex = i;
      } else if (header.includes('college') || header.includes('university')) {
        collegeColumnIndex = i;
      } else if (header.includes('program') || header.includes('course')) {
        programColumnIndex = i;
      }
    }
    
    if (phoneColumnIndex === -1) {
      throw new Error('Phone column not found in CSV');
    }
    if (collegeColumnIndex === -1) {
      throw new Error('College column not found in CSV');
    }
    if (programColumnIndex === -1) {
      throw new Error('Program column not found in CSV');
    }
    
    console.log(`[CSV USP API] Column indices - Phone: ${phoneColumnIndex}, College: ${collegeColumnIndex}, Program: ${programColumnIndex}`);
    
    // Debug: Show what we're looking for
    console.log(`[CSV USP API] Searching for - Phone: "${targetPhone}", College: "${collegeName}", Program: "${program}"`);
    
    // Find matching row by phone AND college+program
    for (let i = 1; i < lines.length; i++) {
      const cells = parseCSVLine(lines[i]).map(c => c.replace(/^["']|["']$/g, '').trim());
      
      if (cells.length <= Math.max(phoneColumnIndex, collegeColumnIndex, programColumnIndex)) continue;
      
      const csvPhone = normalizePhone(cells[phoneColumnIndex] || '');
      const csvCollege = cells[collegeColumnIndex] || '';
      const csvProgram = cells[programColumnIndex] || '';
      
      // Debug: Show what we found in this row
      console.log(`[CSV USP API] Row ${i} - Phone: "${csvPhone}", College: "${csvCollege}", Program: "${csvProgram}"`);
      
      // Check phone match
      let phoneMatches = false;
      if (csvPhone === targetPhone) {
        phoneMatches = true;
      } else if (targetPhone.length >= 10 && csvPhone.length >= 10) {
        const targetLast10 = targetPhone.slice(-10);
        const csvLast10 = csvPhone.slice(-10);
        if (targetLast10 === csvLast10) {
          phoneMatches = true;
        }
      }
      
      // Check college and program match (case insensitive, partial matching)
      const collegeMatches = csvCollege.toLowerCase().includes(collegeName.toLowerCase()) || 
                            collegeName.toLowerCase().includes(csvCollege.toLowerCase());
      const programMatches = csvProgram.toLowerCase().includes(program.toLowerCase()) || 
                            program.toLowerCase().includes(csvProgram.toLowerCase());
      
      console.log(`[CSV USP API] Row ${i} matches - Phone: ${phoneMatches}, College: ${collegeMatches}, Program: ${programMatches}`);
      
      if (phoneMatches && collegeMatches && programMatches) {
        matchedRow = cells;
        console.log(`[CSV USP API] Match found - Phone: ${phoneMatches}, College: "${csvCollege}", Program: "${csvProgram}"`);
        break;
      }
    }
    
    if (!matchedRow) {
      console.log(`[CSV USP API] No match found for phone: ${phone}, college: ${collegeName}, program: ${program}`);
      return NextResponse.json({ 
        usps: [`No USPs found for ${collegeName} - ${program}`] 
      });
    }

    console.log(`[CSV USP API] Found matching row for ${collegeName} - ${program}:`, matchedRow.slice(0, 5));

    // Define the USP column names to extract - get ALL USPs for this program-college
    const uspColumnNames = [
      "Get a job",
      "Get a PR/settle in abroad", 
      "Return to India",
      "Research/PhD etc.",
      "Cost/Budget",
      "Research opportunities",
      "Job opportunities/Recruits",
      "Alum network",
      "Locations",
      "Quality of Education"
    ];

    // Extract ALL USPs from ALL specified columns for this program-college
    const usps: string[] = [];
    
    console.log(`[CSV USP API] Extracting ALL USPs for ${collegeName} - ${program} from columns:`, uspColumnNames);
    
    uspColumnNames.forEach(columnName => {
      // Try multiple matching strategies for column names
      let columnIndex = headers.findIndex(h => 
        h.trim().toLowerCase() === columnName.toLowerCase() ||
        h.trim() === columnName
      );
      
      // If not found, try partial matching
      if (columnIndex === -1) {
        columnIndex = headers.findIndex(h => {
          const headerLower = h.trim().toLowerCase();
          const columnLower = columnName.toLowerCase();
          return headerLower.includes(columnLower) || columnLower.includes(headerLower);
        });
      }
      
      // If still not found, try without spaces/special chars
      if (columnIndex === -1) {
        const cleanColumnName = columnName.replace(/[^a-zA-Z]/g, '').toLowerCase();
        columnIndex = headers.findIndex(h => {
          const cleanHeader = h.replace(/[^a-zA-Z]/g, '').toLowerCase();
          return cleanHeader === cleanColumnName;
        });
      }
      
      console.log(`[CSV USP API] Column "${columnName}" found at index: ${columnIndex}`);
      
      if (columnIndex !== -1 && columnIndex < matchedRow!.length) {
        const cellValue = matchedRow![columnIndex]?.trim();
        console.log(`[CSV USP API] Cell value for "${columnName}":`, cellValue);
        
        if (cellValue && cellValue !== '' && cellValue.toLowerCase() !== 'null' && cellValue !== '0' && cellValue !== 'false') {
          // Clean up the USP text
          let uspText = cellValue;
          
          // Remove quotes if present
          uspText = uspText.replace(/^["']|["']$/g, '');
          
          // Only add if it's meaningful content
          if (uspText.length > 1 && !usps.includes(uspText)) {
            console.log(`[CSV USP API] Adding USP: "${uspText}"`);
            usps.push(uspText);
          }
        }
      } else {
        console.log(`[CSV USP API] Column "${columnName}" not found or out of range`);
      }
    });    console.log(`[CSV USP API] Extracted ALL USPs for ${collegeName} - ${program}:`, usps);
    
    if (usps.length === 0) {
      return NextResponse.json({ 
        usps: [`No valid USPs found for ${collegeName} - ${program}`] 
      });
    }
    
    return NextResponse.json({ usps });
    
  } catch (error) {
    console.error('[CSV USP API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch USPs',
      usps: ['Error loading USPs'] 
    }, { status: 500 });
  }
}
