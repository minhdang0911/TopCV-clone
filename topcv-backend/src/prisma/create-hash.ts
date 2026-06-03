import * as argon2 from 'argon2';

async function main() {
  const hash = await argon2.hash('12345678a');
  console.log(hash);
}

main();
