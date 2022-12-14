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
        //query returns all rows of the departments table in the business_db database
        db.query('SELECT * FROM departments;', function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
}

dbAPI.getRoles = async () => {
    return new Promise((resolve, reject) => {
        //query returns all rows in the roles table of the departments database
        db.query(`SELECT * FROM roles;`, function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
}

dbAPI.getEmployees = async () => {
    return new Promise((resolve, reject) => {
        //query returns all rows of the employees table in the business_db database
        db.query('SELECT * FROM employees;', function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
}

dbAPI.getManagers = async () => {
    return new Promise((resolve, reject) => {
        //managers are employees when the value of manager_id is equal to null
        //query returns all managers in the employees table of the business_db database
        db.query('SELECT * FROM employees WHERE manager_id IS NULL', function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
}

dbAPI.displayDepartments = async () => {
    // department names and id
    return new Promise((resolve, reject) => {
        // Query database
        //query displays all rows of the departments table in a table 
        db.query(`SELECT * FROM departments`, function (err, results) {
          err ? reject(err) : resolve(console.table('DEPARTMENTS',results))
        });
    });

}

dbAPI.displayRoles = async () => {
    // job title, role id, department name, salary
    return new Promise((resolve, reject) => {
        // Query database
        //query displays information on all rows of the roles table of the business_db database
        db.query(`SELECT roles.id, roles.title AS job_title, departments.department_name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id ORDER BY (roles.id);`, function (err, results) {
          err ? reject(err) : resolve(console.table('ROLES',results))
        });
    });
}

dbAPI.displayEmployees = async () => {
    return new Promise((resolve, reject) => {
        // Query database
        //query displays information on all rows of the employees table of the business_db database
        db.query(`SELECT A.id, A.first_name, A.last_name, C.title, D.department_name, C.salary, CONCAT(B.first_name, ' ', B.last_name) AS manager FROM employees A LEFT JOIN employees B ON A.manager_id = B.id JOIN roles C ON A.role_id = C.id JOIN departments D ON C.department_id = D.id ORDER BY (A.id);`, function (err, results) {
          err ? reject(err) : resolve(console.table('EMPLOYEES',results))
        });
    });
}

dbAPI.addDepartment = async (deptName) => {
    return new Promise((resolve, reject) => {
        //query adds a department with the name of the value of the 'deptName' parameter to the departments table of the business_db database
        db.query(`INSERT INTO departments (department_name) VALUE (?);`, deptName, function (err, results) {
            err ? reject(err) : resolve(console.log('department added'))
        })
    })
}

dbAPI.addRole = async (title, salary, deptID) => {
    return new Promise((resolve, reject) => {
        // Query database
        //query adds a role with the title, salary, and department id specified by the parameters to the roles table of the database
        db.query(`INSERT INTO roles (title, salary, department_id) VALUE (?,?,?);`, [title, salary, deptID], function (err, results) {
            err ? reject(err) : resolve(console.log('role added'))
            //menu()
        })
    })
}

dbAPI.addEmployee = async (firstName, lastName, roleID, managerID) => {
    return new Promise((resolve, reject) => {
        // Query database
        //query adds an employee with the first name, last name, roleID and manager id specified by the paramters to the employees table of the database
        db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUE (?,?,?,?);`, [firstName, lastName, roleID, managerID], function (err, results) {
            err ? reject(err) : resolve(console.log('employee added'))
            
        });
    });
}


dbAPI.updateRole = async(roleID, employeeID) => {
    return new Promise((resolve, reject) => {
        // Query database
        //query updates the role id of the employee with the id specified by the employeeID parameter to the value of the roleID parameter
        db.query(`UPDATE employees SET role_id = ? WHERE id = ?;`, [roleID, employeeID], function (err, results) {
            err ? reject(err) : resolve(console.log('employee role updated'))
            //menu()
        })
    })
}

module.exports = dbAPI;