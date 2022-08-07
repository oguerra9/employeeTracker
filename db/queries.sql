-- view all departments
SELECT * FROM departments;

-- view all roles
SELECT * FROM roles;

-- view all employees
SELECT * FROM employees;

-- add a department
INSERT INTO departments (department_name)
VALUE ("test");

-- add a role
INSERT INTO roles (title, salary, department_id)
VALUE ('test',123000,1);

-- add an employee
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUE("test","test",2,1);

-- update an employee role
UPDATE roles
SET role = 'Sales'
WHERE name = 