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
        // switch (response.selection) {
        //     case 'View all departments':
        //         displayTable('departments')
        //         break
        //     case 'View all roles':
        //         displayTable('roles')
        //         break
        //     case 'View all employees':
        //         displayTable('employees')
        //         break
        //     case 'Add a department':
        //         addDepartment()
        //         break
        //     case 'Add a role':
        //         addRole()
        //         break
        //     case 'Add an employee':
        //         addEmployee()
        //         break
        //     case 'Update employee role':
        //         updateRole()
        //         break
        //     default:
        //         console.log('Please enter valid menu selection')
        // }
        // var choice = response.selection
        // console.log(choice)
        // if (response.selection === 'View all departments')
        //     displayTable('departments')
            
        // else if (response.selection === 'View all roles')
        //     displayTable('roles')
            
        // else if (response.selection === 'View all employees')
        //     displayTable('employees')
                
        // else if (response.selection == 'Add a department')
        //     addDepartment()
                
        // else if (response.selection === 'Add a role')
        //     addRole()
    
        // else if (response.selection === 'Add an employee')
        //     addEmployee()
                
        // else if (response.selection === 'Update employee role')
        //     updateRole()
                
        // else
        //     console.log('Please enter valid menu selection')
        queryRes(response.selection)
        //menu()
    })
};

const queryRes = (response) => {
    if (response === 'View all departments')
        displayTable('departments');
            
    else if (response === 'View all roles')
        displayTable('roles');
            
    else if (response === 'View all employees')
        displayTable('employees');
                
    else if (response == 'Add a department')
        addDepartment();
                
    else if (response === 'Add a role')
        addRole();
    
    else if (response === 'Add an employee')
        addEmployee();
                
    else if (response === 'Update employee role')
        updateRole();
                
    else
        console.log('Please enter valid menu selection');

    
}

const displayTable = (tableName) => {
    db.query(`SELECT * FROM ${tableName}`, function (err, results) {
        console.log('\n\n');
        console.table(`${tableName}`,results);
        console.log('\n\n');
    });
    menu();
};


const addDepartment = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'Department Name:',
            name: 'newDepartment',
        }
    ])
    .then ((response) => {
        db.query(`INSERT INTO departments VALUE (${response.newDepartment})`, function (err, results) {
            console.log('Department added...')
            menu()
        })
    })
};


// const queryRes = (choice) => {
//     switch (choice) {
//         case 'View all departments': 
//             //db query SELECT * FROM departments
//             // Query database using COUNT() and GROUP BY
//             db.query('SELECT * FROM departments', function (err, results) {
//                 console.table(results);
//             });
//             break;
        
//         case 'View all roles':
//             //db query SELECT * FROM roles
//             // Query database using COUNT() and GROUP BY
//             db.query('SELECT * FROM roles', function (err, results) {
//                 console.table(results);
//             });
//             break;

//         case 'View all employees':
//             //db query SELECT * FROM employees
//             db.query('SELECT * FROM employees', function (err, results) {
//                 console.table(results);
//             });
//             break;

//         case 'Add a department':
//             //db query INSERT INTO deparments ()
//             break;

//         case 'Add a role':
//             //db query INSERT INTO roles()
//             break;

//         case 'Add an employee':
//             //db query INSERT INTO employees()
//             break;

//         case 'Update an employee role':
//             //db query to change role in row of employee table
//             break;

//         default:
//             console.log('Please enter a valid menu option');
//     };
// };


menu();

app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});