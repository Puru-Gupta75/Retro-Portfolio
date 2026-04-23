console.log('=== Environment Check ===');
console.log('Current Working Directory:', process.cwd());
console.log('Script Directory:', __dirname);
console.log('');

try {
  const tailwindPath = require.resolve('tailwindcss');
  console.log('✓ tailwindcss resolved:', tailwindPath);
} catch (e) {
  console.log('✗ tailwindcss NOT found:', e.message);
}

try {
  const postcssPath = require.resolve('@tailwindcss/postcss');
  console.log('✓ @tailwindcss/postcss resolved:', postcssPath);
} catch (e) {
  console.log('✗ @tailwindcss/postcss NOT found:', e.message);
}

console.log('');
console.log('Expected project root:', 'C:\\Users\\Ananya Gupta\\Desktop\\Puru\\Code\\Portfolio');
console.log('Matches CWD:', process.cwd() === 'C:\\Users\\Ananya Gupta\\Desktop\\Puru\\Code\\Portfolio');
