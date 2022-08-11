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

const getDepartments = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM departments;', function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
};

const getRoles = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM roles;`, function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
};

const getEmployees = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM employees;', function (err, results) {
            err ? reject(err) : resolve(results)
        });
    });
};

const getManagers = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM employees WHERE manager_id IS NULL', function (err, results) {
            err ? reject(err) : resolve(results)
            console.log('getManagers')
            console.log(results)
        });
    });
};

class EmployeeName {
    constructor (id, firstName, lastName) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.getName = () => {
            return this.firstName + ' ' + this.lastName;
        }
    }
}

class SimpleRole {
    constructor (id, title) {
        this.id = id;
        this.title = title;
    }
}  

class DepartmentInfo {
    constructor (id, name) {
        this.id = id;
        this.name = name;
    }
}

async function getEmployeeNameArr () {
    const employeeArr = await getEmployees();
    let employeeChoices = [];
    let employeeName = '';

    //console.log('employeeArr in updateRole(): ');
    //console.log(employeeArr);
    for (var i = 0; i < employeeArr.length; i++) {
        employeeName = new EmployeeName(employeeArr[i].id, employeeArr[i].first_name, employeeArr[i].last_name);
        // employeeName = new EmployeeName(employeeArr[i].id, employeeArr[i].first_name, employeeArr[i].last_name;
        //console.log(employeeName);
        employeeChoices.push(employeeName);
    }
    return employeeChoices;
}

async function getManagerNameArr () {
    const managersArr = await getManagers();
    let managerNames = [];
    let managerName = '';

    for (var i = 0; i < managersArr.length; i++) {
        managerName = new EmployeeName(managersArr[i].id, managersArr[i].first_name, managersArr[i].last_name);
        managerNames.push(managerName);
    }
    return managerNames;
}

async function getRolesArr() {
    const rolesArr = await getRoles();
    let titlesArr = [];
    let title = '';

    console.log(rolesArr);
    
    for (var i = 0; i < rolesArr.length; i++) {
        title = new SimpleRole(rolesArr[i].id, rolesArr[i].title);
        titlesArr.push(title);
    }
    console.log(titlesArr);
    return titlesArr;
}

async function getDepartmentsArr () {
    const deptArr = await getDepartments();
    let namesArr = [];
    let deptName = '';

    for (var i = 0; i < deptArr.length; i++) {
        deptName = new DepartmentInfo(deptArr[i].id, deptArr[i].department_name);
        namesArr.push(deptName);
    }
    return namesArr;
}


const displayDepartments = () => {
    // department names and id
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT * FROM departments`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          console.log('displaying departments...')
          menu()
        });
    });
}

const displayRoles = () => {
    // job title, role id, department name, salary
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT roles.id, roles.title AS job_title, departments.department_name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id ORDER BY (roles.id);`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          console.log('displaying roles...')
          menu()
        });
    });
}

const displayEmployees = () => {
    return new Promise((resolve, reject) => {
        // Query database
        db.query(`SELECT A.id, A.first_name, A.last_name, C.title, D.department_name, C.salary, CONCAT(B.first_name, ' ', B.last_name) AS manager FROM employees A LEFT JOIN employees B ON A.manager_id = B.id JOIN roles C ON A.role_id = C.id JOIN departments D ON C.department_id = D.id ORDER BY (A.id);`, function (err, results) {
          err ? reject(err) : resolve(console.table(results))
          console.log('displaying employees...')
          menu()
        });
    });
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
            // db.query(`INSERT INTO departments (department_name) VALUE (?);`, response.newDepartment, function (err, results) {
            //     if (err) throw err
            //     console.log('adding department')
            //     menu()
            // })
        return new Promise((resolve, reject) => {
            // Query database
            db.query(`INSERT INTO departments (department_name) VALUE (?);`, response.newDepartment, function (err, results) {
                err ? reject(err) : resolve(console.log('department added'))
                menu()
            })
        })
    })
};


//adds a role to the 'roles' table of the 'business_db' database
const addRole = async () => {
    const deptArr = await getDepartmentsArr();
    let deptChoices = [];
    deptArr.forEach((dept) => deptChoices.push(dept.name));
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
            type: 'list',
            message: 'Department:',
            choices: deptChoices,
            name: 'department',
        }
    ])
    .then ((response) => {
        var deptNum = deptChoices.indexOf(response.department)        
        console.log('adding role...')
        return new Promise((resolve, reject) => {
            // Query database
            db.query(`INSERT INTO roles (title, salary, department_id) VALUE (?,?,?);`, [response.title, response.salary, deptArr[deptNum].id], function (err, results) {
                err ? reject(err) : resolve(console.log('role added'))
                menu()
            })
        })
    })
};


//adds an employee to the 'employee' table of the 'business_db' database
const addEmployee = async () => {
    const rolesArr = await getRolesArr();
    let roleChoices = [];
    rolesArr.forEach((role) => roleChoices.push(role.title));

    const managersArr = await getManagerNameArr();
    let managerChoices = [];
    managersArr.forEach((manager) => managerChoices.push(manager.getName()));
    managerChoices.push('N/A');

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
            type: 'list',
            message: 'Role:',
            choices: roleChoices,
            name: 'role',
        },
        {
            type: 'list',
            message: "Manager:",
            choices: managerChoices,
            name: 'manager',
        }
    ])
    .then ((response) => {
        var roleNum = roleChoices.indexOf(response.role)
        var managerID;
        if (!response.manager == 'N/A') {
            var managerNum = managerChoices.indexOf(response.manager)
            managerID = managersArr[managerNum].id
        }
        
        console.log('adding employee...')
        return new Promise((resolve, reject) => {
            // Query database
            db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUE (?,?,?,?);`, [response.firstName, response.lastName, rolesArr[roleNum].id, managerID], function (err, results) {
                err ? reject(err) : resolve(console.log('employee added'))
                menu()
            })
        })
    })
}


const updateRole = async () => {
    const employeeArr = await getEmployeeNameArr();
    let employeeChoices = [];
    employeeArr.forEach((employee) => employeeChoices.push(employee.getName()));

    const rolesArr = await getRolesArr();
    console.log('rolesArr');
    console.log(rolesArr);
    let roleChoices = [];
    rolesArr.forEach((role) => roleChoices.push(role.title));

    inquirer
    .prompt([
        {
            type: 'list',
            message: `Which employee's role would you like to update?`,
            choices: employeeChoices,
            name: 'employee',
        },
        {
            type: 'list',
            message: `Employee's new role title or ID:`,
            choices: roleChoices,
            name: 'newRole',
        }
    ])
    .then((response) => {
        var empNum = employeeChoices.indexOf(response.employee)
        var roleNum = roleChoices.indexOf(response.newRole)
        console.log('updating role...')
        return new Promise((resolve, reject) => {
            // Query database
            db.query(`UPDATE employees SET role_id = ? WHERE id = ?;`, [rolesArr[roleNum].id, employeeArr[empNum].id], function (err, results) {
                err ? reject(err) : resolve(console.log('employee role updated'))
                menu()
            })
        })
    })
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
    })
};

menu();

const queryRes = async (response) => {
    if (response === 'View all departments') {
        await displayDepartments();
    }
            
    else if (response === 'View all roles') {
        await displayRoles();
    }
            
    else if (response === 'View all employees') {
        try {
            displayEmployees();
        }
        catch (error) {
            throw new Error ('employees could not be displayed');
        }
    }
                        
    else if (response == 'Add a department') {
        try {
            addDepartment();
        }
        catch (error) {
            throw new Error ('department could not be added');
        }
    }
                
    else if (response === 'Add a role')
        try {
            addRole();
        }
        catch (error) {
            throw new Error ('role could not be added');
        }
    
    else if (response === 'Add an employee')
        try {
            addEmployee();
            //menu();
        }
        catch (error) {
            throw new Error ('employee could not be added');
        }
                
    else if (response === 'Update an employee role') {
        try {
            updateRole();
            //menu();
        }
        catch (error) {
            throw new Error ('role could not be updated');
        }
    }
                        
    else
        console.log('Please enter valid menu selection');

    
};

app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
