CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,   
    username VARCHAR(50) NOT NULL,             
    email VARCHAR(100) NOT NULL,            
    password VARCHAR(255),                  
    created_date DATE                       
);

CREATE TABLE bank_accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,  
    user_id INT NOT NULL,                       
    account_name VARCHAR(100) NOT NULL,         
    balance DECIMAL(10,2),                      
    account_type VARCHAR(20),                   
    bank_name VARCHAR(100),                    
    FOREIGN KEY (user_id) REFERENCES users(user_id)  
);

CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,  
    category_name VARCHAR(50) NOT NULL,         
    description VARCHAR(200),                    
    icon VARCHAR(50)                             
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,  
    account_id INT NOT NULL,                       
    user_id INT NOT NULL,                          
    category_id INT NOT NULL,                      
    transaction_date DATE NOT NULL,                
    amount DECIMAL(10,2) NOT NULL,                 
    description VARCHAR(200),                      
    transaction_type VARCHAR(20) NOT NULL,         
    status VARCHAR(20) DEFAULT 'pending',          
    FOREIGN KEY (account_id) REFERENCES bank_accounts(account_id),  
    FOREIGN KEY (user_id) REFERENCES users(user_id),                
    FOREIGN KEY (category_id) REFERENCES categories(category_id)   
);

ALTER TABLE transactions 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' AFTER transaction_type;

UPDATE transactions 
SET status = 'pending' 
WHERE status IS NULL AND transaction_id > 0;

CREATE TABLE IF NOT EXISTS goals (
    goal_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    goal_type VARCHAR(20) NOT NULL, 
    period VARCHAR(20) NOT NULL, 
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


