const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const dbAPI = require('./queries.js');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//checks that the value of 'num' is an integer
const validateNum = async (num) => {
    if (!isNaN(num)) {
        return true;
    }
    else { //if the entered value is not an integer, the message is returned and the user cannot move on to the next prompt until a numeric value has beeen entered
        return 'Please enter a numeric value...';
    }
};

//defines an simple employee object to make listing available employee's names more simple
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

//creates an object to make displaying available roles more simplistic
class SimpleRole {
    constructor (id, title) {
        this.id = id;
        this.title = title;
    }
}  

//creates an object to make displaying departments as a list more simple
class DepartmentInfo {
    constructor (id, name) {
        this.id = id;
        this.name = name;
    }
}

//creates an array containing a list of names of current employees in the employees table of the database
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

//creates an array of manager names from the employees table of the database
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

//creates an array of role titles from the roles table of the database
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

//creates an array of department names from the departments table of the database
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
        //gets the number of the department selection made i order to obtain the correct department's id
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
    //creates an array of possibel role choices to be displayed
    rolesArr.forEach((role) => roleChoices.push(role.title));

    const managersArr = await getManagerNameArr();
    let managerChoices = [];
    //creates an array of possible manager choices to be displayed
    managersArr.forEach((manager) => managerChoices.push(manager.getName()));
    //add 'N/A' to the list of choiceds in the event that the employee being added is a manager themselves and does not have a manager above them
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
        //gets the index of the selected role
        var roleNum = roleChoices.indexOf(response.role)
        //declares but does not define the manager id variable in order to set the new employees managerid to null in the even 'N/A' was selected
        var managerID;
        if (!(response.manager == 'N/A')) {
            //if 'N/A' was not selected and the new employee has a manager, the index of the selection is found
            var managerNum = managerChoices.indexOf(response.manager)
            //the id of the manager is obtained by getting the id of the manager selected
            managerID = managersArr[managerNum].id
        }
        console.log('adding employee...')
        //the employee is added to the employees table of the database
        await dbAPI.addEmployee(response.firstName, response.lastName, rolesArr[roleNum].id, managerID)
        menu()
    })
}

//updates the role of an employee 
const updateRole = async () => {
    //gets an array of employee obects including their names and ids
    const employeeArr = await getEmployeeNamesArr();
    let employeeChoices = [];
    //creates an array of employees to choose from
    employeeArr.forEach((employee) => employeeChoices.push(employee.getName()));

    //gets an array of role objects including their titles and ids
    const rolesArr = await getRolesArr();
    let roleChoices = [];
    //creates an array of roles to choose from
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
        //finds the index of the selected employee in the array of employee choices
        var empNum = employeeChoices.indexOf(response.employee)
        //finds the index of the selected role in the array of role choices
        var roleNum = roleChoices.indexOf(response.newRole)
        console.log('updating role...')
        //updates the employee's role
        await dbAPI.updateRole(rolesArr[roleNum].id, employeeArr[empNum].id)
        menu()
    })
}

//displays the app's main menu
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
    .then (async function (response)  {  
        //calls the appropriate function for each menu option    
        if (response.selection === 'View all departments') {
            await dbAPI.displayDepartments();
            menu();
        }
                
        else if (response.selection === 'View all roles') {
            await dbAPI.displayRoles();
            menu();
        }
                
        else if (response.selection === 'View all employees') {
            await dbAPI.displayEmployees();
            menu();
        }
                            
        else if (response.selection == 'Add a department') {
            try {
                addDepartment();
            }
            catch (error) {
                throw new Error ('department could not be added');
            }
        }
                    
        else if (response.selection === 'Add a role')
            try {
                addRole();
            }
            catch (error) {
                throw new Error ('role could not be added');
            }
        
        else if (response.selection === 'Add an employee')
            try {
                addEmployee();
            }
            catch (error) {
                throw new Error ('employee could not be added');
            }
                    
        else if (response.selection === 'Update an employee role') {
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
    })
};

menu();

app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`\nServer running on port ${PORT}\n`);
});