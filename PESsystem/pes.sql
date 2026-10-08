CREATE DATABASE pessystem;
USE pessystem;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    department VARCHAR(100);,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'personnel',
        'evaluatee',
        'evaluator'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluator_id INT,
    evaluatee_id INT,
    evaluatee_name VARCHAR(100),
    department VARCHAR(100),
    period_id INT,
    period VARCHAR(100),
    status VARCHAR(30),
    evaluatee_data JSON NULL
    evaluator_comment TEXT NULL,
    evaluator_signature TEXT NULL;
);
INSERT INTO assignments
(evaluator_id, evaluatee_id, evaluatee_name, department, period_id, period, status,evaluatee_data)
VALUES
(2, 5, 'นายสมชาย ใจดี', 'เทคโนโลยีสารสนเทศ', 1, 'รอบที่ 1/2569', 'รอประเมิน', "PDF");

CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_name VARCHAR(100) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    indicator_name VARCHAR(255) NOT NULL,
    weight DECIMAL(5,2) DEFAULT 0,
    evidence_type ENUM('none','pdf','url','both') DEFAULT 'none'
);