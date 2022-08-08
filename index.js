const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
//const ListPrompt = require('inquirer/lib/prompts/list');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

const idDepartment = (department) => {
    db.query(`SELECT id FROM departments WHERE department_name = ?;`, department, function (err, results) {
        return results;
    });
};

// const idDepartment = (department) => {
//     return new Promise((resolve, reject) => {
//       db.query('SELECT id FROM departments WHERE department_name = ?;', department, function (err, results) {
//         console.log(results);
//         err ? reject(err) : resolve(results)
//       });
//     });
// };

const idRole = (role) => {
    db.query(`SELECT id FROM roles WHERE title = ?;`, role, function(err, results) {
        return results;
    });
};

// const idRole = (role) => {
//     return new Promise((resolve, reject) => {
//       db.query('SELECT id FROM roles WHERE title = ?;', role, function (err, results) {
//         console.log(results);
//         err ? reject(err) : resolve(results)
//       });
//     });
// };

const idManager = (lastName) => {
    if (lastName == null) {
        return 0;
    }
    db.query(`SELECT id FROM employees WHERE last_name = ?;`, lastName, function (err, results) {
        if (err) {
            throw err;
        }
        console.log(lastName);
        console.log(results);
        return results;
    });
};

// const idManager = (manager) => {
//     return new Promise((resolve, reject) => {
//       db.query('SELECT id FROM employees WHERE last_name = ?;', manager, function (err, results) {
//         console.log(results);
//         err ? reject(err) : resolve(results)
//       });
//     });
// };


const displayDepartments = () => {
    // department names and id
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT * FROM departments`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          menu()
        });
      });
}

const displayRoles = () => {
    // job title, role id, department name, salary
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT roles.id, roles.title AS job_title, departments.department_name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id;`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          menu()
        });
      });
}

const displayEmployees = () => {
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT A.id, A.first_name, A.last_name, C.title, D.department_name, C.salary, CONCAT(B.first_name, ' ', B.last_name) AS manager FROM employees A LEFT JOIN employees B ON A.manager_id = B.id JOIN roles C ON A.role_id = C.id JOIN departments D ON C.department_id = D.id;`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          menu()
        });
    });
}

const menu = () => {
    inquirer
    .prompt ([
        { 
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View all departments','View all roles','View all employees','Add a department','Add a role','Add an employee','Update an employee role'],
            name: 'selection',
        }
    ])
    .then ((response) => {      
        queryRes(response.selection)
        //menu()
    })
};

menu();

const queryRes = async (response) => {
    if (response === 'View all departments')
        displayDepartments();
            
    else if (response === 'View all roles')
        displayRoles();
            
    else if (response === 'View all employees') 
        displayEmployees();
                        
    else if (response == 'Add a department')
        addDepartment();
                
    else if (response === 'Add a role')
        addRole();
    
    else if (response === 'Add an employee')
        addEmployee();
                
    else if (response === 'Update an employee role')
        updateRole();
                
    else
        console.log('Please enter valid menu selection');

    
};

const displayTable = (tableName) => {
    // db.query(`SELECT * FROM ${tableName}`, function (err, results) {
    //     console.log('\n\n');
    //     console.table(`${tableName}`,results);
    //     console.log('\n\n');
    // });
    return new Promise((resolve, reject) => {
      // Query database
      db.query(`SELECT * FROM ${tableName}`, function (err, results) {
        err ? reject(err) : resolve(console.table(results))
        menu()
      });
    });
    // menu();
};

//adds a department to the 'departments' table of the 'business_db' database
const addDepartment = () => {
    inquirer
    .prompt([ //asks user questions necessary to add a row to the 'departments' table of the 'business_db' database
        {
            type: 'input',
            message: 'Department Name:',
            name: 'newDepartment',
        }
    ])
    .then ((response) => {
        return new Promise((resolve, reject) => {
            // Query database
            db.query(`INSERT INTO departments (department_name) VALUE (?);`, response.newDepartment, function (err, results) {
              err ? reject(err) : resolve('Department added...')
              menu()
            });
          });
        // db.query(`INSERT INTO departments (department_name) VALUE (?);`, response.newDepartment, function (err, results) {
        //     console.log('Department added...')
        //     menu()
        // })
    })
};

//adds a role to the 'roles' table of the 'business_db' database
const addRole = () => {
    inquirer
    .prompt([  //asks user questions necessary to add a row to the 'roles' table of the 'business_db' database
        {
            type: 'input',
            message: 'Role Title:',
            name: 'title',
        },
        {
            type: 'input',
            message: 'Salary: ',
            name: 'salary',
        },
        {
            type: 'input',
            message: 'Department Name or ID:',
            name: 'department',
        }
    ])
    .then ((response) => {
        var dep_id = response.department;
        if (isNaN(response.id)) {
            dep_id = idDepartment(response.id)
        }
        console.log(dep_id)
        return new Promise((resolve, reject) => {
            // Query database
            db.query(`INSERT INTO roles (title, salary, department_id) VALUE (?,?,?);`, [response.title, response.salary, response.department], function (err, results) {
              err ? reject(err) : resolve('Role added...')
              menu()
            });
        });
        // var dep_id = response.department;
        // if (isNaN(response.id)) {
        //     dep_id = idDepartment(response.id)
        // }
        // console.log(dep_id)
        // db.query(`INSERT INTO roles (title, salary, department_id) VALUE (?,?,?);`, [response.title, response.salary, response.department], function (err, results) {
        //     console.log('Role added...')
        //     menu()
        // })
    })
};

//adds an employee to the 'employee' table of the 'business_db' database
const addEmployee = () => {
    inquirer
    .prompt([ //asks user questions necessary to add a row to the 'employee' table of the 'business_db' database
        //first name, last name, role id, manager id
        {
            type: 'input',
            message: 'First Name:',
            name: 'firstName',
        },
        {
            type: 'input',
            message: 'Last Name:',
            name: 'lastName',
        },
        {
            type: 'input',
            message: 'Role title or ID:',
            name: 'role',
        },
        {
            type: 'input',
            message: "Manager's last name or ID:",
            name: 'manager',
        }
    ])
    .then ((response) => {
        var roleID = response.role;
        var managerID = response.manager;
        if (isNaN(roleID)) {
            roleID = idRole(roleID)
        }
        if (isNaN(managerID)) {
            managerID = idManager(managerID)
        }
        console.log(roleID)
        console.log(managerID)
        return new Promise((resolve, reject) => {
            // Query database
            db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUE (?,?,?,?);`, [response.firstName, response.lastName, roleID, managerID], function (err, results) {
              err ? reject(err) : resolve('Employee added...')
              menu()
            });
        });
        // db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUE (?,?,?,?);`, [response.firstName, response.lastName, roleID, managerID], function (err, results) {
        //     console.log('Employee added...')
        //     menu()
        // })
    })
};


const getEmployees = () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT first_name, last_name FROM employees', function (err, results) {
        console.log(results);
        err ? reject(err) : resolve(results)
      });
    });
};


const updateRole = async () => {
    const employeeArr = await getEmployees();
    let employeeChoices = [];
    let employeeName = '';

    console.log('employeeArr in updateRole(): ');
    console.log(employeeArr);
    for (var i = 0; i < employeeArr.length; i++) {
        employeeName = employeeArr[i].first_name + ' ' + employeeArr[i].last_name;
        //console.log(employeeName);
        employeeChoices.push(employeeName);
    }
    console.log('employeeChoices:');
    console.log(employeeChoices);
    inquirer
    .prompt([
        {
            type: 'list',
            message: `Which employee's role would you like to update?`,
            choices: employeeChoices,
            name: 'employee',
        },
        {
            type: 'input',
            message: `Employee's new role title or ID:`,
            name: 'newRole',
        }
    ])
    .then((response) => {
        var roleID = response.newRole
        var empNum = employeeChoices.indexOf(response.employee)
        if (isNaN(roleID)) {
            roleID = idRole(roleID)
        }
        console.log('updating role...')
        db.query(`UPDATE employees SET role_id = ? WHERE first_name = ? AND last_name = ?;`, [roleID, employeeArr[empNum].first_name, employeeArr[empNum].last_name], function (err, results) {
            console.log('employee role updated')
        })
        menu()
    })
}


app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});