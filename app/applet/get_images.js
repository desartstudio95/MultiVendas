async function run() {
  const res1 = await fetch('https://ibb.co/fzvC9KYt');
  const text1 = await res1.text();
  const match1 = text1.match(/<meta property="og:image" content="([^"]+)"/);
  console.log('Image 1:', match1 ? match1[1] : 'not found');

  const res2 = await fetch('https://ibb.co/TD4YbVDJ');
  const text2 = await res2.text();
  const match2 = text2.match(/<meta property="og:image" content="([^"]+)"/);
  console.log('Image 2:', match2 ? match2[1] : 'not found');
}
run();
