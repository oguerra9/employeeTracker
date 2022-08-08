-- -- view all departments
-- SELECT * FROM departments;

-- -- view all roles
-- SELECT * FROM roles;

-- -- view all employees
-- SELECT * FROM employees;

-- -- add a department
-- INSERT INTO departments (department_name)
-- VALUE ("test");

-- -- add a role
-- INSERT INTO roles (title, salary, department_id)
-- VALUE ('test',123000,1);

-- -- add an employee
-- INSERT INTO employees (first_name, last_name, role_id, manager_id)
-- VALUE("test","test",2,1);

-- -- update an employee role
-- UPDATE roles
-- SET role = 'Sales'
-- WHERE name = 


-- SELECT A.id, A.first_name, A.last_name, C.title, D.department_name, C.salary, CONCAT(B.first_name, B.last_name) AS manager FROM employees A 
-- JOIN employees B ON A.manager_id = B.id 
-- JOIN roles C ON A.role_id = C.id 
-- JOIN departments D ON C.department_id = D.id;


-- SELECT A.*, B.first_name
-- FROM employees A, employees B
-- WHERE A.manager_id = B.id;

-- SELECT A.id, A.first_name, A.last_name, C.title, D.department_name, C.salary, CONCAT(B.first_name, B.last_name) AS manager FROM employees A
-- JOIN employees B ON A.manager_id = B.id
-- JOIN roles C ON A.role_id = C.id 
-- JOIN departments D ON C.department_id = D.id;

-- SELECT A.id, A.first_name, A.last_name, C.title, D.department_name, C.salary, CONCAT(B.first_name, ' ', B.last_name) AS manager FROM employees LEFT JOIN employees B ON A.manager_id = B.id JOIN roles C ON A.role_id = C.id JOIN departments D ON C.department_id = D.id;