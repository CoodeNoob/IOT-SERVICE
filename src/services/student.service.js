const { Student } = require('../models');

async function RegisterStudent(name, email, password) {
    return Student.create({
        name: name,
        email: email,
        password: password
    })
}

async function FindByEmail(email) {
    return Student.findOne({
        where: { email },
        raw: true
    })
}

module.exports = {
    RegisterStudent,
    FindByEmail
}
