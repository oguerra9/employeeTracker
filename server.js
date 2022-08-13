const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const dbAPI = require('./queries.js');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const validateNum = async (num) => {
    if (!isNaN(num)) {
        return true;
    }
    else {
        return 'Please enter a numeric value...';
    }
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

// async function insertEmployee (firstName, lastName, roleID, managerID) {
//     await dbAPI.addEmployee(firstName, lastName, roleID, managerID);
// }

async function getEmployeeNamesArr () {
    const employeeArr = await dbAPI.getEmployees();
    let employeeChoices = [];
    let employeeName = '';

    for (var i = 0; i < employeeArr.length; i++) {
        employeeName = new EmployeeName(employeeArr[i].id, employeeArr[i].first_name, employeeArr[i].last_name);
        employeeChoices.push(employeeName);
    }
    return employeeChoices;
}

async function getManagerNameArr () {
    const managersArr = await dbAPI.getManagers();
    let managerNames = [];
    let managerName = '';

    for (var i = 0; i < managersArr.length; i++) {
        managerName = new EmployeeName(managersArr[i].id, managersArr[i].first_name, managersArr[i].last_name);
        managerNames.push(managerName);
    }
    return managerNames;
}

async function getRolesArr() {
    const rolesArr = await dbAPI.getRoles();
    let titlesArr = [];
    let title = '';   
    for (var i = 0; i < rolesArr.length; i++) {
        title = new SimpleRole(rolesArr[i].id, rolesArr[i].title);
        titlesArr.push(title);
    }
    return titlesArr;
}

async function getDepartmentsArr () {
    const deptArr = await dbAPI.getDepartments();
    let namesArr = [];
    let deptName = '';

    for (var i = 0; i < deptArr.length; i++) {
        deptName = new DepartmentInfo(deptArr[i].id, deptArr[i].department_name);
        namesArr.push(deptName);
    }
    return namesArr;
}



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
    .then (async function (response) {
        await dbAPI.addDepartment(response.newDepartment)
        menu()
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
            validate: validateNum,
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
        dbAPI.addRole(response.title, response.salary, deptArr[deptNum].id)
        menu()
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
    .then (async function(response) {
        var roleNum = roleChoices.indexOf(response.role)
        var managerID;
        if (!(response.manager == 'N/A')) {
            var managerNum = managerChoices.indexOf(response.manager)
            managerID = managersArr[managerNum].id
        }
        console.log('adding employee...')
        await dbAPI.addEmployee(response.firstName, response.lastName, rolesArr[roleNum].id, managerID)
        menu()
    })
}


const updateRole = async () => {
    const employeeArr = await getEmployeeNamesArr();
    let employeeChoices = [];
    employeeArr.forEach((employee) => employeeChoices.push(employee.getName()));

    const rolesArr = await getRolesArr();
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
    .then(async function (response)  {
        var empNum = employeeChoices.indexOf(response.employee)
        var roleNum = roleChoices.indexOf(response.newRole)
        console.log('updating role...')
        await dbAPI.updateRole(rolesArr[roleNum].id, employeeArr[empNum].id)
        menu()
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
        await dbAPI.displayDepartments();
        menu();
    }
            
    else if (response === 'View all roles') {
        await dbAPI.displayRoles();
        menu();
    }
            
    else if (response === 'View all employees') {
        await dbAPI.displayEmployees();
        menu();
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
    console.log(`\nServer running on port ${PORT}\n`);
});