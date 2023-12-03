const b = require('bcryptjs');

let password = b.hashSync('1234');
console.log(password)
let pwd = b.compareSync('1234','$2a$09$Jvj5j4jionoFnOTpXmJ4TOA.OjevmBbpz4dJoAQk6dSUZ5KKABAF.')
console.log(pwd)

console.log(b.compareSync('rj','$2a$10$XQYlJ8Cf0PDGa..fmPddS.MVAGwVpeDQ2k.CK/7Jpa2bOUOXDMDuW'))