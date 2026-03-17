import { createClient } from '@supabase/supabase-js';

// These should be set in your environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testHistoryInsert() {
  const testDocId = 'some-valid-doc-id-here'; // Replace with a real ID for better testing
  console.log('Testing history insert...');
  
  const { data, error } = await supabase.from('document_history').insert({
    document_id: testDocId,
    status: 'acknowledged',
    comment: 'Test acknowledgement',
    updated_by: 'Test Bot'
  }).select();

  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert succeeded:', data);
  }
}

// Since I can't easily run this in the user's browser context directly with env vars,
// I'll instead check the Supabase calls in documents.ts more carefully.
