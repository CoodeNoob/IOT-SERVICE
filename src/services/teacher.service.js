const Teacher = require('../models/teacher.model');



async function registerTeacher(name, email, password, role) {
    return Teacher.create(
        {
            name: name,
            email: email,
            password: password,
            role: role
        }
    )
}

async function findByEmail(email) {
    return Teacher.findOne({
        where: { email },
        raw: true
    })
}

module.exports = {
    registerTeacher,
    findByEmail
}