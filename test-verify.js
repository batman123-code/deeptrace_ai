const http = require('http');

async function testAudioVerification() {
  console.log("Testing Audio Verification API...");

  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const audioData = Buffer.from('ID3300000000FakeMp3HeaderDataStreamForAudioTestingPurposes');
  
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="media"; filename="sample_speech_recording.mp3"\r\n`;
  body += `Content-Type: audio/mp3\r\n\r\n`;
  body += audioData.toString('binary');
  body += `\r\n--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="claimedContext"\r\n\r\n`;
  body += `Alleged speech recording from news event\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="type"\r\n\r\n`;
  body += `audio\r\n`;
  body += `--${boundary}--\r\n`;

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/verify',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body, 'binary')
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    res.on('end', () => {
      console.log(`[Audio Test] Status: ${res.statusCode}`);
      try {
        const json = JSON.parse(responseData);
        console.log(`[Audio Test] Verdict:`, json.forensicAnalysis?.verdict);
        console.log(`[Audio Test] Summary:`, json.forensicAnalysis?.summary);
        console.log(`[Audio Test] Model:`, json.forensicAnalysis?.model);
        console.log(`[Audio Test] Claims:`, json.forensicAnalysis?.claims);
      } catch (e) {
        console.log(`[Audio Test] Raw response:`, responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`[Audio Test Failed]: ${e.message}`);
  });

  req.write(body, 'binary');
  req.end();
}

testAudioVerification();
