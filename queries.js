const mysql = require('mysql2');
const dbAPI = {}

const db = mysql.createConnection(
    {
        host: 'localhost',
        //MySQL username
        user: 'root',
        //MySQL password
        password: 'kingEddy',
        database: 'business_db'
    },
    console.log(`Connected to the business_db database.`)
);

dbAPI.getDepartments = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM departments;', function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
}

dbAPI.getRoles = async () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM roles;`, function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
}

dbAPI.getEmployees = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM employees;', function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
}

dbAPI.getManagers = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM employees WHERE manager_id IS NULL', function (err, results) {
            err ? reject(err) : resolve(results)
            console.log('getManagers')
            console.log(results)
        });
    });
}

// dbAPI.addDepartment = async (departmentName) => {
//     return new Promise((resolve, reject) => {
//         // Query database
//         db.query(`INSERT INTO departments (department_name) VALUE (?);`, departmentName, function (err, results) {
//             err ? reject(err) : resolve(console.log('department added'))
            
//         })
//     })
// }

dbAPI.displayDepartments = async () => {
    // department names and id
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT * FROM departments`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          console.log('displaying departments...')
        });
    });

}

dbAPI.displayRoles = async () => {
    // job title, role id, department name, salary
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT roles.id, roles.title AS job_title, departments.department_name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id ORDER BY (roles.id);`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          console.log('displaying roles...')
        });
    });
}

dbAPI.displayEmployees = async () => {
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT A.id, A.first_name, A.last_name, C.title, D.department_name, C.salary, CONCAT(B.first_name, ' ', B.last_name) AS manager FROM employees A LEFT JOIN employees B ON A.manager_id = B.id JOIN roles C ON A.role_id = C.id JOIN departments D ON C.department_id = D.id ORDER BY (A.id);`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          console.log('displaying employees...')
        });
    });
}

dbAPI.addEmployee = async (firstName, lastName, roleID, managerID) => {
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUE (?,?,?,?);`, [firstName, lastName, roleID, managerID], function (err, results) {
            err ? reject(err) : resolve(console.log('employee added'))
            
        });
    });
}

module.exports = dbAPI;