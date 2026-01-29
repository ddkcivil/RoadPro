// Script to clear localStorage and demonstrate empty data state
// Run this in browser console to test clean start

console.log('Clearing localStorage to demonstrate empty data state...');
localStorage.clear();
console.log('localStorage cleared. Refresh the page to see empty state.');
console.log('Users:', localStorage.getItem('roadmaster-users'));
console.log('Projects:', localStorage.getItem('roadmaster-projects'));
console.log('Messages:', localStorage.getItem('roadmaster-messages'));